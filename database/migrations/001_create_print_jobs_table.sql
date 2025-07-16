
-- MySQL Migration for Print Jobs
-- Created: 2025-01-16

-- Create print_jobs table
CREATE TABLE IF NOT EXISTS print_jobs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'printing', 'completed', 'failed') DEFAULT 'pending',
    pages INT DEFAULT 1 NOT NULL,
    copies INT DEFAULT 1 NOT NULL,
    color BOOLEAN DEFAULT FALSE NOT NULL,
    double_sided BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_print_jobs_status (status),
    INDEX idx_print_jobs_created_at (created_at)
);

-- Create print_settings table for user preferences
CREATE TABLE IF NOT EXISTS print_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    default_printer VARCHAR(255) DEFAULT 'Office Printer (HP LaserJet Pro)',
    default_color BOOLEAN DEFAULT FALSE,
    default_double_sided BOOLEAN DEFAULT TRUE,
    default_copies INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_settings (user_id)
);

-- Insert default print settings
INSERT INTO print_settings (user_id, default_printer, default_color, default_double_sided, default_copies) 
VALUES 
('default', 'Office Printer (HP LaserJet Pro)', FALSE, TRUE, 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Create print_history view for completed jobs
CREATE OR REPLACE VIEW print_history AS
SELECT 
    id,
    name,
    file_name,
    pages,
    copies,
    color,
    double_sided,
    status,
    created_at
FROM print_jobs 
WHERE status IN ('completed', 'failed')
ORDER BY created_at DESC;
