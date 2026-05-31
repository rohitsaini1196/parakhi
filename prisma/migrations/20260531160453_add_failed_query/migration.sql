-- CreateTable
CREATE TABLE "FailedQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FailedQuery_createdAt_idx" ON "FailedQuery"("createdAt");

-- CreateIndex
CREATE INDEX "FailedQuery_query_idx" ON "FailedQuery"("query");
