import { Router } from "express";
import {
  login,
  me,
  register,
  updateAccount,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateAccount);

export default router;
