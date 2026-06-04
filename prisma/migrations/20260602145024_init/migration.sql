-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('LEAD', 'IN_PROGRESS', 'PROPOSAL', 'VISIT', 'CLOSED', 'LOST');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('IN_PROGRESS', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "profession" TEXT,
    "income" DECIMAL(15,2),
    "propertyType" "PropertyType"[],
    "location" TEXT,
    "priceMin" DECIMAL(15,2),
    "priceMax" DECIMAL(15,2),
    "notes" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'LEAD',
    "nextFollowUp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientHistory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" DECIMAL(10,2),
    "price" DECIMAL(15,2) NOT NULL,
    "commission" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "shareToken" TEXT,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT false,
    "shareViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "commission" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "negotiationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_status_idx" ON "Client"("userId", "status");

-- CreateIndex
CREATE INDEX "Client_userId_nextFollowUp_idx" ON "Client"("userId", "nextFollowUp");

-- CreateIndex
CREATE INDEX "Client_userId_deletedAt_idx" ON "Client"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ClientHistory_clientId_idx" ON "ClientHistory"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_shareToken_key" ON "Property"("shareToken");

-- CreateIndex
CREATE INDEX "Property_userId_idx" ON "Property"("userId");

-- CreateIndex
CREATE INDEX "Property_userId_status_idx" ON "Property"("userId", "status");

-- CreateIndex
CREATE INDEX "Property_shareToken_idx" ON "Property"("shareToken");

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_idx" ON "PropertyPhoto"("propertyId");

-- CreateIndex
CREATE INDEX "Negotiation_userId_idx" ON "Negotiation"("userId");

-- CreateIndex
CREATE INDEX "Negotiation_userId_status_idx" ON "Negotiation"("userId", "status");

-- CreateIndex
CREATE INDEX "Negotiation_clientId_idx" ON "Negotiation"("clientId");

-- CreateIndex
CREATE INDEX "Negotiation_propertyId_idx" ON "Negotiation"("propertyId");

-- CreateIndex
CREATE INDEX "Visit_negotiationId_idx" ON "Visit"("negotiationId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientHistory" ADD CONSTRAINT "ClientHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "Negotiation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
