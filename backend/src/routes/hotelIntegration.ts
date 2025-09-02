import { Router } from 'express';
import pool from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get hotels as resorts for proposal builder
router.get('/resorts', requireAuth(['admin', 'viewer']), async (req, res) => {
  try {
    const { rows: hotels } = await pool.query(`
      SELECT 
        h.id,
        h.name,
        h.description,
        h.city,
        h.country,
        h.rating_level,
        h.website,
        COALESCE(h.amenities_property, '[]'::jsonb) as amenities_property,
        COALESCE(h.identity, '{}'::jsonb) as identity,
        (SELECT json_agg(json_build_object(
          'id', id,
          'url', url,
          'alt', alt,
          'category', category
        )) FROM hotel_images WHERE hotel_id = h.id) as images
      FROM hotels h
      WHERE h.id IS NOT NULL
    `);
    
    // Transform hotels to match resort structure
    const resorts = hotels.map(hotel => ({
      id: `hotel-${hotel.id}`,
      hotelId: hotel.id, // Keep original hotel ID for fetching related data
      destinationId: 'dest-1', // Default to Los Cabos for now
      name: hotel.name,
      description: hotel.identity?.description_long || hotel.description || '',
      amenities: Array.isArray(hotel.amenities_property) 
        ? hotel.amenities_property 
        : Object.keys(hotel.amenities_property || {}).filter(k => hotel.amenities_property[k]),
      rating: hotel.rating_level === '5-star' ? 5 : 4,
      images: hotel.images?.map((img: any) => img.url) || [],
      features: hotel.identity?.unique_selling_points || [],
      priceRange: '$$$$'
    }));
    
    res.json(resorts);
  } catch (error) {
    console.error('Error fetching hotels as resorts:', error);
    res.status(500).json({ message: 'Failed to fetch hotels' });
  }
});

// Get rooms for a hotel (as resort)
router.get('/resorts/:hotelId/rooms', requireAuth(['admin', 'viewer']), async (req, res) => {
  try {
    const hotelId = req.params.hotelId.replace('hotel-', ''); // Remove prefix
    const { rows: rooms } = await pool.query(`
      SELECT 
        id,
        name,
        description,
        size_sqft,
        view,
        capacity,
        base_rate,
        images,
        attributes
      FROM hotel_rooms
      WHERE hotel_id = $1
      ORDER BY base_rate DESC
    `, [hotelId]);
    
    // Transform to match room type structure
    const roomTypes = rooms.map(room => ({
      id: `room-${room.id}`,
      resortId: `hotel-${hotelId}`,
      name: room.name,
      description: room.description,
      capacity: room.capacity || 2,
      amenities: room.attributes?.in_room_amenities || [],
      images: room.images || [],
      size: `${room.size_sqft || 0} sq ft`,
      view: room.view || 'Ocean'
    }));
    
    res.json(roomTypes);
  } catch (error) {
    console.error('Error fetching hotel rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

// Get event spaces for a hotel (as resort)
router.get('/resorts/:hotelId/spaces', requireAuth(['admin', 'viewer']), async (req, res) => {
  try {
    const hotelId = req.params.hotelId.replace('hotel-', '');
    const { rows: venues } = await pool.query(`
      SELECT 
        id,
        name,
        description,
        sqft,
        ceiling_height_ft,
        capacity_reception,
        capacity_banquet,
        capacity_theater,
        images,
        attributes
      FROM hotel_venues
      WHERE hotel_id = $1
      ORDER BY sqft DESC
    `, [hotelId]);
    
    // Transform to match event space structure
    const eventSpaces = venues.map(venue => ({
      id: `space-${venue.id}`,
      resortId: `hotel-${hotelId}`,
      name: venue.name,
      capacity: Math.max(
        venue.capacity_reception || 0,
        venue.capacity_banquet || 0,
        venue.capacity_theater || 0
      ),
      sqft: venue.sqft || 0,
      layoutTypes: [
        venue.capacity_theater > 0 && 'theater',
        venue.capacity_banquet > 0 && 'banquet',
        venue.capacity_reception > 0 && 'reception',
        venue.attributes?.classroom > 0 && 'classroom',
        venue.attributes?.u_shape > 0 && 'u-shape',
        venue.attributes?.boardroom > 0 && 'boardroom'
      ].filter(Boolean) as any[],
      features: [
        venue.attributes?.natural_light === 'true' && 'Natural Light',
        venue.attributes?.rigging_points === 'true' && 'Rigging Points',
        venue.ceiling_height_ft && `${venue.ceiling_height_ft}ft Ceiling`
      ].filter(Boolean) as string[],
      imageUrl: venue.images?.[0] || ''
    }));
    
    res.json(eventSpaces);
  } catch (error) {
    console.error('Error fetching hotel venues:', error);
    res.status(500).json({ message: 'Failed to fetch event spaces' });
  }
});

// Get dining options for a hotel (as resort)
router.get('/resorts/:hotelId/dining', requireAuth(['admin', 'viewer']), async (req, res) => {
  try {
    const hotelId = req.params.hotelId.replace('hotel-', '');
    const { rows: dining } = await pool.query(`
      SELECT 
        id,
        name,
        cuisine,
        description,
        hours,
        dress_code,
        images,
        attributes
      FROM hotel_dining
      WHERE hotel_id = $1
      ORDER BY name
    `, [hotelId]);
    
    // Transform to match dining option structure
    const diningOptions = dining.map(outlet => ({
      id: `dining-${outlet.id}`,
      resortId: `hotel-${hotelId}`,
      name: outlet.name,
      cuisine: outlet.cuisine || 'International',
      description: outlet.description || '',
      hours: outlet.hours || 'Varies by season',
      dressCode: outlet.dress_code || 'Resort Casual',
      specialties: outlet.attributes?.specialties || [],
      imageUrl: outlet.images?.[0] || ''
    }));
    
    res.json(diningOptions);
  } catch (error) {
    console.error('Error fetching hotel dining:', error);
    res.status(500).json({ message: 'Failed to fetch dining options' });
  }
});

export default router;
