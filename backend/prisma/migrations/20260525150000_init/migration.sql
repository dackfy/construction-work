CREATE TABLE "WorkType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkLog" (
    "id" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "volume" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "performerName" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workTypeId" TEXT NOT NULL,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkType_name_key" ON "WorkType"("name");
CREATE INDEX "WorkLog_performedAt_idx" ON "WorkLog"("performedAt");
CREATE INDEX "WorkLog_workTypeId_idx" ON "WorkLog"("workTypeId");

ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "WorkType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
