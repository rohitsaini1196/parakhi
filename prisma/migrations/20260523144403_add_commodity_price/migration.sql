-- CreateTable
CREATE TABLE "CommodityPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commodity" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "grade" TEXT,
    "arrivalDate" DATETIME NOT NULL,
    "minPricePerQuintal" INTEGER NOT NULL,
    "maxPricePerQuintal" INTEGER NOT NULL,
    "modalPricePerQuintal" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'agmarknet',
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CommodityPrice_commodity_arrivalDate_idx" ON "CommodityPrice"("commodity", "arrivalDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommodityPrice_commodity_variety_market_arrivalDate_key" ON "CommodityPrice"("commodity", "variety", "market", "arrivalDate");
