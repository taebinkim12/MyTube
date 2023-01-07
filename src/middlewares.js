import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const isProduction = process.env.NODE_ENV === "production";

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    }
})

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: "mytube-by-taebin/images",
    acl: "public-read"
})

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: "mytube-by-taebin/videos",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE
})

export const localMiddleware = (req, res, next) => {
    
    if (req.session.loggedIn) {
        res.locals.loggedIn = true;
    } else {
        res.locals.loggedIn = false;
    }

    res.locals.loggedInUser = req.session.user || {};
    
    res.locals.isProduction = isProduction;
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Log in first.");
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}

export const uploadAvatars = multer({
    dest: "uploads/avatars",
    storage: isProduction ? s3ImageUploader : undefined,
})

export const uploadVideos = multer({
    dest: "uploads/videos",
    storage: isProduction ? s3VideoUploader : undefined, 
})
