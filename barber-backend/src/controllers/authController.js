import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant header missing" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(tenantId)) {
      return res.status(400).json({ message: "Invalid tenant id" });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "${tenantId}".users (name, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      name,
      email,
      hashedPassword,
      role,
    );

    // 👇 Now fetch created user
    const users = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${tenantId}".users WHERE email = $1`,
      email,
    );

    const user = users[0];

    // 👇 Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenant: tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.headers["x-tenant-id"];

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant header missing" });
    }

    const users = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${tenantId}".users WHERE email = $1`,
      email,
    );

    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenant: tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
