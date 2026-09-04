-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFICATION', 'QUOTE_TO_PREPARE', 'QUOTE_SENT', 'WON', 'LOST');
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REFUSED', 'EXPIRED');
CREATE TYPE "MissionStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "CommunicationType" AS ENUM ('NOTE', 'EMAIL', 'PHONE', 'FOLLOW_UP', 'SYSTEM');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'MANAGER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "siret" TEXT,
  "address" TEXT,
  "city" TEXT,
  "postalCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Company_name_idx" ON "Company"("name");

CREATE TABLE "Contact" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Contact_email_idx" ON "Contact"("email");
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

CREATE TABLE "Service" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "defaultHourlyRateCents" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "companyId" TEXT,
  "contactId" TEXT NOT NULL,
  "serviceId" TEXT,
  "serviceLabel" TEXT NOT NULL,
  "siteType" TEXT,
  "city" TEXT NOT NULL,
  "desiredStart" TIMESTAMP(3),
  "timeRange" TEXT,
  "duration" TEXT,
  "guardCount" INTEGER,
  "urgency" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'website',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "nextActionAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lead_reference_key" ON "Lead"("reference");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_companyId_idx" ON "Lead"("companyId");
CREATE INDEX "Lead_contactId_idx" ON "Lead"("contactId");
CREATE INDEX "Lead_nextActionAt_idx" ON "Lead"("nextActionAt");

CREATE TABLE "Communication" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "type" "CommunicationType" NOT NULL DEFAULT 'NOTE',
  "content" TEXT NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Communication_leadId_createdAt_idx" ON "Communication"("leadId", "createdAt");

CREATE TABLE "Quote" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "leadId" TEXT,
  "companyId" TEXT,
  "contactId" TEXT NOT NULL,
  "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "subtotalCents" INTEGER NOT NULL,
  "taxRateBps" INTEGER NOT NULL DEFAULT 2000,
  "taxCents" INTEGER NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "validUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Quote_reference_key" ON "Quote"("reference");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "Quote_leadId_idx" ON "Quote"("leadId");
CREATE INDEX "Quote_companyId_idx" ON "Quote"("companyId");

CREATE TABLE "QuoteItem" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "serviceId" TEXT,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "hours" DECIMAL(10,2) NOT NULL DEFAULT 1,
  "unitPriceCents" INTEGER NOT NULL,
  "surchargeCents" INTEGER NOT NULL DEFAULT 0,
  "lineTotalCents" INTEGER NOT NULL,
  CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

CREATE TABLE "Mission" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "quoteId" TEXT,
  "companyId" TEXT,
  "title" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "serviceLabel" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "requiredPersonnel" INTEGER NOT NULL DEFAULT 1,
  "instructions" TEXT,
  "status" "MissionStatus" NOT NULL DEFAULT 'PLANNED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Mission_reference_key" ON "Mission"("reference");
CREATE INDEX "Mission_startsAt_idx" ON "Mission"("startsAt");
CREATE INDEX "Mission_status_idx" ON "Mission"("status");
CREATE INDEX "Mission_companyId_idx" ON "Mission"("companyId");

CREATE TABLE "AppSetting" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
