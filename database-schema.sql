-- Tender Management System Database Schema
-- PostgreSQL Database Schema for NeonDB
-- Created on: 2025-07-26

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS emd_transactions CASCADE;
DROP TABLE IF EXISTS emds CASCADE;
DROP TABLE IF EXISTS bank_guarantees CASCADE;
DROP TABLE IF EXISTS insurance_policies CASCADE;
DROP TABLE IF EXISTS security_deposits CASCADE;
DROP TABLE IF EXISTS custom_field_values CASCADE;
DROP TABLE IF EXISTS custom_fields CASCADE;
DROP TABLE IF EXISTS custom_field_templates CASCADE;
DROP TABLE IF EXISTS processing_results CASCADE;
DROP TABLE IF EXISTS document_processing_jobs CASCADE;
DROP TABLE IF EXISTS processing_templates CASCADE;
DROP TABLE IF EXISTS knowledge_bases CASCADE;
DROP TABLE IF EXISTS analytics_reports CASCADE;
DROP TABLE IF EXISTS analytics_metrics CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS tenders CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'vendor', 'buyer', 'auditor', 'user');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE organization_type AS ENUM ('government', 'private', 'public_sector', 'ngo', 'vendor');
CREATE TYPE tender_status AS ENUM ('draft', 'published', 'active', 'closed', 'awarded', 'cancelled', 'suspended');
CREATE TYPE tender_type AS ENUM ('open', 'restricted', 'negotiated', 'single_source');
CREATE TYPE bid_status AS ENUM ('draft', 'submitted', 'under_review', 'qualified', 'disqualified', 'awarded', 'rejected', 'withdrawn');
CREATE TYPE document_type AS ENUM ('tender_notice', 'technical_specs', 'commercial_terms', 'eligibility_criteria', 'drawings', 'boq', 'corrigendum', 'addendum', 'bid_document', 'emd_receipt', 'other');
CREATE TYPE emd_status AS ENUM ('pending', 'paid', 'verified', 'refunded', 'forfeited', 'expired');
CREATE TYPE payment_method AS ENUM ('bank_guarantee', 'demand_draft', 'online_payment', 'neft', 'rtgs');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'forfeiture', 'adjustment');
CREATE TYPE transaction_status AS ENUM ('initiated', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('tender_created', 'tender_published', 'tender_closed', 'tender_awarded', 'bid_submitted', 'bid_evaluated', 'bid_selected', 'bid_rejected', 'document_uploaded', 'organization_verified', 'user_registered', 'password_reset', 'general');
CREATE TYPE notification_channel AS ENUM ('email', 'in_app', 'both');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'APPROVE', 'REJECT', 'SUBMIT', 'WITHDRAW', 'PUBLISH', 'CLOSE', 'AWARD', 'VERIFY', 'REFUND', 'FORFEIT');
CREATE TYPE audit_module AS ENUM ('AUTH', 'USER', 'ORGANIZATION', 'TENDER', 'BID', 'EMD', 'DOCUMENT', 'NOTIFICATION', 'ANALYTICS', 'SETTINGS', 'REPORT');
CREATE TYPE field_type AS ENUM ('TEXT', 'NUMBER', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'EMAIL', 'PHONE', 'URL', 'FILE', 'IMAGE', 'CURRENCY', 'PERCENTAGE', 'JSON', 'RICH_TEXT', 'COLOR', 'RATING', 'SLIDER', 'ADDRESS', 'LOCATION', 'SIGNATURE');
CREATE TYPE entity_type AS ENUM ('TENDER', 'BID', 'ORGANIZATION', 'USER', 'EMD', 'DOCUMENT', 'CONTRACT', 'VENDOR');
CREATE TYPE knowledge_type AS ENUM ('TENDER_RULES', 'COMPLIANCE_REQUIREMENTS', 'TECHNICAL_SPECIFICATIONS', 'EVALUATION_CRITERIA', 'LEGAL_TERMS', 'INDUSTRY_STANDARDS', 'BEST_PRACTICES', 'FAQ', 'GLOSSARY', 'CUSTOM');
CREATE TYPE knowledge_source AS ENUM ('MANUAL_ENTRY', 'DOCUMENT_UPLOAD', 'WEB_SCRAPING', 'API_INTEGRATION', 'AI_GENERATED', 'USER_FEEDBACK');
CREATE TYPE contract_type AS ENUM ('service', 'supply', 'works', 'consultancy', 'framework', 'maintenance', 'license', 'other');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'suspended', 'terminated', 'completed', 'expired', 'cancelled');
CREATE TYPE payment_terms AS ENUM ('advance', 'on_delivery', 'net_30', 'net_60', 'net_90', 'milestone', 'custom');
CREATE TYPE vendor_status AS ENUM ('pending_verification', 'verified', 'suspended', 'blacklisted', 'inactive');
CREATE TYPE vendor_category AS ENUM ('manufacturer', 'distributor', 'service_provider', 'contractor', 'consultant', 'supplier', 'other');
CREATE TYPE verification_status AS ENUM ('not_started', 'in_progress', 'pending_documents', 'under_review', 'approved', 'rejected');
CREATE TYPE guarantee_type AS ENUM ('emd', 'performance', 'advance_payment', 'retention', 'warranty');
CREATE TYPE guarantee_status AS ENUM ('draft', 'submitted', 'verified', 'active', 'claimed', 'released', 'expired', 'cancelled');
CREATE TYPE metric_type AS ENUM ('count', 'sum', 'average', 'percentage', 'ratio', 'custom');
CREATE TYPE metric_category AS ENUM ('tender', 'bid', 'organization', 'user', 'financial', 'performance', 'compliance');
CREATE TYPE aggregation_period AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    type organization_type NOT NULL,
    registration_number VARCHAR(255),
    tax_id VARCHAR(255),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    logo VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    roles user_role[] DEFAULT ARRAY['user']::user_role[],
    status user_status DEFAULT 'pending',
    organization_id UUID REFERENCES organizations(id),
    department VARCHAR(255),
    designation VARCHAR(255),
    profile_picture VARCHAR(500),
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenders table
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    type tender_type NOT NULL,
    status tender_status DEFAULT 'draft',
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    category VARCHAR(255),
    sub_category VARCHAR(255),
    estimated_value DECIMAL(15,2) NOT NULL,
    emd_amount DECIMAL(15,2) NOT NULL,
    emd_percentage DECIMAL(5,2),
    publish_date TIMESTAMP NOT NULL,
    bid_opening_date TIMESTAMP NOT NULL,
    bid_closing_date TIMESTAMP NOT NULL,
    pre_qualification_date TIMESTAMP,
    location VARCHAR(500),
    delivery_period VARCHAR(255),
    warranty_period VARCHAR(255),
    eligibility_criteria JSONB,
    technical_requirements JSONB,
    commercial_terms JSONB,
    is_multiple_winners_allowed BOOLEAN DEFAULT false,
    max_winners INTEGER,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_number VARCHAR(255) UNIQUE NOT NULL,
    tender_id UUID NOT NULL REFERENCES tenders(id),
    bidder_id UUID NOT NULL REFERENCES users(id),
    status bid_status DEFAULT 'draft',
    quoted_amount DECIMAL(15,2) NOT NULL,
    emd_amount DECIMAL(15,2),
    emd_reference_number VARCHAR(255),
    emd_submission_date TIMESTAMP,
    technical_proposal JSONB,
    commercial_proposal JSONB,
    delivery_period VARCHAR(255),
    payment_terms VARCHAR(255),
    warranty_period VARCHAR(255),
    remarks TEXT,
    submission_date TIMESTAMP NOT NULL,
    is_withdrawn BOOLEAN DEFAULT false,
    withdrawn_at TIMESTAMP,
    withdrawal_reason TEXT,
    evaluation_scores JSONB,
    rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    type document_type NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    tender_id UUID REFERENCES tenders(id),
    uploaded_by_id UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    description TEXT,
    version VARCHAR(50),
    checksum VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMDs table
CREATE TABLE emds (
    id SERIAL PRIMARY KEY,
    emd_number VARCHAR(255) UNIQUE NOT NULL,
    tender_id INTEGER NOT NULL,
    bid_id INTEGER,
    organization_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method payment_method NOT NULL,
    instrument_number VARCHAR(255),
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    instrument_date DATE,
    validity_date DATE NOT NULL,
    status emd_status DEFAULT 'pending',
    verification_remarks TEXT,
    verified_by INTEGER,
    verified_at TIMESTAMP,
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    forfeiture_reason TEXT,
    forfeited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMD Transactions table
CREATE TABLE emd_transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(255) UNIQUE NOT NULL,
    emd_id INTEGER NOT NULL REFERENCES emds(id),
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status transaction_status DEFAULT 'initiated',
    reference_number VARCHAR(255),
    payment_gateway VARCHAR(255),
    remarks TEXT,
    metadata JSONB,
    initiated_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    path VARCHAR(1000) NOT NULL,
    url VARCHAR(1000),
    entity_type VARCHAR(50),
    entity_id INTEGER,
    document_type VARCHAR(50),
    metadata JSONB,
    uploaded_by_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type notification_type DEFAULT 'general',
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    channel notification_channel DEFAULT 'in_app',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    metadata JSONB,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    action_url VARCHAR(1000),
    recipient_id UUID REFERENCES users(id),
    recipient_email VARCHAR(255),
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP,
    email_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module audit_module NOT NULL,
    action audit_action NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    entity_name VARCHAR(500),
    old_value JSONB,
    new_value JSONB,
    changes JSONB,
    description TEXT,
    user_id INTEGER NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    organization_id INTEGER,
    organization_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    endpoint VARCHAR(500),
    method VARCHAR(10),
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB,
    is_sensitive BOOLEAN DEFAULT false,
    is_system_action BOOLEAN DEFAULT false,
    execution_time INTEGER,
    browser_info VARCHAR(255),
    os_info VARCHAR(255),
    device_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Fields table
CREATE TABLE custom_fields (
    id SERIAL PRIMARY KEY,
    field_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    field_type field_type NOT NULL,
    entity_type entity_type NOT NULL,
    section VARCHAR(255),
    options JSONB,
    validation JSONB,
    conditional_logic JSONB,
    is_required BOOLEAN DEFAULT false,
    is_unique BOOLEAN DEFAULT false,
    is_searchable BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT false,
    is_sortable BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    help_text TEXT,
    tooltip TEXT,
    icon VARCHAR(50),
    css_class VARCHAR(255),
    permissions JSONB,
    organization_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    display_settings JSONB,
    dependencies JSONB,
    transformations JSONB,
    track_changes BOOLEAN DEFAULT true,
    encrypt_value BOOLEAN DEFAULT false
);

-- Custom Field Values table
CREATE TABLE custom_field_values (
    id SERIAL PRIMARY KEY,
    custom_field_id INTEGER NOT NULL REFERENCES custom_fields(id),
    entity_type entity_type NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    value TEXT,
    numeric_value DECIMAL(20,4),
    date_value TIMESTAMP,
    boolean_value BOOLEAN,
    json_value JSONB,
    file_value VARCHAR(1000),
    encrypted_value TEXT,
    is_valid BOOLEAN DEFAULT true,
    validation_errors JSONB,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Custom Field Templates table
CREATE TABLE custom_field_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type entity_type NOT NULL,
    fields JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    organization_id INTEGER,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Knowledge Base table
CREATE TABLE knowledge_bases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type knowledge_type NOT NULL,
    source knowledge_source NOT NULL,
    content TEXT NOT NULL,
    structured_data JSONB,
    categories TEXT[],
    keywords TEXT[],
    language VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    organization_id INTEGER,
    parent_id INTEGER,
    applicable_entities TEXT[],
    metadata JSONB,
    expires_at TIMESTAMP,
    priority INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    source_document_id INTEGER,
    source_document_url VARCHAR(1000),
    embedding_vector FLOAT[],
    embedding_model VARCHAR(255),
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    version INTEGER DEFAULT 1,
    previous_version_id INTEGER,
    is_latest_version BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_by INTEGER,
    verified_at TIMESTAMP,
    validation_history JSONB[]
);

-- Processing Templates table
CREATE TABLE processing_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    organization_id INTEGER,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Processing Jobs table
CREATE TABLE document_processing_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    document_id INTEGER,
    template_id INTEGER REFERENCES processing_templates(id),
    status VARCHAR(50) NOT NULL,
    progress INTEGER DEFAULT 0,
    input_data JSONB,
    output_data JSONB,
    error_details JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processing Results table
CREATE TABLE processing_results (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES document_processing_jobs(id),
    result_type VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(3,2),
    extracted_data JSONB,
    validation_status VARCHAR(50),
    validation_errors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type contract_type NOT NULL,
    status contract_status DEFAULT 'draft',
    contract_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_terms payment_terms DEFAULT 'net_30',
    payment_terms_details TEXT,
    scope_of_work TEXT,
    deliverables JSONB,
    milestones JSONB,
    terms_and_conditions TEXT,
    special_conditions TEXT[],
    penalties JSONB,
    performance_guarantee_required BOOLEAN,
    performance_guarantee_amount DECIMAL(15,2),
    insurance_required BOOLEAN,
    insurance_details JSONB,
    requires_digital_signature BOOLEAN DEFAULT false,
    signatures JSONB,
    document_url VARCHAR(1000),
    document_hash VARCHAR(255),
    template_id VARCHAR(255),
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),
    approval_remarks TEXT,
    signed_at TIMESTAMP,
    activated_at TIMESTAMP,
    suspended_at TIMESTAMP,
    suspension_reason TEXT,
    terminated_at TIMESTAMP,
    termination_reason TEXT,
    completed_at TIMESTAMP,
    is_renewable BOOLEAN DEFAULT false,
    renewal_notice_period_days INTEGER,
    parent_contract_id UUID,
    is_amendment BOOLEAN DEFAULT false,
    amendment_number INTEGER,
    amendments JSONB,
    performance_score DECIMAL(5,2),
    performance_metrics JSONB,
    dispute_history JSONB,
    metadata JSONB,
    vendor_id UUID NOT NULL REFERENCES organizations(id),
    buyer_id UUID NOT NULL REFERENCES organizations(id),
    tender_id UUID REFERENCES tenders(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    contract_manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(255) UNIQUE NOT NULL,
    status vendor_status DEFAULT 'pending_verification',
    category vendor_category NOT NULL,
    verification_status verification_status DEFAULT 'not_started',
    legal_name VARCHAR(500) NOT NULL,
    trade_name VARCHAR(500),
    registration_date DATE,
    tax_id VARCHAR(255),
    business_license_number VARCHAR(255),
    business_types TEXT[],
    product_categories TEXT[],
    service_categories TEXT[],
    primary_contact_name VARCHAR(255) NOT NULL,
    primary_contact_email VARCHAR(255) NOT NULL,
    primary_contact_phone VARCHAR(50) NOT NULL,
    secondary_contact_name VARCHAR(255),
    secondary_contact_email VARCHAR(255),
    secondary_contact_phone VARCHAR(50),
    business_address TEXT NOT NULL,
    billing_address TEXT,
    website VARCHAR(500),
    annual_revenue DECIMAL(15,2),
    credit_rating VARCHAR(50),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(255),
    bank_branch VARCHAR(255),
    bank_swift_code VARCHAR(20),
    certifications JSONB,
    licenses JSONB,
    insurances JSONB,
    documents JSONB,
    overall_rating DECIMAL(5,2) DEFAULT 0,
    total_contracts_completed INTEGER DEFAULT 0,
    total_contracts_in_progress INTEGER DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 100,
    quality_score DECIMAL(5,2) DEFAULT 0,
    compliance_score DECIMAL(5,2) DEFAULT 0,
    total_disputes INTEGER DEFAULT 0,
    resolved_disputes INTEGER DEFAULT 0,
    blacklist_date TIMESTAMP,
    blacklist_reason TEXT,
    blacklist_expiry_date TIMESTAMP,
    blacklist_history JSONB,
    capabilities JSONB,
    past_projects JSONB,
    preferences JSONB,
    working_areas JSONB,
    notes TEXT,
    metadata JSONB,
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    verification_remarks TEXT,
    last_activity_at TIMESTAMP,
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    account_manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Guarantees table
CREATE TABLE bank_guarantees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guarantee_number VARCHAR(255) UNIQUE NOT NULL,
    type guarantee_type NOT NULL,
    status guarantee_status DEFAULT 'draft',
    bank_name VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255) NOT NULL,
    bank_address TEXT,
    bank_swift_code VARCHAR(20),
    bank_contact_number VARCHAR(50),
    bank_contact_email VARCHAR(255),
    bank_officer_name VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    claim_period_days INTEGER,
    beneficiary_name VARCHAR(500) NOT NULL,
    beneficiary_address TEXT,
    purpose TEXT,
    terms_and_conditions TEXT,
    reference_number VARCHAR(255),
    document_url VARCHAR(1000),
    document_hash VARCHAR(255),
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    verification_remarks TEXT,
    claimed_at TIMESTAMP,
    claimed_amount DECIMAL(15,2),
    claim_reason TEXT,
    claim_reference_number VARCHAR(255),
    released_at TIMESTAMP,
    released_by VARCHAR(255),
    release_remarks TEXT,
    is_active BOOLEAN DEFAULT true,
    is_auto_renewable BOOLEAN DEFAULT false,
    renewal_days INTEGER,
    parent_guarantee_id UUID,
    requires_physical_verification BOOLEAN DEFAULT false,
    is_electronic BOOLEAN DEFAULT false,
    electronic_verification_code VARCHAR(255),
    qr_code_data TEXT,
    risk_level VARCHAR(50),
    risk_score DECIMAL(5,2),
    risk_assessment_notes TEXT,
    notification_settings JSONB,
    metadata JSONB,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tender_id UUID REFERENCES tenders(id),
    bid_id UUID REFERENCES bids(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    approved_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Policies table
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_number VARCHAR(255) UNIQUE NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    insurer_name VARCHAR(255) NOT NULL,
    insurer_address TEXT,
    insurer_contact VARCHAR(255),
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_details JSONB,
    exclusions JSONB,
    beneficiary_name VARCHAR(500),
    beneficiary_details JSONB,
    document_url VARCHAR(1000),
    document_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    verification_remarks TEXT,
    claim_history JSONB,
    renewal_date DATE,
    renewal_reminder_days INTEGER,
    metadata JSONB,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tender_id UUID REFERENCES tenders(id),
    contract_id UUID REFERENCES contracts(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Deposits table
CREATE TABLE security_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_number VARCHAR(255) UNIQUE NOT NULL,
    deposit_type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    payment_date DATE NOT NULL,
    validity_date DATE,
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    account_number VARCHAR(255),
    purpose TEXT,
    terms_and_conditions TEXT,
    status VARCHAR(50) NOT NULL,
    refund_date DATE,
    refund_amount DECIMAL(15,2),
    refund_reference VARCHAR(255),
    refund_reason TEXT,
    forfeiture_date DATE,
    forfeiture_amount DECIMAL(15,2),
    forfeiture_reason TEXT,
    document_url VARCHAR(1000),
    document_hash VARCHAR(255),
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    verification_remarks TEXT,
    metadata JSONB,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tender_id UUID REFERENCES tenders(id),
    contract_id UUID REFERENCES contracts(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Metrics table
CREATE TABLE analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    type metric_type NOT NULL,
    category metric_category NOT NULL,
    value DECIMAL(20,4) NOT NULL,
    unit VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    aggregation_period aggregation_period,
    recorded_at TIMESTAMP NOT NULL,
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    dimensions JSONB,
    tags TEXT[],
    description TEXT,
    metadata JSONB,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Reports table
CREATE TABLE analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT,
    parameters JSONB,
    filters JSONB,
    data JSONB,
    summary JSONB,
    generated_at TIMESTAMP NOT NULL,
    generated_by UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    is_scheduled BOOLEAN DEFAULT false,
    schedule_config JSONB,
    export_formats TEXT[],
    recipients TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_tenders_reference ON tenders(reference_number);
CREATE INDEX idx_tenders_organization ON tenders(organization_id);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_dates ON tenders(publish_date, bid_closing_date);

CREATE INDEX idx_bids_tender ON bids(tender_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_status ON bids(status);

CREATE INDEX idx_documents_tender ON documents(tender_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by_id);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_module ON audit_logs(module, action, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

CREATE INDEX idx_custom_fields_entity ON custom_fields(entity_type, field_name);
CREATE INDEX idx_custom_fields_org ON custom_fields(organization_id, is_active);

CREATE INDEX idx_custom_field_values_field ON custom_field_values(custom_field_id);
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);

CREATE INDEX idx_knowledge_base_type ON knowledge_bases(type, is_active);
CREATE INDEX idx_knowledge_base_org ON knowledge_bases(organization_id, type);
CREATE INDEX idx_knowledge_base_search ON knowledge_bases USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || content));

CREATE INDEX idx_contracts_number ON contracts(contract_number);
CREATE INDEX idx_contracts_tender ON contracts(tender_id, vendor_id);
CREATE INDEX idx_contracts_status ON contracts(status, start_date, end_date);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id, status);

CREATE INDEX idx_vendors_registration ON vendors(registration_number);
CREATE INDEX idx_vendors_organization ON vendors(organization_id);
CREATE INDEX idx_vendors_status ON vendors(status, category);
CREATE INDEX idx_vendors_verification ON vendors(verification_status);

CREATE INDEX idx_bank_guarantees_number ON bank_guarantees(guarantee_number);
CREATE INDEX idx_bank_guarantees_tender ON bank_guarantees(tender_id, bid_id);
CREATE INDEX idx_bank_guarantees_org ON bank_guarantees(organization_id, status);
CREATE INDEX idx_bank_guarantees_dates ON bank_guarantees(issue_date, expiry_date);

CREATE INDEX idx_analytics_metrics_name ON analytics_metrics(metric_name, entity_type, entity_id);
CREATE INDEX idx_analytics_metrics_org ON analytics_metrics(organization_id, category, recorded_at);
CREATE INDEX idx_analytics_metrics_recorded ON analytics_metrics(recorded_at);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp trigger to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emds_updated_at BEFORE UPDATE ON emds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_field_values_updated_at BEFORE UPDATE ON custom_field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_field_templates_updated_at BEFORE UPDATE ON custom_field_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_bases_updated_at BEFORE UPDATE ON knowledge_bases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_templates_updated_at BEFORE UPDATE ON processing_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_processing_jobs_updated_at BEFORE UPDATE ON document_processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_guarantees_updated_at BEFORE UPDATE ON bank_guarantees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_deposits_updated_at BEFORE UPDATE ON security_deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_metrics_updated_at BEFORE UPDATE ON analytics_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_reports_updated_at BEFORE UPDATE ON analytics_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints for EMDs table (after all tables are created)
ALTER TABLE emds ADD CONSTRAINT fk_emds_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE emds ADD CONSTRAINT fk_emds_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE emds ADD CONSTRAINT fk_emds_bid FOREIGN KEY (bid_id) REFERENCES bids(id) DEFERRABLE INITIALLY DEFERRED;

-- Add comments on tables
COMMENT ON TABLE organizations IS 'Stores organization/company information';
COMMENT ON TABLE users IS 'Stores user accounts and authentication information';
COMMENT ON TABLE tenders IS 'Stores tender/RFP information';
COMMENT ON TABLE bids IS 'Stores bid submissions for tenders';
COMMENT ON TABLE documents IS 'Stores document metadata for tender-related files';
COMMENT ON TABLE emds IS 'Stores Earnest Money Deposit information';
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON TABLE audit_logs IS 'Stores audit trail for all system actions';
COMMENT ON TABLE contracts IS 'Stores contract information between buyers and vendors';
COMMENT ON TABLE vendors IS 'Stores vendor registration and profile information';
COMMENT ON TABLE bank_guarantees IS 'Stores bank guarantee information for tenders and contracts';
COMMENT ON TABLE analytics_metrics IS 'Stores analytics metrics and KPIs';
COMMENT ON TABLE knowledge_bases IS 'Stores knowledge base articles and AI training data';

-- Grant permissions (adjust based on your user requirements)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

-- Initial seed data for system configuration
-- You can add INSERT statements here for initial system data

-- End of schema creation
