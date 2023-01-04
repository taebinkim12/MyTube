import express from "express";
import { 
    getWatch, 
    getVideoEdit, 
    postVideoEdit, 
    postVideoDelete, 
    getUpload, 
    postUpload 
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.route("/:id([0-9a-f]{24})").get(getWatch);                      // regex for mongo db object id
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getVideoEdit).post(postVideoEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").post(postVideoDelete);
videoRouter.route("/upload").get(getUpload).post(postUpload);

export default videoRouter;