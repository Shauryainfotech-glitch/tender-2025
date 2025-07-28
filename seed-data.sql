-- Tender Management System Seed Data
-- Initial data for system setup
-- Created on: 2025-07-26

-- Insert sample organizations
INSERT INTO organizations (id, name, type, registration_number, tax_id, email, phone, address, city, state, country, postal_code, is_active, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ministry of Infrastructure', 'government', 'GOV-2024-001', 'GOVT123456', 'info@infrastructure.gov', '+91-11-23456789', 'Central Secretariat', 'New Delhi', 'Delhi', 'India', '110001', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'TechBuild Solutions Pvt Ltd', 'private', 'CIN-U72900DL2020PTC123456', 'AABCT1234F', 'contact@techbuild.com', '+91-11-87654321', '456 Tech Park', 'Gurugram', 'Haryana', 'India', '122001', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'Global Constructions Ltd', 'private', 'CIN-U45201MH2019PTC234567', 'AABCG5678H', 'info@globalconstructions.com', '+91-22-98765432', '789 Business Plaza', 'Mumbai', 'Maharashtra', 'India', '400001', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'Smart Infrastructure Corp', 'vendor', 'CIN-U74999KA2021PTC345678', 'AABCS9012J', 'contact@smartinfra.com', '+91-80-12345678', '123 Tech City', 'Bangalore', 'Karnataka', 'India', '560001', true, false);

-- Insert sample users (passwords are hashed version of 'Password123!')
INSERT INTO users (id, email, password, first_name, last_name, phone_number, roles, status, organization_id, department, designation, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'admin@infrastructure.gov', '$2b$10$YKqm9R8z5qZKxhKjXZ1Hq.xXQP5FY3gP3KqF8kZ9Qn1J5YdBxXqPa', 'Rajesh', 'Kumar', '+91-9876543210', ARRAY['super_admin', 'admin']::user_role[], 'active', '550e8400-e29b-41d4-a716-446655440001', 'IT Department', 'System Administrator', true),
('550e8400-e29b-41d4-a716-446655440102', 'manager@infrastructure.gov', '$2b$10$YKqm9R8z5qZKxhKjXZ1Hq.xXQP5FY3gP3KqF8kZ9Qn1J5YdBxXqPa', 'Priya', 'Sharma', '+91-9876543211', ARRAY['manager', 'buyer']::user_role[], 'active', '550e8400-e29b-41d4-a716-446655440001', 'Procurement', 'Procurement Manager', true),
('550e8400-e29b-41d4-a716-446655440103', 'vendor1@techbuild.com', '$2b$10$YKqm9R8z5qZKxhKjXZ1Hq.xXQP5FY3gP3KqF8kZ9Qn1J5YdBxXqPa', 'Amit', 'Patel', '+91-9876543212', ARRAY['vendor']::user_role[], 'active', '550e8400-e29b-41d4-a716-446655440002', 'Sales', 'Sales Manager', true),
('550e8400-e29b-41d4-a716-446655440104', 'vendor2@globalconstructions.com', '$2b$10$YKqm9R8z5qZKxhKjXZ1Hq.xXQP5FY3gP3KqF8kZ9Qn1J5YdBxXqPa', 'Sunita', 'Verma', '+91-9876543213', ARRAY['vendor']::user_role[], 'active', '550e8400-e29b-41d4-a716-446655440003', 'Business Development', 'BD Manager', true),
('550e8400-e29b-41d4-a716-446655440105', 'auditor@infrastructure.gov', '$2b$10$YKqm9R8z5qZKxhKjXZ1Hq.xXQP5FY3gP3KqF8kZ9Qn1J5YdBxXqPa', 'Vikram', 'Singh', '+91-9876543214', ARRAY['auditor']::user_role[], 'active', '550e8400-e29b-41d4-a716-446655440001', 'Audit', 'Senior Auditor', true);

-- Insert sample vendors
INSERT INTO vendors (id, registration_number, status, category, verification_status, legal_name, organization_id, primary_contact_name, primary_contact_email, primary_contact_phone, business_address, created_by_id) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'VND-2024-0001', 'verified', 'contractor', 'approved', 'TechBuild Solutions Pvt Ltd', '550e8400-e29b-41d4-a716-446655440002', 'Amit Patel', 'vendor1@techbuild.com', '+91-9876543212', '456 Tech Park, Gurugram, Haryana, India - 122001', '550e8400-e29b-41d4-a716-446655440103'),
('550e8400-e29b-41d4-a716-446655440202', 'VND-2024-0002', 'verified', 'supplier', 'approved', 'Global Constructions Ltd', '550e8400-e29b-41d4-a716-446655440003', 'Sunita Verma', 'vendor2@globalconstructions.com', '+91-9876543213', '789 Business Plaza, Mumbai, Maharashtra, India - 400001', '550e8400-e29b-41d4-a716-446655440104'),
('550e8400-e29b-41d4-a716-446655440203', 'VND-2024-0003', 'pending_verification', 'service_provider', 'pending_documents', 'Smart Infrastructure Corp', '550e8400-e29b-41d4-a716-446655440004', 'John Doe', 'contact@smartinfra.com', '+91-80-12345678', '123 Tech City, Bangalore, Karnataka, India - 560001', '550e8400-e29b-41d4-a716-446655440101');

-- Insert sample tenders
INSERT INTO tenders (id, reference_number, title, description, type, status, organization_id, created_by_id, category, estimated_value, emd_amount, emd_percentage, publish_date, bid_opening_date, bid_closing_date, location) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'TENDER-2024-001', 'Construction of Highway Bridge', 'Construction of 4-lane highway bridge over river including approach roads', 'open', 'active', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Infrastructure', 50000000.00, 1000000.00, 2.00, '2024-01-15 10:00:00', '2024-02-20 15:00:00', '2024-02-15 17:00:00', 'Delhi-Gurgaon Highway'),
('550e8400-e29b-41d4-a716-446655440302', 'TENDER-2024-002', 'IT Infrastructure Upgrade', 'Supply and installation of servers, networking equipment and software licenses', 'restricted', 'active', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'IT Equipment', 15000000.00, 300000.00, 2.00, '2024-01-20 10:00:00', '2024-02-25 15:00:00', '2024-02-20 17:00:00', 'New Delhi Data Center'),
('550e8400-e29b-41d4-a716-446655440303', 'TENDER-2024-003', 'Annual Maintenance Contract', 'Annual maintenance of government buildings and facilities', 'open', 'published', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Services', 5000000.00, 100000.00, 2.00, '2024-02-01 10:00:00', '2024-03-05 15:00:00', '2024-03-01 17:00:00', 'Multiple Locations');

-- Insert sample workflow templates
INSERT INTO workflow_templates (id, name, description, category, type, steps, is_active, is_system, created_by_id) VALUES
('550e8400-e29b-41d4-a716-446655440401', 'Standard Tender Approval', 'Standard workflow for tender approval process', 'Tender Management', 'tender_approval', 
'[{"id":"step1","name":"Initial Review","type":"review","order":1,"assignees":{"type":"role","value":["manager"]},"actions":["approve","reject","comment"],"dueInHours":24},{"id":"step2","name":"Final Approval","type":"approval","order":2,"assignees":{"type":"role","value":["admin"]},"actions":["approve","reject"],"dueInHours":48}]'::json, 
true, true, '550e8400-e29b-41d4-a716-446655440101'),

('550e8400-e29b-41d4-a716-446655440402', 'Vendor Verification Process', 'Standard workflow for vendor verification', 'Vendor Management', 'vendor_verification',
'[{"id":"step1","name":"Document Verification","type":"review","order":1,"assignees":{"type":"department","value":"Compliance"},"actions":["approve","reject","comment"],"dueInHours":72},{"id":"step2","name":"Background Check","type":"review","order":2,"assignees":{"type":"role","value":["auditor"]},"actions":["approve","reject"],"dueInHours":48}]'::json,
true, true, '550e8400-e29b-41d4-a716-446655440101'),

('550e8400-e29b-41d4-a716-446655440403', 'Payment Approval Workflow', 'Workflow for payment approvals based on amount', 'Finance', 'payment_approval',
'[{"id":"step1","name":"Manager Approval","type":"approval","order":1,"assignees":{"type":"role","value":["manager"]},"actions":["approve","reject"],"conditions":[{"field":"amount","operator":"less_than","value":1000000}]},{"id":"step2","name":"Director Approval","type":"approval","order":2,"assignees":{"type":"role","value":["admin"]},"actions":["approve","reject"],"conditions":[{"field":"amount","operator":"greater_than_or_equal","value":1000000}]}]'::json,
true, true, '550e8400-e29b-41d4-a716-446655440101');

-- Insert sample custom field templates
INSERT INTO custom_field_templates (id, name, description, entity_type, fields, is_default, is_active, created_by_id) VALUES
('550e8400-e29b-41d4-a716-446655440501', 'Tender Additional Fields', 'Additional fields for tender details', 'TENDER',
'[{"fieldName":"projectDuration","displayName":"Project Duration (Days)","fieldType":"NUMBER","required":true},{"fieldName":"warrantyPeriod","displayName":"Warranty Period (Years)","fieldType":"NUMBER","required":false},{"fieldName":"technicalQualifications","displayName":"Technical Qualifications","fieldType":"TEXTAREA","required":true}]'::jsonb,
true, true, '550e8400-e29b-41d4-a716-446655440101'),

('550e8400-e29b-41d4-a716-446655440502', 'Vendor Additional Information', 'Additional vendor profile fields', 'VENDOR',
'[{"fieldName":"establishedYear","displayName":"Year Established","fieldType":"NUMBER","required":true},{"fieldName":"employeeCount","displayName":"Number of Employees","fieldType":"NUMBER","required":true},{"fieldName":"certifications","displayName":"Certifications","fieldType":"MULTISELECT","options":{"choices":[{"value":"ISO9001","label":"ISO 9001"},{"value":"ISO14001","label":"ISO 14001"},{"value":"OHSAS18001","label":"OHSAS 18001"}]}}]'::jsonb,
true, true, '550e8400-e29b-41d4-a716-446655440101');

-- Insert sample knowledge base entries
INSERT INTO knowledge_bases (id, title, description, type, source, content, categories, keywords, is_active, is_public, created_by_id) VALUES
(1, 'Tender Submission Guidelines', 'Complete guide for tender submission process', 'TENDER_RULES', 'MANUAL_ENTRY',
'## Tender Submission Guidelines\n\n### 1. Pre-Submission Checklist\n- Ensure all required documents are ready\n- Verify EMD amount and payment\n- Check technical specifications compliance\n\n### 2. Document Requirements\n- Company registration certificate\n- Tax compliance certificates\n- Financial statements (last 3 years)\n- Technical capability documents\n\n### 3. Submission Process\n- Login to the portal\n- Select the tender\n- Upload documents in specified format\n- Pay tender fees and EMD\n- Submit before deadline',
ARRAY['tender', 'submission', 'guidelines'], ARRAY['tender', 'submission', 'documents', 'EMD', 'process'], true, true, '550e8400-e29b-41d4-a716-446655440101'),

(2, 'EMD Calculation and Payment', 'Guidelines for EMD calculation and payment methods', 'COMPLIANCE_REQUIREMENTS', 'MANUAL_ENTRY',
'## EMD (Earnest Money Deposit) Guidelines\n\n### Calculation\n- Generally 2-5% of tender value\n- Specified in tender document\n- Rounded to nearest thousand\n\n### Payment Methods\n1. Bank Guarantee\n2. Demand Draft\n3. Online Payment\n4. Fixed Deposit Receipt\n\n### Refund Process\n- Unsuccessful bidders: Within 30 days\n- Successful bidder: After contract signing\n- No interest payable on EMD',
ARRAY['EMD', 'payment', 'compliance'], ARRAY['EMD', 'earnest money', 'deposit', 'payment', 'refund'], true, true, '550e8400-e29b-41d4-a716-446655440101');

-- Insert sample notifications
INSERT INTO notifications (id, type, title, message, channel, recipient_id, entity_type, entity_id) VALUES
('550e8400-e29b-41d4-a716-446655440601', 'tender_published', 'New Tender Published', 'A new tender "Construction of Highway Bridge" has been published. Tender ID: TENDER-2024-001', 'both', '550e8400-e29b-41d4-a716-446655440103', 'tender', '550e8400-e29b-41d4-a716-446655440301'),
('550e8400-e29b-41d4-a716-446655440602', 'tender_published', 'New Tender Published', 'A new tender "IT Infrastructure Upgrade" has been published. Tender ID: TENDER-2024-002', 'both', '550e8400-e29b-41d4-a716-446655440103', 'tender', '550e8400-e29b-41d4-a716-446655440302');

-- Insert sample audit log entry
INSERT INTO audit_logs (id, module, action, entity_type, entity_id, user_id, user_name, user_email, description, ip_address) VALUES
('550e8400-e29b-41d4-a716-446655440701', 'TENDER', 'CREATE', 'tender', 1, 2, 'Priya Sharma', 'manager@infrastructure.gov', 'Created new tender: Construction of Highway Bridge', '192.168.1.100');

-- Create default payment and workflow tables data
-- Note: Since we just created the Payment and Workflow entities, we'll add their table creation here

-- Drop tables if they exist
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Create payment status, type, method enums
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE payment_type AS ENUM ('tender_fee', 'emd', 'performance_guarantee', 'contract_payment', 'milestone_payment', 'advance_payment', 'final_payment', 'penalty', 'refund', 'other');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'credit_card', 'debit_card', 'net_banking', 'upi', 'wallet', 'cheque', 'demand_draft', 'cash');
CREATE TYPE payment_mode AS ENUM ('online', 'offline');

-- Create workflow enums
CREATE TYPE workflow_type AS ENUM ('tender_approval', 'bid_evaluation', 'contract_approval', 'vendor_verification', 'payment_approval', 'document_approval', 'user_onboarding', 'purchase_request', 'custom');
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'inactive', 'archived');
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'skipped', 'cancelled');

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(255) UNIQUE NOT NULL,
    type payment_type NOT NULL,
    status payment_status DEFAULT 'pending',
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method payment_method_enum NOT NULL,
    payment_mode payment_mode NOT NULL,
    reference_number VARCHAR(255),
    gateway_transaction_id VARCHAR(255),
    gateway_name VARCHAR(255),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(255),
    bank_branch VARCHAR(255),
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(255),
    cheque_number VARCHAR(50),
    cheque_date DATE,
    description TEXT,
    remarks TEXT,
    invoice_number VARCHAR(255),
    invoice_date DATE,
    invoice_url VARCHAR(1000),
    receipt_number VARCHAR(255),
    receipt_url VARCHAR(1000),
    subtotal DECIMAL(15,2),
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(15,2),
    discount DECIMAL(15,2),
    tax_breakdown JSONB,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    gateway_response JSONB,
    is_refundable BOOLEAN DEFAULT false,
    refunded_amount DECIMAL(15,2),
    refunded_at TIMESTAMP,
    refund_reason TEXT,
    refund_transaction_id VARCHAR(255),
    refund_history JSONB,
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    reconciled_by VARCHAR(255),
    reconciliation_remarks TEXT,
    requires_approval BOOLEAN DEFAULT false,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    approval_remarks TEXT,
    approval_history JSONB,
    tds_rate DECIMAL(5,2),
    tds_amount DECIMAL(15,2),
    pan_number VARCHAR(20),
    gst_number VARCHAR(20),
    tan_number VARCHAR(20),
    beneficiary_details JSONB,
    milestone_details JSONB,
    due_date DATE,
    reminder_sent_at TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    attachments JSONB,
    metadata JSONB,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    vendor_id UUID REFERENCES organizations(id),
    tender_id UUID REFERENCES tenders(id),
    contract_id UUID REFERENCES contracts(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    updated_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type workflow_type NOT NULL,
    status workflow_status DEFAULT 'draft',
    is_template BOOLEAN DEFAULT false,
    template_id VARCHAR(255),
    version INTEGER DEFAULT 1,
    steps JSONB NOT NULL,
    conditions JSONB,
    notifications JSONB,
    settings JSONB,
    metadata JSONB,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow instances table
CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_number VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_name VARCHAR(500),
    status step_status DEFAULT 'pending',
    current_step_id VARCHAR(255),
    current_step_index INTEGER DEFAULT 0,
    step_instances JSONB NOT NULL,
    context JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    completed_by VARCHAR(255),
    completion_remarks TEXT,
    outcome VARCHAR(50),
    history JSONB,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    initiated_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payment and workflow tables
CREATE INDEX idx_payments_transaction_number ON payments(transaction_number);
CREATE INDEX idx_payments_organization ON payments(organization_id, status);
CREATE INDEX idx_payments_vendor ON payments(vendor_id, status);
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_created ON payments(created_at);

CREATE INDEX idx_workflows_organization ON workflows(organization_id, type);
CREATE INDEX idx_workflows_status ON workflows(status, is_template);

CREATE INDEX idx_workflow_instances_workflow ON workflow_instances(workflow_id, status);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_step ON workflow_instances(current_step_id);
CREATE INDEX idx_workflow_instances_created ON workflow_instances(created_at);

-- Insert sample payments
INSERT INTO payments (id, transaction_number, type, status, amount, payment_method, payment_mode, organization_id, tender_id, created_by_id, description) VALUES
('550e8400-e29b-41d4-a716-446655440801', 'PAY-202401-00001', 'tender_fee', 'completed', 5000.00, 'net_banking', 'online', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440103', 'Tender fee payment for TENDER-2024-001'),
('550e8400-e29b-41d4-a716-446655440802', 'PAY-202401-00002', 'emd', 'completed', 1000000.00, 'bank_transfer', 'online', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440103', 'EMD payment for TENDER-2024-001');

-- Add update timestamp triggers for new tables
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on new tables (adjust based on your requirements)
-- GRANT ALL PRIVILEGES ON payments TO your_app_user;
-- GRANT ALL PRIVILEGES ON workflows TO your_app_user;
-- GRANT ALL PRIVILEGES ON workflow_instances TO your_app_user;

-- Commit the transaction
-- COMMIT;
