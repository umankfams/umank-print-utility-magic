
-- Finance Module Database Schema
-- This migration creates tables for financial transactions and categories

-- Create categories table for expense/income categorization
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Folder',
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    type ENUM('expense', 'income') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categories_type (type),
    INDEX idx_categories_key (`key`)
);

-- Create transactions table for financial records
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    type ENUM('expense', 'income') NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_transactions_date (date),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_category (category),
    INDEX idx_transactions_amount (amount),
    
    FOREIGN KEY (category) REFERENCES categories(`key`) ON UPDATE CASCADE
);

-- Insert default expense categories
INSERT INTO categories (`key`, label, icon, color, type, is_default) VALUES
('makanan-minuman', 'Makanan & Minuman', 'Utensils', '#F59E0B', 'expense', TRUE),
('transportasi', 'Transportasi', 'Car', '#3B82F6', 'expense', TRUE),
('perumahan', 'Perumahan', 'Home', '#EC4899', 'expense', TRUE),
('utilitas', 'Utilitas', 'Zap', '#06B6D4', 'expense', TRUE),
('kesehatan', 'Kesehatan', 'Heart', '#84CC16', 'expense', TRUE),
('belanja', 'Belanja', 'ShoppingBag', '#8B5CF6', 'expense', TRUE),
('hiburan', 'Hiburan', 'GamepadIcon', '#EF4444', 'expense', TRUE),
('pendidikan', 'Pendidikan', 'BookOpen', '#10B981', 'expense', TRUE),
('lainnya-expense', 'Lainnya', 'MoreHorizontal', '#64748B', 'expense', TRUE);

-- Insert default income categories
INSERT INTO categories (`key`, label, icon, color, type, is_default) VALUES
('gaji', 'Gaji', 'Briefcase', '#10B981', 'income', TRUE),
('investasi', 'Investasi', 'TrendingUp', '#3B82F6', 'income', TRUE),
('bonus', 'Bonus', 'Gift', '#F59E0B', 'income', TRUE),
('tabungan', 'Tabungan', 'PiggyBank', '#EC4899', 'income', TRUE),
('bisnis', 'Bisnis', 'DollarSign', '#06B6D4', 'income', TRUE),
('freelance', 'Freelance', 'Award', '#8B5CF6', 'income', TRUE),
('dividen', 'Dividen', 'Coins', '#84CC16', 'income', TRUE),
('lainnya-income', 'Lainnya', 'MoreHorizontal', '#64748B', 'income', TRUE);

-- Create view for transaction summary by category
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    c.label as category_name,
    c.icon as category_icon,
    c.color as category_color,
    t.type,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as average_amount,
    MIN(t.date) as first_transaction,
    MAX(t.date) as last_transaction
FROM transactions t
JOIN categories c ON t.category = c.key
GROUP BY c.label, c.icon, c.color, t.type;

-- Create view for monthly transaction summary
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
    YEAR(date) as year,
    MONTH(date) as month,
    DATE_FORMAT(date, '%Y-%m') as month_year,
    type,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM transactions
GROUP BY YEAR(date), MONTH(date), type
ORDER BY year DESC, month DESC;

-- Create view for daily balance calculation
CREATE OR REPLACE VIEW daily_balance AS
SELECT 
    date,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as daily_net,
    SUM(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)) 
        OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) as running_balance
FROM transactions
GROUP BY date
ORDER BY date;

-- Create indexes for better performance
CREATE INDEX idx_transactions_date_type ON transactions(date, type);
CREATE INDEX idx_transactions_category_date ON transactions(category, date);
