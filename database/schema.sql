-- EventIntel Database Schema
-- PostgreSQL Schema for Render Deployment

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_start_date DATE NOT NULL,
  event_end_date DATE NOT NULL,
  attendee_count INTEGER NOT NULL,
  event_purpose VARCHAR(100),
  destination_data JSONB NOT NULL,
  resort_data JSONB NOT NULL,
  selected_rooms JSONB,
  selected_spaces JSONB,
  selected_dining JSONB,
  flight_routes JSONB,
  branding JSONB,
  generated_content JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  shareable_link UUID UNIQUE DEFAULT gen_random_uuid(),
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create proposal_views table for analytics
CREATE TABLE IF NOT EXISTS proposal_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_shareable_link ON proposals(shareable_link);
CREATE INDEX idx_proposal_views_proposal_id ON proposal_views(proposal_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, name, role)
VALUES ('admin@eventintel.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/9DQfEiW1av6KmFmCl2wnqOJqJqKe', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING; 