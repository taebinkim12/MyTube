import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => {
    res.render("users/join", {
        pageTitle: "Join"
    })
}

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    // Confirming Pwd
    if (password !== password2) {
        return res.render("users/join", { 
            pageTitle: "Join",
            errorMessage: "The password do not match!",
        })
    }
    // Checking Duplication of username or email
    const doesExist = await User.exists({ $or: [{ username}, { email }]});
    if (doesExist) {
        return res.status(400).render("users/join", { 
            pageTitle: "Join",
            errorMessage: "This Username/Email is already taken",
        })
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login");
    } catch(error) {
        return res.status(400).render("users/join", {
            pageTitle: "Join",
            errorMessage: error._message,
        });
    }
}

export const getLogin = (req, res) => {
    res.render("users/login", {
        pageTitle: "Login"
    })
}

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    // Checking for duplication in username
    const curUser = await User.findOne({ 
        username: username, 
        socialOnly: false,
    });
    if (!curUser) {
        return res.status(400).render("login", { 
            pageTitle: "Login",
            errorMessage: "Username does not exist!",
        })
    }

    // Checking for correct password
    const pwdMatch = await bcrypt.compare(password, curUser.password);
    if (!pwdMatch) {
        return res.status(400).render("login", {
            pageTitle: "Login",
            errorMessage: "Wrong Password"
        })
    }

    // If success
    req.session.loggedIn = true;
    req.session.user = curUser;
    return res.redirect("/");
}

export const getUserLogout = (req, res) => {
    req.session.loggedIn = false;
    req.session.user = null;
    req.session.destroy();
    res.redirect("/");
} 

export const startGithubLogin = (req, res) => {
    const baseURL = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENTID,
        allow_signup: false,
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalURL = `${baseURL}?${params}`;
    res.redirect(finalURL);
}

export const finishGithubLogin = async (req, res) => {
    // Getting the code once the user gets redirected
    const baseURL = "https://github.com/login/oauth/access_token";
    const codeConfig = {
        client_id: process.env.GH_CLIENTID,
        client_secret: process.env.GH_CLIENTSECRET,
        code: req.query.code,
    }
    const codeParams = new URLSearchParams(codeConfig).toString();
    const finalURL = `${baseURL}?${codeParams}`;
    
    // Exchanging the `code` with `access_token` through POST request
    //// Using `fetch`
    const tokenRequested = await fetch(finalURL, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });
    const token = await tokenRequested.json();

    // Use the access_token to access API 
    if ("access_token" in token) {
        const { access_token } = token;
        const apiUrl = "https://api.github.com";
        const userData = await fetch(`${apiUrl}/user`, {
            method: "GET",
            headers: {
                Authorization: `token ${access_token}`,
            }
        });
        const userDataJson = await userData.json();
        
        //// Accessing email API
        const userEmailData = await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`
            }
        })
        const userEmailDataJson = await userEmailData.json();   // List

        //// Finding an email that is "primary" and "verified"
        const primaryEmail = userEmailDataJson.find( 
            (email) => email.primary === true && email.verified === true
        );
        if (!primaryEmail) {
            return res.redirect("/login");
        }

        //// Checking for Existing User (who already signed with pwd)
        const existingUser = await User.findOne({ email: primaryEmail.email });
        if (existingUser) {
            req.session.user = existingUser;
        } else {
            // Create User
            const newUser = await User.create({
                email: primaryEmail.email,
                username: userDataJson.login,
                name: userDataJson.name ? userDataJson.name : "Unknown",
                password: "",
                socialOnly: true,
                location: userDataJson.location ? userDataJson.location: "Unknown",
                avatarUrl: userDataJson.avatar_url,
            });
            req.session.user = newUser;
        }
        req.session.loggedIn = true;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
}

export const getViewProfile = () => {

}

export const postDeleteUser = () => {

}

export const getUserEdit = () => {

}

export const postUserEdit = () => {

}

