-- CreateTable
CREATE TABLE "HsnGstRate" (
    "hsnPrefix" TEXT NOT NULL PRIMARY KEY,
    "ratePct" REAL NOT NULL,
    "cessPct" REAL NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "asOfDate" DATETIME NOT NULL,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BrandIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "parentCompany" TEXT,
    "country" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecomputeJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "categorySlug" TEXT,
    "reason" TEXT NOT NULL,
    "enqueuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ranAt" DATETIME,
    "result" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Breakdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "madeInIndiaScoreBp" INTEGER NOT NULL,
    "madeInIndiaLowBp" INTEGER NOT NULL,
    "madeInIndiaHighBp" INTEGER NOT NULL,
    "compositionMiiBp" INTEGER NOT NULL DEFAULT 0,
    "compositionMiiLowBp" INTEGER NOT NULL DEFAULT 0,
    "compositionMiiHighBp" INTEGER NOT NULL DEFAULT 0,
    "componentsJson" TEXT NOT NULL,
    "importsJson" TEXT NOT NULL,
    "gstJson" TEXT NOT NULL,
    "reasoningMarkdown" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "confidenceOverall" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Breakdown_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Breakdown" ("componentsJson", "confidenceOverall", "createdAt", "gstJson", "id", "importsJson", "madeInIndiaHighBp", "madeInIndiaLowBp", "madeInIndiaScoreBp", "modelUsed", "productId", "reasoningMarkdown", "templateVersion") SELECT "componentsJson", "confidenceOverall", "createdAt", "gstJson", "id", "importsJson", "madeInIndiaHighBp", "madeInIndiaLowBp", "madeInIndiaScoreBp", "modelUsed", "productId", "reasoningMarkdown", "templateVersion" FROM "Breakdown";
DROP TABLE "Breakdown";
ALTER TABLE "new_Breakdown" RENAME TO "Breakdown";
CREATE UNIQUE INDEX "Breakdown_productId_key" ON "Breakdown"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HsnGstRate_asOfDate_idx" ON "HsnGstRate"("asOfDate");

-- CreateIndex
CREATE UNIQUE INDEX "BrandIndex_slug_key" ON "BrandIndex"("slug");

-- CreateIndex
CREATE INDEX "BrandIndex_country_idx" ON "BrandIndex"("country");

-- CreateIndex
CREATE INDEX "BrandIndex_canonicalName_idx" ON "BrandIndex"("canonicalName");

-- CreateIndex
CREATE INDEX "RecomputeJob_ranAt_idx" ON "RecomputeJob"("ranAt");
