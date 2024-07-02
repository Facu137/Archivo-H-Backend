import { Router } from "express";
const router = Router();
import authController from "../controllers/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";

// Routes de auth
router.post("/register", authController.register);
router.post("/login", authController.login);

// Routes de profile
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
