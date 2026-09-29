import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/auth.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticate, getProfile);

export default router;