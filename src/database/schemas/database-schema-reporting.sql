-- Report Templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    category ENUM('Executive', 'Operational', 'Financial', 'Compliance', 'Custom'),
    description TEXT,
    template_config JSONB,
    data_sources JSONB,
    visualizations JSONB,
    filters JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Reports
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id),
    title VARCHAR(300),
    generated_by UUID REFERENCES users(id),
    date_range_start DATE,
    date_range_end DATE,
    filters_applied JSONB,
    file_url VARCHAR(500),
    file_size INTEGER,
    format ENUM('PDF', 'Excel', 'PPT', 'CSV'),
    generation_time_seconds INTEGER,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report Schedules
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id),
    name VARCHAR(200),
    frequency ENUM('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'),
    schedule_config JSONB,
    recipients JSONB,
    format VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Configurations
CREATE TABLE dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(200),
    type ENUM('Executive', 'Operational', 'Financial', 'Custom'),
    layout JSONB,
    widgets JSONB,
    refresh_interval INTEGER DEFAULT 300, -- seconds
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Metrics
CREATE TABLE analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE,
    metric_type VARCHAR(100),
    dimension_1 VARCHAR(100), -- e.g., category, firm, department
    dimension_2 VARCHAR(100), -- e.g., location, tender_type
    metric_value DECIMAL(15,2),
    count INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_type, dimension_1, dimension_2)
);

-- Create indexes
CREATE INDEX idx_report_template_category ON report_templates(category);
CREATE INDEX idx_generated_reports_template ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_user ON generated_reports(generated_by);
CREATE INDEX idx_report_schedules_active ON report_schedules(is_active, next_run);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(metric_date);
CREATE INDEX idx_analytics_metrics_type ON analytics_metrics(metric_type);

-- Materialized Views for Analytics
CREATE MATERIALIZED VIEW mv_tender_analytics AS
WITH tender_stats AS (
    SELECT
        DATE_TRUNC('month', t.created_at) as month,
        t.category,
        t.department,
        COUNT(DISTINCT t.id) as tender_count,
        SUM(t.estimated_value) as total_value,
        AVG(t.estimated_value) as avg_value,
        COUNT(DISTINCT b.id) as bid_count,
        COUNT(DISTINCT CASE WHEN b.award_status = 'Awarded' THEN b.id END) as won_count
    FROM tenders t
    LEFT JOIN bids b ON t.id = b.tender_id
    GROUP BY DATE_TRUNC('month', t.created_at), t.category, t.department
)
SELECT 
    *,
    CASE 
        WHEN bid_count > 0 THEN (won_count::DECIMAL / bid_count * 100)
        ELSE 0 
    END as win_rate
FROM tender_stats;

CREATE INDEX idx_mv_tender_analytics ON mv_tender_analytics(month, category);

-- Refresh materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tender_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_firm_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_emd_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh
SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT refresh_analytics_views()');