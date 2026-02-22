import prisma from "../config/db.js";

export const createTenant = async (req, res) => {
  try {
    const { name, schema_name } = req.body;

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!name || !schema_name) {
      return res.status(400).json({ message: "Name and schema_name required" });
    }

    const existingTenant = await prisma.tenants.findUnique({
      where: { schema_name },
    });

    if (existingTenant) {
      return res.status(400).json({
        message: "Schema name already exists",
      });
    }

    // 1️⃣ Create Schema
    await prisma.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${schema_name}"`,
    );

    // 2️⃣ Create Users Table inside new schema
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schema_name}".users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3️⃣ Create Services Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schema_name}".services (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4️⃣ Create Appointments Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schema_name}".appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        service_id INTEGER,
        appointment_time TIMESTAMP,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5️⃣ Insert into public.tenants
    const tenant = await prisma.tenants.create({
      data: {
        name,
        schema_name,
      },
    });

    res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating tenant" });
  }
};

export const getTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenants.findMany({
      orderBy: { created_at: "desc" },
    });

    return res.json(tenants);
  } catch (error) {
    console.error("TENANT ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch tenants",
      error: error.message,
    });
  }
};

export const toggleTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenants.findUnique({
      where: { id: Number(id) },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const updated = await prisma.tenants.update({
      where: { id: Number(id) },
      data: {
        is_active: !tenant.is_active,
      },
    });

    res.json({
      message: "Tenant status updated",
      tenant: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};
