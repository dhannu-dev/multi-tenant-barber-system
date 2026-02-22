import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/book", authMiddleware, bookAppointment);
router.get("/my", authMiddleware, getMyAppointments);
router.get("/all", authMiddleware, getAllAppointments);

export default router;
