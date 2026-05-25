import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { workLogInputSchema, workLogQuerySchema } from "./validation.js";

export const apiRouter = Router();

const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const toEndDate = (value: string) => new Date(`${value}T23:59:59.999Z`);

const serializeWorkLog = (log: {
  id: string;
  performedAt: Date;
  volume: Prisma.Decimal;
  unit: string;
  performerName: string;
  comment: string | null;
  workType: { id: string; name: string };
}) => ({
  ...log,
  performedAt: log.performedAt.toISOString().slice(0, 10),
  volume: Number(log.volume),
  comment: log.comment ?? ""
});

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.get("/work-types", async (_req, res, next) => {
  try {
    const workTypes = await prisma.workType.findMany({
      orderBy: { name: "asc" }
    });
    res.json(workTypes);
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/work-logs", async (req, res, next) => {
  try {
    const query = workLogQuerySchema.parse(req.query);
    const where: Prisma.WorkLogWhereInput = {};

    if (query.startDate || query.endDate) {
      where.performedAt = {
        ...(query.startDate ? { gte: toDate(query.startDate) } : {}),
        ...(query.endDate ? { lte: toEndDate(query.endDate) } : {})
      };
    }

    const logs = await prisma.workLog.findMany({
      where,
      include: { workType: true },
      orderBy: [{ performedAt: query.sort }, { createdAt: "desc" }]
    });

    res.json(logs.map(serializeWorkLog));
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/work-logs", async (req, res, next) => {
  try {
    const data = workLogInputSchema.parse(req.body);
    const log = await prisma.workLog.create({
      data: {
        performedAt: toDate(data.performedAt),
        workTypeId: data.workTypeId,
        volume: data.volume,
        unit: data.unit,
        performerName: data.performerName,
        comment: data.comment || null
      },
      include: { workType: true }
    });

    res.status(201).json(serializeWorkLog(log));
  } catch (error) {
    next(error);
  }
});

apiRouter.put("/work-logs/:id", async (req, res, next) => {
  try {
    const data = workLogInputSchema.parse(req.body);
    const log = await prisma.workLog.update({
      where: { id: req.params.id },
      data: {
        performedAt: toDate(data.performedAt),
        workTypeId: data.workTypeId,
        volume: data.volume,
        unit: data.unit,
        performerName: data.performerName,
        comment: data.comment || null
      },
      include: { workType: true }
    });

    res.json(serializeWorkLog(log));
  } catch (error) {
    next(error);
  }
});

apiRouter.delete("/work-logs/:id", async (req, res, next) => {
  try {
    await prisma.workLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
