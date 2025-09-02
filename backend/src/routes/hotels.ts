import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

function getGVDefaults() {
  return {
    schema_header: {
      version: '1.0.0',
      last_updated_utc: new Date().toISOString(),
      id: 'grand_velas_los_cabos'
    },
    metadata: {
      status: 'active',
      visibility: 'public',
      languages_supported: ['en', 'es'],
      timezone: 'America/Mazatlan'
    },
    identity: {
      legal_name: 'Operadora de Hoteles Gran Clase Los Cabos, S.A. de C.V.',
      brand_name: 'Grand Velas Los Cabos',
      chain: 'Velas Resorts',
      opening_date: '2016-12-20',
      last_renovation_date: '2023-01-01',
      star_rating: 5.0,
      description_short: 'Ultra-luxury all-inclusive resort between Cabo San Lucas and San José del Cabo.',
      description_long: 'Award-winning all-inclusive luxury resort with oceanview suites, acclaimed dining, SE Spa, and versatile event venues.'
    },
    contact: {
      primary_contact: {
        name: 'Sales Office', title: 'Group Sales', email: 'sales.loscabos@velasresorts.com', phone: '+52 624 104 9800', preferred_contact_method: 'email'
      },
      rfp_inbox_email: 'groups.loscabos@velasresorts.com',
      website_url: 'https://www.grandvelas.com/resorts/grand-velas-los-cabos',
      booking_portal_url: 'https://www.grandvelas.com',
      virtual_tour_url: '',
      social: { instagram: 'https://www.instagram.com/velasresorts/', linkedin: 'https://www.linkedin.com/company/velas-resorts/' }
    },
    location: {
      address: { line1: 'Carretera Transpeninsular Km 17', line2: 'Corredor Turístico', city: 'Los Cabos', state_region: 'B.C.S.', postal_code: '', country: 'MX' },
      latitude: 22.968141, longitude: -109.794384, neighborhood: 'Tourist Corridor'
    },
    images_media: {
      primary_image: { url: 'https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg', alt: 'Oceanfront suite at Grand Velas Los Cabos' },
      gallery: [], floorplans: [], logos: { light_bg_url: 'https://www.grandvelas.com/resourcefiles/hotellogo/grandvelas-logo.svg', dark_bg_url: 'https://www.grandvelas.com/resourcefiles/hotellogo/grandvelas-logo.svg' }, '3d_models': []
    },
    amenities_property: { pool: { indoor: false, outdoor: true, heated: true, seasonal: false }, fitness_center: { hours: '24/7', size_sqm: 250, classes_available: true }, spa: { onsite: true, treatment_rooms: 16 }, beach_access: true, business_center: true },
    accommodations: { total_rooms: 307, total_suites: 307, room_types: [] },
    meeting_event_spaces: [],
    dining_outlets: [],
    catering_banquets: { in_house_only: true, service_styles: ['plated','buffet','reception','stations'], dietary_accommodations: ['vegan','vegetarian','gluten_free'] },
    policies: { check_in_time: '15:00', check_out_time: '12:00', smoking: 'non_smoking_property', pets_allowed: false },
    sustainability: { linen_reuse_program: true, single_use_plastic_reduction: true },
    taxes_fees: { occupancy_tax_pct: 20.0, resort_fee_usd_per_night: 0 },
    network_it: { wifi: { property_wide: true, meeting_space_dedicated_ssid: true } },
    financials_group_contracting: { currency: 'USD', rate_types_supported: ['Net','Package'] },
    availability_calendar: { closures: [], high_demand_periods: [] },
    outdoor_spaces: [], activities: { onsite: [], offsite_partners: [] }, risk_safety_compliance: { fire_code_cert_current: true }, ai_hints: { price_positioning: 'luxury' }, workflow: { rfp_response_sla_hours: 24 }
  };
}

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

// Get only schema JSON sections
router.get('/schema', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Missing hotelId' });
    let { rows } = await pool.query(
      `SELECT 
        "schema_header", "metadata", "identity" as identity, "contact", "location", "images_media", "accessibility_ada", "sustainability",
        "policies", "taxes_fees", "network_it", "financials_group_contracting", "availability_calendar", "amenities_property",
        "accommodations", "meeting_event_spaces", "outdoor_spaces", "activities", "risk_safety_compliance", "ai_hints", "workflow",
        "catering_banquets", "dining_outlets"
       FROM hotels WHERE id = $1`, [hotelId]);
    let record = rows[0] || {};
    // If empty, bootstrap defaults once
    if (!record || Object.values(record).every((v) => v === null || v === undefined)) {
      const d = getGVDefaults();
      await pool.query(
        `UPDATE hotels SET 
          "schema_header"=$2,"metadata"=$3,"identity"=$4,"contact"=$5,"location"=$6,"images_media"=$7,
          "amenities_property"=$8,"accommodations"=$9,"meeting_event_spaces"=$10,"dining_outlets"=$11,
          "catering_banquets"=$12,"policies"=$13,"sustainability"=$14,"taxes_fees"=$15,"network_it"=$16,
          "financials_group_contracting"=$17,"availability_calendar"=$18,"outdoor_spaces"=$19,"activities"=$20,
          "risk_safety_compliance"=$21,"ai_hints"=$22,"workflow"=$23, updated_at=NOW() WHERE id=$1`,
        [hotelId, d.schema_header, d.metadata, d.identity, d.contact, d.location, d.images_media, d.amenities_property,
         d.accommodations, d.meeting_event_spaces, d.dining_outlets, d.catering_banquets, d.policies, d.sustainability,
         d.taxes_fees, d.network_it, d.financials_group_contracting, d.availability_calendar, d.outdoor_spaces, d.activities,
         d.risk_safety_compliance, d.ai_hints, d.workflow]
      );
      ({ rows } = await pool.query(
        `SELECT 
          "schema_header", "metadata", "identity" as identity, "contact", "location", "images_media", "accessibility_ada", "sustainability",
          "policies", "taxes_fees", "network_it", "financials_group_contracting", "availability_calendar", "amenities_property",
          "accommodations", "meeting_event_spaces", "outdoor_spaces", "activities", "risk_safety_compliance", "ai_hints", "workflow",
          "catering_banquets", "dining_outlets" FROM hotels WHERE id = $1`, [hotelId]));
      record = rows[0] || {};
    }
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update one or more schema JSON sections
router.put('/sections', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Missing hotelId' });
    const updates = req.body?.updates || {};
    const allowed = [
      'schema_header','metadata','identity','contact','location','images_media','accessibility_ada','sustainability',
      'policies','taxes_fees','network_it','financials_group_contracting','catering_banquets','dining_outlets','availability_calendar','amenities_property',
      'accommodations','meeting_event_spaces','outdoor_spaces','activities','risk_safety_compliance','ai_hints','workflow'
    ];
    const setFragments: string[] = [];
    const values: any[] = [hotelId];
    let i = 2;
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        setFragments.push(`"${key}" = $${i}`);
        values.push(updates[key]);
        i++;
      }
    }
    if (setFragments.length === 0) {
      return res.status(400).json({ message: 'No valid sections provided' });
    }
    const sql = `UPDATE hotels SET ${setFragments.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(sql, values);
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
  const { name, description, size_sqft, view, capacity, base_rate, images, attributes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images, attributes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [hotelId, name, description, size_sqft, view, capacity, base_rate, JSON.stringify(images || []), attributes || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/rooms/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  const { name, description, size_sqft, view, capacity, base_rate, images, attributes } = req.body;
  const { rows } = await pool.query(
    `UPDATE hotel_rooms SET name=COALESCE($3,name), description=COALESCE($4,description), size_sqft=COALESCE($5,size_sqft), view=COALESCE($6,view), capacity=COALESCE($7,capacity), base_rate=COALESCE($8,base_rate), images=COALESCE($9,images), attributes=COALESCE($10,attributes)
     WHERE id=$1 AND hotel_id=$2 RETURNING *`,
    [id, hotelId, name, description, size_sqft, view, capacity, base_rate, JSON.stringify(images || null), attributes || null]
  );
  res.json(rows[0]);
});

router.delete('/rooms/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  await pool.query('DELETE FROM hotel_rooms WHERE id=$1 AND hotel_id=$2', [id, hotelId]);
  res.json({ message: 'Deleted' });
});

// Venues
router.get('/venues', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
  const { rows } = await pool.query('SELECT * FROM hotel_venues WHERE hotel_id = $1 ORDER BY created_at DESC', [hotelId]);
  res.json(rows);
});

router.post('/venues', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images, outdoor, details, attributes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO hotel_venues (hotel_id, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images, outdoor, details, attributes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [hotelId, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, JSON.stringify(images || []), outdoor ?? false, details || null, attributes || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/venues/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  const { name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images, outdoor, details } = req.body;
  const { rows } = await pool.query(
    `UPDATE hotel_venues SET name=COALESCE($3,name), description=COALESCE($4,description), sqft=COALESCE($5,sqft), ceiling_height_ft=COALESCE($6,ceiling_height_ft),
      capacity_reception=COALESCE($7,capacity_reception), capacity_banquet=COALESCE($8,capacity_banquet), capacity_theater=COALESCE($9,capacity_theater),
      images=COALESCE($10,images), outdoor=COALESCE($11,outdoor), details=COALESCE($12,details)
     WHERE id=$1 AND hotel_id=$2 RETURNING *`,
    [id, hotelId, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, JSON.stringify(images || null), outdoor, details]
  );
  res.json(rows[0]);
});

router.delete('/venues/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  await pool.query('DELETE FROM hotel_venues WHERE id=$1 AND hotel_id=$2', [id, hotelId]);
  res.json({ message: 'Deleted' });
});

// Dining
router.get('/dining', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.query.hotelId as string) : req.user?.hotelId;
  const { rows } = await pool.query('SELECT * FROM hotel_dining WHERE hotel_id = $1 ORDER BY created_at DESC', [hotelId]);
  res.json(rows);
});

router.post('/dining', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { name, cuisine, description, hours, dress_code, images, details, attributes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO hotel_dining (hotel_id, name, cuisine, description, hours, dress_code, images, details, attributes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [hotelId, name, cuisine, description, hours, dress_code, JSON.stringify(images || []), details || null, attributes || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/dining/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  const { name, cuisine, description, hours, dress_code, images, details } = req.body;
  const { rows } = await pool.query(
    `UPDATE hotel_dining SET name=COALESCE($3,name), cuisine=COALESCE($4,cuisine), description=COALESCE($5,description), hours=COALESCE($6,hours), dress_code=COALESCE($7,dress_code), images=COALESCE($8,images), details=COALESCE($9,details)
     WHERE id=$1 AND hotel_id=$2 RETURNING *`,
    [id, hotelId, name, cuisine, description, hours, dress_code, JSON.stringify(images || null), details]
  );
  res.json(rows[0]);
});

router.delete('/dining/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  await pool.query('DELETE FROM hotel_dining WHERE id=$1 AND hotel_id=$2', [id, hotelId]);
  res.json({ message: 'Deleted' });
});

router.put('/images/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  const { url, alt, category } = req.body;
  const { rows } = await pool.query(
    `UPDATE hotel_images SET url=COALESCE($3,url), alt=COALESCE($4,alt), category=COALESCE($5,category) WHERE id=$1 AND hotel_id=$2 RETURNING *`,
    [id, hotelId, url, alt, category]
  );
  res.json(rows[0]);
});

router.delete('/images/:id', requireAuth(['hotel', 'admin']), async (req: AuthenticatedRequest, res) => {
  const hotelId = req.user?.role === 'admin' ? (req.body.hotelId as string) : req.user?.hotelId;
  const { id } = req.params;
  await pool.query('DELETE FROM hotel_images WHERE id=$1 AND hotel_id=$2', [id, hotelId]);
  res.json({ message: 'Deleted' });
});

export default router;


