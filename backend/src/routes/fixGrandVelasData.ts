import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Fix all Grand Velas data issues
router.post('/fixAllData', async (req, res) => {
  try {
    // First, delete the problematic Oceanfront Terrace venue
    await pool.query(`
      DELETE FROM hotel_venues 
      WHERE name = 'Oceanfront Terrace' 
      AND hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
    `);

    // Update any venues that might have external images
    await pool.query(`
      UPDATE hotel_venues 
      SET images = CASE 
        WHEN images::text LIKE '%grandvelas.com%' THEN '[]'::jsonb
        ELSE images
      END
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
    `);

    // Fix any invalid JSON in attributes or details
    await pool.query(`
      UPDATE hotel_venues 
      SET attributes = CASE 
        WHEN attributes IS NOT NULL AND jsonb_typeof(attributes) != 'object' THEN '{}'::jsonb
        ELSE attributes
      END,
      details = CASE 
        WHEN details IS NOT NULL AND jsonb_typeof(details) != 'object' THEN '{}'::jsonb
        ELSE details
      END
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
    `);

    // Do the same for dining
    await pool.query(`
      UPDATE hotel_dining 
      SET images = CASE 
        WHEN images::text LIKE '%grandvelas.com%' THEN '[]'::jsonb
        ELSE images
      END,
      attributes = CASE 
        WHEN attributes IS NOT NULL AND jsonb_typeof(attributes) != 'object' THEN '{}'::jsonb
        ELSE attributes
      END
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
    `);

    // Get counts
    const { rows: venueCounts } = await pool.query(`
      SELECT COUNT(*) as count FROM hotel_venues 
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
    `);

    const { rows: diningCounts } = await pool.query(`
      SELECT COUNT(*) as count FROM hotel_dining 
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
    `);

    res.json({
      message: 'Fixed Grand Velas data',
      venues: venueCounts[0].count,
      dining: diningCounts[0].count
    });
  } catch (error) {
    console.error('Error fixing data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
