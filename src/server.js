import express from "express";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import "dotenv/config"
import "./db";
import { localMiddleware } from "./middlewares";
import session from "express-session";
import MongoStore from "connect-mongo";


const app = express();

const PORT = process.env.PORT || 4000;

//// Configuration
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }))

//// MIDDLEWARES
app.use(
	session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(localMiddleware);

////// STATICS --> Telling express to allows users to view stuff inside when accessing this URL
app.use("/uploads", express.static("uploads"));

//// ROUTERS
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);


//// Initializing PORT
app.listen(PORT, () => {
    console.log(`Listening to port ${PORT} ✅`);
})