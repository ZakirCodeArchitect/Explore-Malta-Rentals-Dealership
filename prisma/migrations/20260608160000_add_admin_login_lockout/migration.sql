-- CreateTable
CREATE TABLE "AdminLoginLockout" (
    "id" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "ipAddressHash" TEXT NOT NULL,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "firstFailedAt" TIMESTAMP(3),
    "lastFailedAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLoginLockout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminLoginLockout_emailNormalized_ipAddressHash_key" ON "AdminLoginLockout"("emailNormalized", "ipAddressHash");

-- CreateIndex
CREATE INDEX "AdminLoginLockout_updatedAt_idx" ON "AdminLoginLockout"("updatedAt");

-- CreateIndex
CREATE INDEX "AdminLoginLockout_lockedUntil_idx" ON "AdminLoginLockout"("lockedUntil");
