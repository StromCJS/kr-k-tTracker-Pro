import { Router } from "express"
import {
    getProfile,
    loginUser,
    logoutUser,
    registerUser
} from "../controllers/authController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = Router()

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", logoutUser);

export default router;
