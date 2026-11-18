CREATE TABLE IF NOT EXISTS "DerivSession" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DerivSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DerivSession_expiresAt_idx" ON "DerivSession"("expiresAt");
