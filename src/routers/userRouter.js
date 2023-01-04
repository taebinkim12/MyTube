import express from "express";
import {
    getViewProfile,
    postDeleteUser,
    getUserEdit,
    postUserEdit,
    getUserLogout,
    startGithubLogin,
    finishGithubLogin
} from "../controllers/userController"

const userRouter = express.Router();

userRouter.get("/github/start", startGithubLogin)
userRouter.get("/github/finish", finishGithubLogin)
userRouter.route("/logout").get(getUserLogout);
userRouter.route("/edit").get(getUserEdit).post(postUserEdit);
userRouter.route("/delete").post(postDeleteUser);
userRouter.route("/:id").get(getViewProfile);


export default userRouter;