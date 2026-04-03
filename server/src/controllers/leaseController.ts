import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantClerkId, managerClerkId } = req.query;
    const where: any = {};

    if (tenantClerkId) {
      where.tenant = { clerkId: tenantClerkId as string };
    }

    if (managerClerkId) {
      where.property = { manager: { clerkId: managerClerkId as string } };
    }

    const leases = await prisma.lease.findMany({
      where,
      include: {
        tenant: true,
        property: {
          include: {
            location: true,
          }
        },
      },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};