import express from "express";
import {
  createTenant,
  getTenants,
  toggleTenantStatus,
} from "../controllers/tenantController.js";
import { login, signUp } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTenant);
router.post("/login", login);
router.post("/signup", signUp);
router.get("/", getTenants);
router.patch("/:id", authMiddleware, toggleTenantStatus);

export default router;
