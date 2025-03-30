import Admin from "../models/admin.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body


        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(401).json({ message: "admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("admin_token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("admin_token");
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
