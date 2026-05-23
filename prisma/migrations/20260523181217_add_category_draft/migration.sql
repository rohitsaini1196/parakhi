-- CreateTable
CREATE TABLE "CategoryDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "templateJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "generatedBy" TEXT NOT NULL,
    "exampleQuery" TEXT,
    "reviewerNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "CategoryDraft_status_idx" ON "CategoryDraft"("status");
