import express from "express";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const app = express();

const PORT = process.env.PORT || 4000;

//// Configuration
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

//// MIDDLEWARES

//// ROUTERS
app.use("/", rootRouter);
app.use("/video", videoRouter);
app.use("/user", userRouter);


//// Initializing PORT
app.listen(PORT, () => {
    console.log(`Listening to port ${PORT} ✅`);
})