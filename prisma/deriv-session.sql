CREATE TABLE "DerivSession" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DerivSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DerivSession_expiresAt_idx" ON "DerivSession"("expiresAt");
