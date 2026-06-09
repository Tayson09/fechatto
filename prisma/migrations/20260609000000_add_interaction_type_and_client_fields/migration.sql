-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('CALL', 'VISIT', 'RETURN', 'NOTE');

-- AlterTable Client
ALTER TABLE "Client"
  ADD COLUMN "profile" TEXT,
  ADD COLUMN "nextFollowUpNote" TEXT;

-- AlterTable ClientHistory
ALTER TABLE "ClientHistory"
  ADD COLUMN "type" "InteractionType" NOT NULL DEFAULT 'NOTE',
  ADD COLUMN "title" TEXT;
