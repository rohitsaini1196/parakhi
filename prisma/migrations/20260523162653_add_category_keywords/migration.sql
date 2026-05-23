-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "hsnCodes" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "defaultGstRate" REAL NOT NULL,
    "templateJson" TEXT NOT NULL,
    "sourcesJson" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Category" ("createdAt", "defaultGstRate", "displayName", "hsnCodes", "notes", "slug", "sourcesJson", "templateJson", "updatedAt") SELECT "createdAt", "defaultGstRate", "displayName", "hsnCodes", "notes", "slug", "sourcesJson", "templateJson", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
