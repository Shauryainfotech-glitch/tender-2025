-- Security Master Table
CREATE TABLE security_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id),
    bid_id UUID REFERENCES bids(id),
    security_type ENUM('BidSecurity', 'PerformanceSecurity', 'WarrantySecurity', 'RetentionMoney'),
    amount DECIMAL(15,2),
    instrument_type ENUM('BG', 'FDR', 'Insurance', 'Cash'),
    validity_start_date DATE,
    validity_end_date DATE,
    status ENUM('Active', 'Expired', 'Released', 'Invoked', 'Extended'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Guarantee Details
CREATE TABLE bank_guarantees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID REFERENCES security_master(id),
    bg_number VARCHAR(100) UNIQUE,
    bank_name VARCHAR(100),
    branch VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    claim_expiry_date DATE,
    amount DECIMAL(15,2),
    beneficiary VARCHAR(300),
    purpose TEXT,
    bg_type ENUM('Conditional', 'Unconditional'),
    document_url VARCHAR(500),
    swift_code VARCHAR(20),
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_date DATE,
    renewal_count INTEGER DEFAULT 0,
    parent_bg_id UUID REFERENCES bank_guarantees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Validity Tracker
CREATE TABLE security_validity_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID REFERENCES security_master(id),
    check_date DATE,
    days_to_expiry INTEGER,
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_date TIMESTAMP,
    renewal_initiated BOOLEAN DEFAULT FALSE,
    renewal_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Policies
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID REFERENCES security_master(id),
    policy_number VARCHAR(100) UNIQUE,
    insurance_company VARCHAR(200),
    policy_type VARCHAR(100),
    sum_insured DECIMAL(15,2),
    premium_amount DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    document_url VARCHAR(500),
    claim_status ENUM('None', 'Initiated', 'Processing', 'Settled', 'Rejected'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Release/Invocation History
CREATE TABLE security_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID REFERENCES security_master(id),
    action_type ENUM('Release', 'Invoke', 'Extend', 'Renew'),
    action_date DATE,
    action_by UUID REFERENCES users(id),
    reason TEXT,
    amount DECIMAL(15,2),
    document_url VARCHAR(500),
    approval_status ENUM('Pending', 'Approved', 'Rejected'),
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_security_tender_bid ON security_master(tender_id, bid_id);
CREATE INDEX idx_security_type_status ON security_master(security_type, status);
CREATE INDEX idx_security_validity ON security_master(validity_end_date);
CREATE INDEX idx_bg_number ON bank_guarantees(bg_number);
CREATE INDEX idx_bg_expiry ON bank_guarantees(expiry_date);
CREATE INDEX idx_policy_number ON insurance_policies(policy_number);
CREATE INDEX idx_security_action_type ON security_actions(action_type, approval_status);

-- Create materialized view for security dashboard
CREATE MATERIALIZED VIEW security_dashboard_summary AS
SELECT 
    sm.security_type,
    sm.status,
    COUNT(*) as count,
    SUM(sm.amount) as total_amount,
    COUNT(CASE WHEN sm.validity_end_date < CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon,
    COUNT(CASE WHEN sm.validity_end_date < CURRENT_DATE THEN 1 END) as expired
FROM security_master sm
GROUP BY sm.security_type, sm.status;

-- Create function to check expiring securities
CREATE OR REPLACE FUNCTION check_expiring_securities()
RETURNS TABLE (
    security_id UUID,
    security_type VARCHAR,
    tender_id UUID,
    amount DECIMAL,
    days_to_expiry INTEGER,
    contact_email VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.id,
        sm.security_type::VARCHAR,
        sm.tender_id,
        sm.amount,
        (sm.validity_end_date - CURRENT_DATE)::INTEGER as days_to_expiry,
        u.email
    FROM security_master sm
    JOIN tenders t ON sm.tender_id = t.id
    JOIN users u ON t.created_by = u.id
    WHERE sm.status = 'Active'
    AND sm.validity_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    ORDER BY sm.validity_end_date;
END;
$$ LANGUAGE plpgsql;