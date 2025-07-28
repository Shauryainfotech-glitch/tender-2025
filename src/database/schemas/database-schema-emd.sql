-- EMD Master Table
CREATE TABLE emd_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id),
    firm_id UUID REFERENCES firms(id),
    base_amount DECIMAL(15,2) NOT NULL,
    final_amount DECIMAL(15,2) NOT NULL,
    exemption_applied JSONB,
    payment_mode ENUM('Online', 'DD', 'BG', 'FDR'),
    payment_status ENUM('Pending', 'Initiated', 'Completed', 'Failed', 'Refunded'),
    validity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DD Management Table
CREATE TABLE demand_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emd_id UUID REFERENCES emd_master(id),
    dd_number VARCHAR(50) UNIQUE,
    bank_name VARCHAR(100),
    branch VARCHAR(100),
    issue_date DATE,
    amount DECIMAL(15,2),
    payee_name VARCHAR(200),
    status ENUM('Requested', 'Issued', 'Submitted', 'Encashed', 'Returned'),
    scan_document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type ENUM('EMD', 'TenderFee', 'Security', 'Other'),
    reference_id UUID,
    transaction_id VARCHAR(100) UNIQUE,
    gateway VARCHAR(50),
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('Pending', 'Success', 'Failed', 'Refunded'),
    gateway_response JSONB,
    receipt_url VARCHAR(500),
    refund_id VARCHAR(100),
    refund_amount DECIMAL(15,2),
    refund_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMD Refund Tracking
CREATE TABLE emd_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emd_id UUID REFERENCES emd_master(id),
    refund_amount DECIMAL(15,2),
    refund_reason VARCHAR(500),
    refund_mode ENUM('Online', 'Cheque', 'DD', 'NEFT'),
    refund_reference VARCHAR(100),
    initiated_date TIMESTAMP,
    completed_date TIMESTAMP,
    status ENUM('Pending', 'Processing', 'Completed', 'Failed'),
    approved_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_emd_tender_firm ON emd_master(tender_id, firm_id);
CREATE INDEX idx_emd_payment_status ON emd_master(payment_status);
CREATE INDEX idx_payment_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX idx_payment_reference ON payment_transactions(reference_type, reference_id);
CREATE INDEX idx_dd_number ON demand_drafts(dd_number);
CREATE INDEX idx_refund_status ON emd_refunds(status);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emd_master_updated_at BEFORE UPDATE
    ON emd_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();