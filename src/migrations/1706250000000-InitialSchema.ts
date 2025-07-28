import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706250000000 implements MigrationInterface {
  name = 'InitialSchema1706250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin', 'manager', 'vendor', 'buyer', 'auditor', 'user')`);
    await queryRunner.query(`CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'suspended', 'pending')`);
    await queryRunner.query(`CREATE TYPE "organization_type" AS ENUM ('government', 'private', 'public_sector', 'ngo', 'vendor')`);
    await queryRunner.query(`CREATE TYPE "tender_status" AS ENUM ('draft', 'published', 'active', 'closed', 'awarded', 'cancelled', 'suspended')`);
    await queryRunner.query(`CREATE TYPE "tender_type" AS ENUM ('open', 'restricted', 'negotiated', 'single_source')`);
    await queryRunner.query(`CREATE TYPE "bid_status" AS ENUM ('draft', 'submitted', 'under_review', 'qualified', 'disqualified', 'awarded', 'rejected', 'withdrawn')`);
    await queryRunner.query(`CREATE TYPE "document_type" AS ENUM ('tender_notice', 'technical_specs', 'commercial_terms', 'eligibility_criteria', 'drawings', 'boq', 'corrigendum', 'addendum', 'bid_document', 'emd_receipt', 'other')`);
    await queryRunner.query(`CREATE TYPE "emd_status" AS ENUM ('pending', 'paid', 'verified', 'refunded', 'forfeited', 'expired')`);
    await queryRunner.query(`CREATE TYPE "payment_method" AS ENUM ('bank_guarantee', 'demand_draft', 'online_payment', 'neft', 'rtgs')`);
    await queryRunner.query(`CREATE TYPE "transaction_type" AS ENUM ('payment', 'refund', 'forfeiture', 'adjustment')`);
    await queryRunner.query(`CREATE TYPE "transaction_status" AS ENUM ('initiated', 'processing', 'completed', 'failed', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "notification_type" AS ENUM ('tender_created', 'tender_published', 'tender_closed', 'tender_awarded', 'bid_submitted', 'bid_evaluated', 'bid_selected', 'bid_rejected', 'document_uploaded', 'organization_verified', 'user_registered', 'password_reset', 'general')`);
    await queryRunner.query(`CREATE TYPE "notification_channel" AS ENUM ('email', 'in_app', 'both')`);
    await queryRunner.query(`CREATE TYPE "audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'APPROVE', 'REJECT', 'SUBMIT', 'WITHDRAW', 'PUBLISH', 'CLOSE', 'AWARD', 'VERIFY', 'REFUND', 'FORFEIT')`);
    await queryRunner.query(`CREATE TYPE "audit_module" AS ENUM ('AUTH', 'USER', 'ORGANIZATION', 'TENDER', 'BID', 'EMD', 'DOCUMENT', 'NOTIFICATION', 'ANALYTICS', 'SETTINGS', 'REPORT')`);
    await queryRunner.query(`CREATE TYPE "field_type" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'EMAIL', 'PHONE', 'URL', 'FILE', 'IMAGE', 'CURRENCY', 'PERCENTAGE', 'JSON', 'RICH_TEXT', 'COLOR', 'RATING', 'SLIDER', 'ADDRESS', 'LOCATION', 'SIGNATURE')`);
    await queryRunner.query(`CREATE TYPE "entity_type" AS ENUM ('TENDER', 'BID', 'ORGANIZATION', 'USER', 'EMD', 'DOCUMENT', 'CONTRACT', 'VENDOR')`);
    await queryRunner.query(`CREATE TYPE "knowledge_type" AS ENUM ('TENDER_RULES', 'COMPLIANCE_REQUIREMENTS', 'TECHNICAL_SPECIFICATIONS', 'EVALUATION_CRITERIA', 'LEGAL_TERMS', 'INDUSTRY_STANDARDS', 'BEST_PRACTICES', 'FAQ', 'GLOSSARY', 'CUSTOM')`);
    await queryRunner.query(`CREATE TYPE "knowledge_source" AS ENUM ('MANUAL_ENTRY', 'DOCUMENT_UPLOAD', 'WEB_SCRAPING', 'API_INTEGRATION', 'AI_GENERATED', 'USER_FEEDBACK')`);
    await queryRunner.query(`CREATE TYPE "contract_type" AS ENUM ('service', 'supply', 'works', 'consultancy', 'framework', 'maintenance', 'license', 'other')`);
    await queryRunner.query(`CREATE TYPE "contract_status" AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'suspended', 'terminated', 'completed', 'expired', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "payment_terms" AS ENUM ('advance', 'on_delivery', 'net_30', 'net_60', 'net_90', 'milestone', 'custom')`);
    await queryRunner.query(`CREATE TYPE "vendor_status" AS ENUM ('pending_verification', 'verified', 'suspended', 'blacklisted', 'inactive')`);
    await queryRunner.query(`CREATE TYPE "vendor_category" AS ENUM ('manufacturer', 'distributor', 'service_provider', 'contractor', 'consultant', 'supplier', 'other')`);
    await queryRunner.query(`CREATE TYPE "verification_status" AS ENUM ('not_started', 'in_progress', 'pending_documents', 'under_review', 'approved', 'rejected')`);
    await queryRunner.query(`CREATE TYPE "guarantee_type" AS ENUM ('emd', 'performance', 'advance_payment', 'retention', 'warranty')`);
    await queryRunner.query(`CREATE TYPE "guarantee_status" AS ENUM ('draft', 'submitted', 'verified', 'active', 'claimed', 'released', 'expired', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "metric_type" AS ENUM ('count', 'sum', 'average', 'percentage', 'ratio', 'custom')`);
    await queryRunner.query(`CREATE TYPE "metric_category" AS ENUM ('tender', 'bid', 'organization', 'user', 'financial', 'performance', 'compliance')`);
    await queryRunner.query(`CREATE TYPE "aggregation_period" AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')`);
    await queryRunner.query(`CREATE TYPE "payment_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded')`);
    await queryRunner.query(`CREATE TYPE "payment_type" AS ENUM ('tender_fee', 'emd', 'performance_guarantee', 'contract_payment', 'milestone_payment', 'advance_payment', 'final_payment', 'penalty', 'refund', 'other')`);
    await queryRunner.query(`CREATE TYPE "payment_method_enum" AS ENUM ('bank_transfer', 'credit_card', 'debit_card', 'net_banking', 'upi', 'wallet', 'cheque', 'demand_draft', 'cash')`);
    await queryRunner.query(`CREATE TYPE "payment_mode" AS ENUM ('online', 'offline')`);
    await queryRunner.query(`CREATE TYPE "workflow_type" AS ENUM ('tender_approval', 'bid_evaluation', 'contract_approval', 'vendor_verification', 'payment_approval', 'document_approval', 'user_onboarding', 'purchase_request', 'custom')`);
    await queryRunner.query(`CREATE TYPE "workflow_status" AS ENUM ('draft', 'active', 'inactive', 'archived')`);
    await queryRunner.query(`CREATE TYPE "step_status" AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'skipped', 'cancelled')`);

    // Create tables
    // Organizations
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) UNIQUE NOT NULL,
        "type" "organization_type" NOT NULL,
        "registrationNumber" VARCHAR(255),
        "taxId" VARCHAR(255),
        "website" VARCHAR(255),
        "email" VARCHAR(255),
        "phone" VARCHAR(50),
        "address" TEXT,
        "city" VARCHAR(100),
        "state" VARCHAR(100),
        "country" VARCHAR(100),
        "postalCode" VARCHAR(20),
        "logo" VARCHAR(500),
        "isActive" BOOLEAN DEFAULT true,
        "isVerified" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        "phoneNumber" VARCHAR(50),
        "roles" "user_role"[] DEFAULT ARRAY['user']::"user_role"[],
        "status" "user_status" DEFAULT 'pending',
        "organizationId" UUID REFERENCES "organizations"("id"),
        "department" VARCHAR(255),
        "designation" VARCHAR(255),
        "profilePicture" VARCHAR(500),
        "emailVerified" BOOLEAN DEFAULT false,
        "emailVerificationToken" VARCHAR(255),
        "emailVerifiedAt" TIMESTAMP,
        "twoFactorEnabled" BOOLEAN DEFAULT false,
        "twoFactorSecret" VARCHAR(255),
        "lastLoginAt" TIMESTAMP,
        "lastLoginIp" VARCHAR(45),
        "passwordResetToken" VARCHAR(255),
        "passwordResetExpires" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Refresh tokens
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "token" VARCHAR(500) UNIQUE NOT NULL,
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tenders
    await queryRunner.query(`
      CREATE TABLE "tenders" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "referenceNumber" VARCHAR(255) UNIQUE NOT NULL,
        "title" VARCHAR(500) NOT NULL,
        "description" TEXT NOT NULL,
        "type" "tender_type" NOT NULL,
        "status" "tender_status" DEFAULT 'draft',
        "organizationId" UUID NOT NULL REFERENCES "organizations"("id"),
        "createdById" UUID NOT NULL REFERENCES "users"("id"),
        "category" VARCHAR(255),
        "subCategory" VARCHAR(255),
        "estimatedValue" DECIMAL(15,2) NOT NULL,
        "emdAmount" DECIMAL(15,2) NOT NULL,
        "emdPercentage" DECIMAL(5,2),
        "publishDate" TIMESTAMP NOT NULL,
        "bidOpeningDate" TIMESTAMP NOT NULL,
        "bidClosingDate" TIMESTAMP NOT NULL,
        "preQualificationDate" TIMESTAMP,
        "location" VARCHAR(500),
        "deliveryPeriod" VARCHAR(255),
        "warrantyPeriod" VARCHAR(255),
        "eligibilityCriteria" JSONB,
        "technicalRequirements" JSONB,
        "commercialTerms" JSONB,
        "isMultipleWinnersAllowed" BOOLEAN DEFAULT false,
        "maxWinners" INTEGER,
        "tags" TEXT[],
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bids
    await queryRunner.query(`
      CREATE TABLE "bids" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "bidNumber" VARCHAR(255) UNIQUE NOT NULL,
        "tenderId" UUID NOT NULL REFERENCES "tenders"("id"),
        "bidderId" UUID NOT NULL REFERENCES "users"("id"),
        "status" "bid_status" DEFAULT 'draft',
        "quotedAmount" DECIMAL(15,2) NOT NULL,
        "emdAmount" DECIMAL(15,2),
        "emdReferenceNumber" VARCHAR(255),
        "emdSubmissionDate" TIMESTAMP,
        "technicalProposal" JSONB,
        "commercialProposal" JSONB,
        "deliveryPeriod" VARCHAR(255),
        "paymentTerms" VARCHAR(255),
        "warrantyPeriod" VARCHAR(255),
        "remarks" TEXT,
        "submissionDate" TIMESTAMP NOT NULL,
        "isWithdrawn" BOOLEAN DEFAULT false,
        "withdrawnAt" TIMESTAMP,
        "withdrawalReason" TEXT,
        "evaluationScores" JSONB,
        "rank" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Continue with other tables...
    // Add all remaining tables from the schema

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_organization" ON "users"("organizationId")`);
    await queryRunner.query(`CREATE INDEX "idx_users_status" ON "users"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_tenders_reference" ON "tenders"("referenceNumber")`);
    await queryRunner.query(`CREATE INDEX "idx_tenders_organization" ON "tenders"("organizationId")`);
    await queryRunner.query(`CREATE INDEX "idx_tenders_status" ON "tenders"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_bids_tender" ON "bids"("tenderId")`);
    await queryRunner.query(`CREATE INDEX "idx_bids_bidder" ON "bids"("bidderId")`);
    await queryRunner.query(`CREATE INDEX "idx_bids_status" ON "bids"("status")`);

    // Create update timestamp trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Apply triggers
    await queryRunner.query(`CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON "organizations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
    await queryRunner.query(`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
    await queryRunner.query(`CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON "tenders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
    await queryRunner.query(`CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON "bids" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_bids_updated_at ON "bids"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_tenders_updated_at ON "tenders"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_organizations_updated_at ON "organizations"`);

    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bids_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bids_bidder"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bids_tender"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tenders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tenders_organization"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tenders_reference"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_organization"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "bids"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "step_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "workflow_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "workflow_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_mode"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "aggregation_period"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "metric_category"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "metric_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "guarantee_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "guarantee_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "verification_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vendor_category"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vendor_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_terms"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "contract_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "contract_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "knowledge_source"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "knowledge_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "entity_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "field_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "audit_module"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "audit_action"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_channel"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "emd_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "document_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "bid_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tender_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tender_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "organization_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
