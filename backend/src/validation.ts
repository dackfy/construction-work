import { z } from "zod";

export const workLogInputSchema = z.object({
  performedAt: z
    .string({ required_error: "Укажите дату выполнения" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
  workTypeId: z.string().min(1, "Выберите вид работ"),
  volume: z.coerce.number().positive("Объем должен быть больше нуля"),
  unit: z.string().trim().min(1, "Укажите единицу измерения").max(20),
  performerName: z.string().trim().min(2, "Укажите ФИО исполнителя").max(120),
  comment: z.string().trim().max(500).optional().or(z.literal(""))
});

export const workLogQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(["asc", "desc"]).optional().default("desc")
});
