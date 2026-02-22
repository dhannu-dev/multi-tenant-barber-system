import prisma from "../config/db.js";

export const bookAppointment = async (req, res) => {
  try {
    const tenantId = req.user.tenant;
    const userId = req.user.userId;
    const { serviceId, appointmentTime } = req.body;

    if (!serviceId || !appointmentTime) {
      return res.status(400).json({ message: "All fields required" });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "${tenantId}".appointments 
       (user_id, service_id, appointment_time) 
       VALUES ($1, $2, $3)`,
      userId,
      serviceId,
      new Date(appointmentTime),
    );

    res.json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const tenantId = req.user.tenant;
    const userId = req.user.userId;

    const appointments = await prisma.$queryRawUnsafe(
      `SELECT a.*, s.name AS service_name 
       FROM "${tenantId}".appointments a
       JOIN "${tenantId}".services s 
       ON a.service_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.appointment_time DESC`,
      userId,
    );

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const tenantId = req.user.tenant;

    if (req.user.role !== "barber") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await prisma.$queryRawUnsafe(
      `SELECT a.*, u.name AS customer_name, s.name AS service_name
       FROM "${tenantId}".appointments a
       JOIN "${tenantId}".users u ON a.user_id = u.id
       JOIN "${tenantId}".services s ON a.service_id = s.id
       ORDER BY a.appointment_time DESC`,
    );

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};
