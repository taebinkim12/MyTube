import mongoose from "mongoose";
import "dotenv/config"

mongoose.connect(process.env.DB_URL);

//// printing where we are connected to sercer successfully or not
const db = mongoose.connection;

const handleError = (error) => console.log("DB Error", error);
const handleOpen = () => console.log("Connected to DB ✅");

db.on("error", handleError);
db.once("open", handleOpen)