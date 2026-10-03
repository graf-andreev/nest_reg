DROP INDEX IF EXISTS "User_login_key";
DROP INDEX IF EXISTS "User_email_key";

CREATE UNIQUE INDEX "User_login_key" ON "User"("login") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "deletedAt" IS NULL;
