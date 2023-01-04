import express from "express";
import { 
    getWatch, 
    getVideoEdit, 
    postVideoEdit, 
    postVideoDelete, 
    getUpload, 
    postUpload 
} from "../controllers/videoController";

import { 
    protectorMiddleware,
    publicOnlyMiddleware,
    uploadVideos,
    uploadAvatars 
} from "../middlewares";

const videoRouter = express.Router();

videoRouter
    .route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(uploadVideos.single("video"), postUpload);

videoRouter.route("/:id([0-9a-f]{24})").get(getWatch);                      // regex for mongo db object id

videoRouter
    .route("/:id([0-9a-f]{24})/edit")
    .all(protectorMiddleware)
    .get(getVideoEdit)
    .post(postVideoEdit);
    
videoRouter
    .route("/:id([0-9a-f]{24})/delete")
    .all(protectorMiddleware)
    .post(postVideoDelete);


export default videoRouter;