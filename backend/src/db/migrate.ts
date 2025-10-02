import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export async function applySchema(): Promise<void> {
  const schemaPaths = [
    path.join(__dirname, 'schema.sql'),
    path.join(__dirname, 'schema_extra.sql')
  ].filter(fs.existsSync);

  for (const sp of schemaPaths) {
    const sql = fs.readFileSync(sp, 'utf8');
    if (sql && sql.trim().length > 0) {
      await pool.query(sql);
    }
  }

  // Fallback: ensure core hotel tables/columns/triggers exist even if schema files weren't bundled
  const safeQueries: string[] = [
    `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
    `CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ language 'plpgsql';`,
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'viewer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS hotels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, website TEXT, description TEXT, address TEXT, city VARCHAR(100), country VARCHAR(100), latitude DECIMAL(9,6), longitude DECIMAL(9,6), rating_standard VARCHAR(20), rating_level VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    // JSONB columns
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS schema_header JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS metadata JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS identity JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS contact JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS location JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS images_media JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS accessibility_ada JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS sustainability JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS policies JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS taxes_fees JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS network_it JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS financials_group_contracting JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS catering_banquets JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS dining_outlets JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS availability_calendar JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS amenities_property JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS accommodations JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS meeting_event_spaces JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS outdoor_spaces JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS activities JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS risk_safety_compliance JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS ai_hints JSONB;`,
    `ALTER TABLE hotels ADD COLUMN IF NOT EXISTS workflow JSONB;`,
    // Other tables
    `CREATE TABLE IF NOT EXISTS hotel_users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'hotel', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS hotel_images (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE, url TEXT NOT NULL, alt TEXT, category VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    // Binary uploads table for storing image bytes safely
    `CREATE TABLE IF NOT EXISTS uploads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS hotel_rooms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, description TEXT, size_sqft INTEGER, view VARCHAR(100), capacity INTEGER, base_rate NUMERIC(10,2), images JSONB, attributes JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS hotel_venues (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, description TEXT, sqft INTEGER, ceiling_height_ft DECIMAL(5,2), capacity_reception INTEGER, capacity_banquet INTEGER, capacity_theater INTEGER, outdoor BOOLEAN DEFAULT false, details JSONB, attributes JSONB, images JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    `ALTER TABLE hotel_venues ADD COLUMN IF NOT EXISTS outdoor BOOLEAN DEFAULT false;`,
    `ALTER TABLE hotel_venues ADD COLUMN IF NOT EXISTS details JSONB;`,
    `CREATE TABLE IF NOT EXISTS hotel_dining (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, cuisine VARCHAR(100), description TEXT, hours VARCHAR(255), dress_code VARCHAR(255), details JSONB, attributes JSONB, images JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    // Ensure attributes columns exist on upgrades
    `ALTER TABLE hotel_rooms ADD COLUMN IF NOT EXISTS attributes JSONB;`,
    `ALTER TABLE hotel_venues ADD COLUMN IF NOT EXISTS attributes JSONB;`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS attributes JSONB;`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS details JSONB;`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR(100);`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS meal_periods JSONB;`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS price_range VARCHAR(10);`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS capacity INTEGER;`,
    `ALTER TABLE hotel_dining ADD COLUMN IF NOT EXISTS hours_of_operation TEXT;`,
    `ALTER TABLE hotel_dining ALTER COLUMN dress_code TYPE VARCHAR(255);`,
    `CREATE TABLE IF NOT EXISTS hotel_rates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE, room_id UUID REFERENCES hotel_rooms(id) ON DELETE CASCADE, season VARCHAR(100), start_date DATE, end_date DATE, rate NUMERIC(10,2));`,
    // Proposals table
    `CREATE TABLE IF NOT EXISTS proposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shareable_link UUID DEFAULT gen_random_uuid(),
      status VARCHAR(20) DEFAULT 'draft',
      view_count INTEGER DEFAULT 0,
      last_viewed_at TIMESTAMP,
      client JSONB NOT NULL,
      event_details JSONB NOT NULL,
      destination JSONB,
      resort JSONB,
      selected_rooms JSONB[],
      selected_spaces JSONB[],
      selected_dining JSONB[],
      flight_routes JSONB[],
      program_flow JSONB,
      branding JSONB,
      metadata JSONB,
      generated_content JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // Ensure metadata column exists for older databases
    `ALTER TABLE proposals ADD COLUMN IF NOT EXISTS metadata JSONB;`,
    // Triggers idempotent
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END$$;`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotels_updated_at') THEN CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END$$;`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotel_users_updated_at') THEN CREATE TRIGGER update_hotel_users_updated_at BEFORE UPDATE ON hotel_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END$$;`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proposals_updated_at') THEN CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END$$;`
  ];

  for (const q of safeQueries) {
    try {
      await pool.query(q);
    } catch (e) {
      // Log and continue to ensure idempotency
      console.error('applySchema step failed (continuing):', (e as any)?.message);
    }
  }
  console.log('Database schema applied successfully');
}



