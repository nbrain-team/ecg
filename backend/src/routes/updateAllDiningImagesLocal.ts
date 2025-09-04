import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Update ALL dining images to use local paths
router.post('/update-all-dining-images-local', async (req, res) => {
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
    
    // Complete dining image mappings for ALL 14 dining venues
    const diningImageMappings = [
      // Restaurants
      {
        name: 'Cocina de Autor',
        images: ['/images/dining/cocina-de-autor.jpg']
      },
      {
        name: 'Azul',
        images: ['/images/dining/azul.jpg']
      },
      {
        name: 'Cabrilla',
        images: ['/images/dining/cabrilla.jpg']
      },
      {
        name: 'Velas 10',
        images: ['/images/dining/velas-10.jpg']
      },
      {
        name: 'Sen Lin',
        images: ['/images/dining/sen-lin.jpg']
      },
      {
        name: 'Lucca',
        images: ['/images/dining/lucca.jpg']
      },
      {
        name: 'Frida',
        images: ['/images/dining/frida.jpg']
      },
      {
        name: 'Loto Robata & Bar',
        images: ['/images/dining/loto-robata-bar.jpg']
      },
      // Bars and Cafes
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
    
    let totalUpdated = 0;
    
    // Update each dining venue's images
    for (const venue of diningImageMappings) {
      const updateResult = await pool.query(
        'UPDATE hotel_dining SET images = $1 WHERE hotel_id = $2 AND name = $3',
        [JSON.stringify(venue.images), hotelId, venue.name]
      );
      
      if (updateResult.rowCount > 0) {
        totalUpdated += updateResult.rowCount;
        console.log(`Updated ${venue.name}: ${updateResult.rowCount} rows`);
      } else {
        console.log(`No rows found for ${venue.name}`);
      }
    }
    
    // Also update cuisine field from cuisine_type if cuisine is null
    await pool.query(
      'UPDATE hotel_dining SET cuisine = cuisine_type WHERE hotel_id = $1 AND cuisine IS NULL AND cuisine_type IS NOT NULL',
      [hotelId]
    );
    
    res.json({ 
      message: 'All dining images updated to use local paths',
      updatedVenues: totalUpdated,
      totalVenues: diningImageMappings.length
    });
    
  } catch (error) {
    console.error('Error updating dining images:', error);
    res.status(500).json({ error: 'Failed to update dining images' });
  }
});

export default router;
