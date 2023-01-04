import multer from "multer";

export const localMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.loggedIn = true;
    } else {
        res.locals.loggedIn = false;
    }

    res.locals.loggedInUser = req.session.user || {};
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
}

export const uploadAvatars = multer({
    dest: "uploads/avatars"
})

export const uploadVideos = multer({
    dest: "uploads/videos"
})