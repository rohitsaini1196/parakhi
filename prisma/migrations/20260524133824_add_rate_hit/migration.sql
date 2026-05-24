-- CreateTable
CREATE TABLE "RateHit" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "windowKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateHit_createdAt_idx" ON "RateHit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateHit_scope_windowKey_key" ON "RateHit"("scope", "windowKey");
