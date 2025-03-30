import express from "express"
import dotenv from "dotenv"
import userAuthRouter from "./routes/authRoutes.js"
import adminAuthRouter from "./routes/admin-auth.router.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/db.js"

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5125", credentials: true }));

app.use("/api/auth", userAuthRouter);
app.use("/api/admin", adminAuthRouter)

app.get("/health", (req, res) => {
    return res.status(200).json({ message: "Health good" })
})

const PORT = process.env.PORT || 5125;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
