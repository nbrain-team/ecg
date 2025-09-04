import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Endpoint to update room images with correct URLs
router.post('/update-room-images', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get Grand Velas hotel ID
    const hotelRes = await client.query(
      `SELECT id FROM hotels WHERE slug = 'grand-velas-los-cabos'`
    );
    
    if (hotelRes.rows.length === 0) {
      throw new Error('Grand Velas Los Cabos hotel not found');
    }
    
    const hotelId = hotelRes.rows[0].id;
    
    // Updated room images with correct URLs from Grand Velas website
    const roomImages = [
      {
        name: 'Ambassador Spa & Pool Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/ambassador-spa-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Ambassador Ocean Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/ambassador-ocean-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Master Pool Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/master-pool-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Master Ocean Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/master-ocean-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Grand Class Spa Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/grand-class-spa-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Grand Class Ocean Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/grand-class-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Wellness Suite Ocean View',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/wellness-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Wellness Suite Oceanfront',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/wellness-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Two Bedroom Family Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/two-bedroom-family-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Two Bedroom Residence Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/two-bedroom-family-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Imperial Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/imperial-suite-grand-velas-los-cabos.jpg'
      },
      {
        name: 'Presidential Suite',
        image: 'https://www.grandvelas.com/resourcefiles/accommodationsliderimagesnew/presidential-suite-grand-velas-los-cabos.jpg'
      }
    ];
    
    // Update each room with its correct image
    for (const room of roomImages) {
      await client.query(
        `UPDATE hotel_rooms 
         SET images = $1::jsonb 
         WHERE hotel_id = $2 AND name = $3`,
        [JSON.stringify([room.image]), hotelId, room.name]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: `Updated images for ${roomImages.length} rooms`,
      rooms: roomImages
    });
    
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating room images:', error);
    res.status(500).json({ error: error.message || 'Failed to update room images' });
  } finally {
    client.release();
  }
});

export default router;
