import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const workTypes = [
  "Кладка перегородок",
  "Монтаж опалубки",
  "Бетонирование",
  "Армирование",
  "Штукатурные работы",
  "Монтаж инженерных сетей",
  "Устройство кровли",
  "Отделочные работы"
];

async function main() {
  for (const name of workTypes) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
