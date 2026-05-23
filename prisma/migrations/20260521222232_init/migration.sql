-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" TEXT,
    "barcode" TEXT,
    "hsnCode" TEXT,
    "categorySlug" TEXT NOT NULL,
    "sourceUrls" TEXT,
    "mrpInPaise" INTEGER,
    "mrpLastSeenAt" DATETIME,
    "isHeroProduct" BOOLEAN NOT NULL DEFAULT false,
    "heroMarkdown" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "hsnCodes" TEXT NOT NULL,
    "defaultGstRate" REAL NOT NULL,
    "templateJson" TEXT NOT NULL,
    "sourcesJson" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Breakdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "madeInIndiaScoreBp" INTEGER NOT NULL,
    "madeInIndiaLowBp" INTEGER NOT NULL,
    "madeInIndiaHighBp" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "submitterEmail" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LlmCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" REAL NOT NULL,
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_brand_name_idx" ON "Product"("brand", "name");

-- CreateIndex
CREATE INDEX "Product_categorySlug_idx" ON "Product"("categorySlug");

-- CreateIndex
CREATE UNIQUE INDEX "Breakdown_productId_key" ON "Breakdown"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_target_ipHash_key" ON "Vote"("target", "ipHash");

-- CreateIndex
CREATE INDEX "LlmCall_createdAt_idx" ON "LlmCall"("createdAt");
