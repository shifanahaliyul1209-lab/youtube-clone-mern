import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";



const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
connectDB();
app.listen(process.env.PORT, () => console.log("Server running"));