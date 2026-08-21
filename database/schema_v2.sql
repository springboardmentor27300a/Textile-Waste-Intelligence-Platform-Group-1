-- Schema v2 for AI Textile Waste Intelligence Platform

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    company VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    fabric_type VARCHAR(100) NOT NULL,
    source VARCHAR(255) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    color VARCHAR(100) NOT NULL,
    condition VARCHAR(100) NOT NULL,
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(100) NOT NULL,
    remarks TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on batch_id and user_id
CREATE INDEX IF NOT EXISTS idx_inventory_batch_id ON inventory(batch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);

-- AI Analyses Table (New in Milestone 2)
CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    fabric_type VARCHAR(100) NOT NULL,
    material_prediction JSON NOT NULL,
    waste_category VARCHAR(100) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    sustainability_score DOUBLE PRECISION NOT NULL,
    recommendation JSON NOT NULL,
    visual_features JSON NOT NULL,
    sustainability_metrics JSON NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on user_id in AI analyses table
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
