import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protects routes: only users with a valid JWT token can pass
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token must come as: Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // available in the next controller
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};