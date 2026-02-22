import prisma from "../config/db.js";

export const tenantMiddleware = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    if (!tenantId) {
      return res.status(400).json({
        message: "Tenant header missing",
      });
    }

    const tenant = await prisma.tenants.findUnique({
      where: {
        schema_name: tenantId,
      },
    });

    if (!tenant || !tenant.is_active) {
      return res.status(404).json({
        message: "Invalid or inactive tenant",
      });
    }

    req.tenant = tenant;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Tenant resolution failed" });
  }
};
