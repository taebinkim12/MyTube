import express from "express";
import {
    getViewProfile,
    postDeleteUser,
    getUserEdit,
    postUserEdit,
    getUserLogout,
    startGithubLogin,
    finishGithubLogin,
    getChangePwd,
    postChangePwd
} from "../controllers/userController"

import { 
    protectorMiddleware,
    publicOnlyMiddleware,
    uploadVideos,
    uploadAvatars 
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin)
userRouter.get("/github/finish", finishGithubLogin)
userRouter
    .route("/logout")
    .all(protectorMiddleware)
    .get(getUserLogout);
userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getUserEdit)
    .post(uploadAvatars.single("avatar"), postUserEdit);
userRouter
    .route("/delete")
    .all(protectorMiddleware)
    .get(postDeleteUser);

userRouter
    .route("/edit/change-paassword")
    .all(protectorMiddleware)
    .get(getChangePwd)
    .post(postChangePwd);

userRouter.route("/:id").get(getViewProfile);


export default userRouter;