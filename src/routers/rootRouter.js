import express from "express";
import { getRoot, getSearch } from "../controllers/videoController";
import { 
    getJoin,
    postJoin,
    getLogin,
    postLogin 
} from "../controllers/userController";

import { 
    protectorMiddleware,
    publicOnlyMiddleware,
    uploadVideos,
    uploadAvatars 
} from "../middlewares";

const rootRouter = express.Router();

rootRouter.route("/").get(getRoot);
rootRouter
    .route("/join")
    .all(publicOnlyMiddleware)
    .get(getJoin)
    .post(postJoin);
rootRouter
    .route("/login")
    .all(publicOnlyMiddleware)
    .get(getLogin)
    .post(postLogin);
rootRouter.route("/search").get(getSearch);

export default rootRouter;