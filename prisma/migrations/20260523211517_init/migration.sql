-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" TEXT,
    "barcode" TEXT,
    "hsnCode" TEXT,
    "categorySlug" TEXT NOT NULL,
    "sourceUrls" TEXT,
    "mrpInPaise" INTEGER,
    "mrpLastSeenAt" TIMESTAMP(3),
    "isHeroProduct" BOOLEAN NOT NULL DEFAULT false,
    "heroMarkdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "hsnCodes" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "defaultGstRate" DOUBLE PRECISION NOT NULL,
    "templateJson" TEXT NOT NULL,
    "sourcesJson" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Breakdown" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "submitterEmail" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommodityPrice" (
    "id" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "grade" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "minPricePerQuintal" INTEGER NOT NULL,
    "maxPricePerQuintal" INTEGER NOT NULL,
    "modalPricePerQuintal" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'agmarknet',
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommodityPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HsnGstRate" (
    "hsnPrefix" TEXT NOT NULL,
    "ratePct" DOUBLE PRECISION NOT NULL,
    "cessPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HsnGstRate_pkey" PRIMARY KEY ("hsnPrefix")
);

-- CreateTable
CREATE TABLE "BrandIndex" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "parentCompany" TEXT,
    "country" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecomputeJob" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "categorySlug" TEXT,
    "reason" TEXT NOT NULL,
    "enqueuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ranAt" TIMESTAMP(3),
    "result" TEXT,

    CONSTRAINT "RecomputeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryDraft" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "templateJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "generatedBy" TEXT NOT NULL,
    "exampleQuery" TEXT,
    "reviewerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "CategoryDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmCall" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmCall_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "CommodityPrice_commodity_arrivalDate_idx" ON "CommodityPrice"("commodity", "arrivalDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommodityPrice_commodity_variety_market_arrivalDate_key" ON "CommodityPrice"("commodity", "variety", "market", "arrivalDate");

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

-- CreateIndex
CREATE INDEX "CategoryDraft_status_idx" ON "CategoryDraft"("status");

-- CreateIndex
CREATE INDEX "LlmCall_createdAt_idx" ON "LlmCall"("createdAt");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breakdown" ADD CONSTRAINT "Breakdown_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
