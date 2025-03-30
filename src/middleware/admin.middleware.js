import jwt from "jsonwebtoken"
export const adminMiddleware = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Can't acces this router! only for the admin" })
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

