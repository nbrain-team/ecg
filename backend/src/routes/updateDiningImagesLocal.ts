import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Update dining images to use local paths
router.post('/update-dining-images-local', async (req, res) => {
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
    
    // Dining image mappings for venues that need local images
    const diningImageMappings = [
      {
        name: 'Koi Bar',
        images: ['/images/dining/koi-bar.jpg']
      },
      {
        name: 'Sky Sports Bar',
        images: ['/images/dining/sky-sports-bar.jpg']
      },
      {
        name: 'Tequila & Mezcal Bar',
        images: ['/images/dining/tequila-mezcal-bar.jpg']
      },
      {
        name: 'Miramar Bar',
        images: ['/images/dining/miramar-bar.jpg']
      },
      {
        name: 'Amat Café',
        images: ['/images/dining/amat-cafe.jpg']
      },
      {
        name: 'Autor Bar',
        images: ['/images/dining/autor-bar.jpg']
      }
    ];
    
    // Update each dining venue's images
    for (const venue of diningImageMappings) {
      const updateResult = await pool.query(
        'UPDATE hotel_dining SET images = $1 WHERE hotel_id = $2 AND name = $3',
        [JSON.stringify(venue.images), hotelId, venue.name]
      );
      
      console.log(`Updated ${venue.name}: ${updateResult.rowCount} rows`);
    }
    
    res.json({ 
      message: 'Dining images updated to use local paths',
      updatedVenues: diningImageMappings.length
    });
    
  } catch (error) {
    console.error('Error updating dining images:', error);
    res.status(500).json({ error: 'Failed to update dining images' });
  }
});

export default router;
