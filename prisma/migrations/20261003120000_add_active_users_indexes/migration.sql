-- CreateIndex
CREATE INDEX "User_age_deletedAt_idx" ON "User"("age", "deletedAt");

-- CreateIndex
CREATE INDEX "Avatar_userId_deletedAt_idx" ON "Avatar"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Avatar_userId_createdAt_idx" ON "Avatar"("userId", "createdAt");
