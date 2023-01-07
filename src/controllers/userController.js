import User from "../models/User";
import Comment from "../models/Comment";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import "dotenv/config"

const isProduction = process.env.NODE_ENV === "production"

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
        return res.status(400).render("users/login", { 
            pageTitle: "Login",
            errorMessage: "Username does not exist!",
        })
    }

    // Checking for correct password
    const pwdMatch = await bcrypt.compare(password, curUser.password);
    if (!pwdMatch) {
        return res.status(400).render("users/login", {
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

export const getViewProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    
    if (!user) {
      return res.status(404).render("404", { pageTitle: "User not found." });
    }
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
}

export const getUserEdit = (req, res) => {
    res.render("users/edit-profile", { pageTitle: "Edit Profile" });

}

export const postUserEdit = async (req, res) => {
    const userId = req.session.user._id;
	const newName = req.body.name;
	const newEmail = req.body.email;
	const newUsername = req.body.username;
	const newLocation = req.body.location;
	const curEmail = req.session.user.email;
	const curUsername = req.session.user.username;

	if (curEmail !== newEmail || curUsername !== newUsername) {
		// Trying to change Email
		const emailExisting = await User.exists({ email: newEmail });
		const usernameExisting = await User.exists({ username: newUsername });
		if (emailExisting || usernameExisting) {
			return res.status(400).render("users/edit-profile", { 
				emailError: (emailExisting && (curEmail !== newEmail)) ,
				usernameError: (usernameExisting && (curUsername !== newUsername)),
			});
		}
	}

    const file = req.file;
    // findByIdAndUpdate by default returns the model BEFORE the update
    //// Hence, gives "new" option will give updated user back
    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        {
            // file.location for using aws s3 later...
            avatarUrl: file ? (isProduction ? file.location : "/" + file.path) : req.session.user.avatarUrl,
            name: newName,
            email: newEmail,
            username: newUsername,
            location: newLocation,
        },
        { 
            new: true
        },
    );
    req.session.user = updatedUser;
	
    return res.redirect(`/users/${userId}`);
}

export const postDeleteUser = async (req, res) => {
    const userId = res.locals.loggedInUser._id;
    await User.findByIdAndDelete(userId);
    req.session.loggedIn = false;
    req.session.user = null;
    return res.redirect("/");
}

export const getChangePwd = (req, res) => {
    if (req.session.user.socialOnly) {
        res.redirect("/");
    }
	res.render("users/change-password", { pageTitle: "Change Password" });
}

export const postChangePwd = async (req, res) => {
    const { oldPassword, newPassword, newPasswordConfirmation } = req.body;
	const { _id } = req.session.user;
	const curUser = await User.findById(_id);

	// Checking for currnet/old password
	const curPwdMatching = await bcrypt.compare(oldPassword, curUser.password);
	if (!curPwdMatching) {
		return res.status(400).render("users/change-password", {
			pageTitle: "Change Password",
			errorMessage: "Current password does not match"
		})
	}

	// Checking if the current and new password that user is trying to change matchs
	if (oldPassword === newPassword) {
		return res.status(400).render("users/change-password", {
			pageTitle: "Change Password",
			errorMessage: "Old and New password are identical"
		})
	}

	// Checking new and newConfirmation
	if (newPassword !== newPasswordConfirmation) {
		return res.status(400).render("users/change-password", { 
			pageTitle: "Change Passowrd",
			errorMessage: "Confirmation does not match"
		})
	}

	// Everything good, now changing the password
	curUser.password = newPassword;
	await curUser.save();

	/*
	//// Gotta update the session cause one can keep using the same session after changing the password
	req.session.user.password = curUser.password;

	//// Loggin the user out, so that they log in again
	return res.redirect("/users/logout");
	*/

	//// Destroying the current session and redirect the user to login page
	////// Strengthening the security
	req.session.destroy();
	return res.redirect("/login");
}