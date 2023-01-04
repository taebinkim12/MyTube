import express from "express";
import {
    getViewProfile,
    postDeleteUser,
    getUserEdit,
    postUserEdit,
    getUserLogout
} from "../controllers/userController"

const userRouter = express.Router();

userRouter.route("/logout").get(getUserLogout);
userRouter.route("/edit").get(getUserEdit).post(postUserEdit);
userRouter.route("/delete").post(postDeleteUser);
userRouter.route("/:id").get(getViewProfile);


export default userRouter;