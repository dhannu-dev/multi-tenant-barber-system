import prisma from "../config/db.js";

export const getServices = async (req, res) => {
  try {
    const tenantId = req.user.tenant;

    const services = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${tenantId}".services ORDER BY id DESC`,
    );

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

export const createService = async (req, res) => {
  try {
    const tenantId = req.user.tenant;
    const { name, price } = req.body;

    console.log("Headers tenant:", req.headers["x-tenant-id"]);
    console.log("User object:", req.user);

    if (!name || !price) {
      return res.status(400).json({ message: "All fields required" });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "${tenantId}".services (name, price)
       VALUES ($1, $2)`,
      name,
      price,
    );

    res.json({ message: "Service created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Service creation failed" });
  }
};
