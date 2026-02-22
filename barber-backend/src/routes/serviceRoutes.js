import express from "express";
import {
  createService,
  getServices,
} from "../controllers/serviceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createService);
router.get("/", authMiddleware, getServices);

export default router;
