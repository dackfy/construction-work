import "dotenv/config";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { apiRouter } from "./routes.js";
import { prisma } from "./prisma.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use("/api", apiRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Проверьте заполнение полей",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Запись не найдена" });
      return;
    }

    if (error.code === "P2003") {
      res.status(400).json({ message: "Выбранный вид работ не найден" });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
};

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}/api`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
