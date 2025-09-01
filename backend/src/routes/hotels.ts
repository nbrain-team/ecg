import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Hotel login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(
      'SELECT id, hotel_id, email, password, name FROM hotel_users WHERE email = $1 LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'hotel', hotelId: user.hotel_id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: 'hotel', hotelId: user.hotel_id } });
  } catch (err) {
    console.error('Hotel login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current hotel profile
router.get('/me', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Missing hotelId' });
    const { rows } = await pool.query('SELECT * FROM hotels WHERE id = $1', [hotelId]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hotel profile
router.put('/me', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Missing hotelId' });
    const { name, website, description, address, city, country, latitude, longitude, rating_standard, rating_level } = req.body;
    const { rows } = await pool.query(
      `UPDATE hotels SET
        name = COALESCE($2, name),
        website = COALESCE($3, website),
        description = COALESCE($4, description),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        country = COALESCE($7, country),
        latitude = COALESCE($8, latitude),
        longitude = COALESCE($9, longitude),
        rating_standard = COALESCE($10, rating_standard),
        rating_level = COALESCE($11, rating_level),
        updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [hotelId, name, website, description, address, city, country, latitude, longitude, rating_standard, rating_level]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Images
router.get('/images', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
  const { rows } = await pool.query('SELECT * FROM hotel_images WHERE hotel_id = $1 ORDER BY created_at DESC', [hotelId]);
  res.json(rows);
});

router.post('/images', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { url, alt, category } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO hotel_images (hotel_id, url, alt, category) VALUES ($1,$2,$3,$4) RETURNING *',
    [hotelId, url, alt, category]
  );
  res.status(201).json(rows[0]);
});

// Rooms
router.get('/rooms', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
  const { rows } = await pool.query('SELECT * FROM hotel_rooms WHERE hotel_id = $1 ORDER BY created_at DESC', [hotelId]);
  res.json(rows);
});

router.post('/rooms', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { name, description, size_sqft, view, capacity, base_rate, images } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [hotelId, name, description, size_sqft, view, capacity, base_rate, JSON.stringify(images || [])]
  );
  res.status(201).json(rows[0]);
});

// Venues
router.get('/venues', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
  const { rows } = await pool.query('SELECT * FROM hotel_venues WHERE hotel_id = $1 ORDER BY created_at DESC', [hotelId]);
  res.json(rows);
});

router.post('/venues', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO hotel_venues (hotel_id, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [hotelId, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, JSON.stringify(images || [])]
  );
  res.status(201).json(rows[0]);
});

// Dining
router.get('/dining', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
  const { rows } = await pool.query('SELECT * FROM hotel_dining WHERE hotel_id = $1 ORDER BY created_at DESC', [hotelId]);
  res.json(rows);
});

router.post('/dining', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { name, cuisine, description, hours, dress_code, images } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO hotel_dining (hotel_id, name, cuisine, description, hours, dress_code, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [hotelId, name, cuisine, description, hours, dress_code, JSON.stringify(images || [])]
  );
  res.status(201).json(rows[0]);
});

export default router;


