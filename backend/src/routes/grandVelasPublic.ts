import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Public endpoints to get Grand Velas data for testing/demo
router.get('/grand-velas/venues', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM hotel_venues 
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
      ORDER BY name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Grand Velas venues:', error);
    res.status(500).json({ message: 'Failed to fetch venues' });
  }
});

router.get('/grand-velas/dining', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM hotel_dining 
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
      ORDER BY name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Grand Velas dining:', error);
    res.status(500).json({ message: 'Failed to fetch dining' });
  }
});

router.get('/grand-velas/rooms', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM hotel_rooms 
      WHERE hotel_id = (SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos')
      ORDER BY name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Grand Velas rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

export default router;
