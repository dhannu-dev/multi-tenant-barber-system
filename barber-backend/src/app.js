import express from "express";
import tenantRoutes from "./routes/tenantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://multi-tenant-barber-system.vercel.app",
      "https://multi-tenant-barber-system-production.vercel.app",
    ],
    credentials: true,
  }),
);

app.use("/api/tenants", tenantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);

export default app;
