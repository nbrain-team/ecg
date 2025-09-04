import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Update room images to use local paths
router.post('/update-room-images-local', async (req, res) => {
  try {
    // Get Grand Velas Los Cabos hotel ID
    const hotelResult = await pool.query(
      'SELECT id FROM hotels WHERE name = $1',
      ['Grand Velas Los Cabos']
    );
    
    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grand Velas Los Cabos hotel not found' });
    }
    
    const hotelId = hotelResult.rows[0].id;
    
    // Room image mappings - using local placeholder images
    const roomImageMappings = [
      {
        name: 'Ambassador Ocean View Suite',
        images: ['/images/rooms/ambassador-ocean-suite.jpg']
      },
      {
        name: 'Grand Class Spa Suite', 
        images: ['/images/rooms/grand-class-spa-suite.jpg']
      },
      {
        name: 'Ambassador Spa Suite',
        images: ['/images/rooms/ambassador-spa-suite.jpg']
      },
      {
        name: 'Grand Class Suite',
        images: ['/images/rooms/grand-class-suite.jpg']
      },
      {
        name: 'Master Pool Suite',
        images: ['/images/rooms/master-pool-suite.jpg']
      },
      {
        name: 'Master Ocean View Suite',
        images: ['/images/rooms/master-ocean-suite.jpg']
      },
      {
        name: 'Wellness Suite',
        images: ['/images/rooms/wellness-suite.jpg']
      },
      {
        name: 'Two Bedroom Family Suite',
        images: ['/images/rooms/two-bedroom-family-suite.jpg']
      },
      {
        name: 'Imperial Suite',
        images: ['/images/rooms/imperial-suite.jpg']
      },
      {
        name: 'Presidential Suite',
        images: ['/images/rooms/presidential-suite.jpg']
      },
      {
        name: 'Ambassador Pool Suite',
        images: ['/images/rooms/ambassador-pool-suite.jpg']
      },
      {
        name: 'Master Spa Suite',
        images: ['/images/rooms/master-spa-suite.jpg']
      }
    ];
    
    // Update each room's images
    for (const room of roomImageMappings) {
      const updateResult = await pool.query(
        'UPDATE hotel_rooms SET images = $1 WHERE hotel_id = $2 AND name = $3',
        [JSON.stringify(room.images), hotelId, room.name]
      );
      
      console.log(`Updated ${room.name}: ${updateResult.rowCount} rows`);
    }
    
    res.json({ 
      message: 'Room images updated to use local paths',
      updatedRooms: roomImageMappings.length
    });
    
  } catch (error) {
    console.error('Error updating room images:', error);
    res.status(500).json({ error: 'Failed to update room images' });
  }
});

export default router;
