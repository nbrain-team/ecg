import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Update venue images to use local paths
router.post('/update-venue-images-local', async (req, res) => {
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
    
    // Venue image mappings - using local images with .webp extension
    const venueImageMappings = [
      {
        name: 'GRAND MARISSA',
        images: ['/images/venues/GRAND-MARISSA.webp']
      },
      {
        name: 'Marissa',
        images: ['/images/venues/Marissa.webp']
      },
      {
        name: 'Monica',
        images: ['/images/venues/Monica.webp']
      },
      {
        name: 'Mariana',
        images: ['/images/venues/Mariana.webp']
      },
      {
        name: 'Mariana 1',
        images: ['/images/venues/Mariana 1.webp']
      },
      {
        name: 'Mariana 2',
        images: ['/images/venues/Mariana 2.webp']
      },
      {
        name: 'Mariana 3',
        images: ['/images/venues/Mariana 3.webp']
      },
      {
        name: 'TAMAYO I & II',
        images: ['/images/venues/TAMAYO I & II.webp']
      },
      {
        name: 'Tamayo I',
        images: ['/images/venues/Tamayo I.webp']
      },
      {
        name: 'Tamayo II',
        images: ['/images/venues/Tamayo II.webp']
      },
      {
        name: 'Diego Rivera',
        images: ['/images/venues/Diego Rivera.webp']
      },
      {
        name: 'Siqueiros',
        images: ['/images/venues/Siqueiros.webp']
      },
      {
        name: 'Velasco',
        images: ['/images/venues/velasco.webp'] // Note: no image file found, keeping lowercase as in seedVenues.ts
      },
      {
        name: 'Amphitheatre',
        images: ['/images/venues/amphitheatre.webp'] // Note: no image file found
      },
      {
        name: 'Ocean Garden',
        images: ['/images/venues/Ocean Garden.webp']
      },
      {
        name: 'Gazebo',
        images: ['/images/venues/Gazebo.webp']
      }
    ];
    
    // Update each venue's images
    let updatedCount = 0;
    const updateResults = [];
    
    for (const venue of venueImageMappings) {
      const updateResult = await pool.query(
        'UPDATE hotel_venues SET images = $1 WHERE hotel_id = $2 AND name = $3',
        [JSON.stringify(venue.images), hotelId, venue.name]
      );
      
      if (updateResult.rowCount && updateResult.rowCount > 0) {
        updatedCount++;
        updateResults.push({
          name: venue.name,
          updated: true,
          image: venue.images[0]
        });
        console.log(`Updated ${venue.name}: ${updateResult.rowCount} rows`);
      } else {
        updateResults.push({
          name: venue.name,
          updated: false,
          note: 'Venue not found or no changes'
        });
        console.log(`No updates for ${venue.name}`);
      }
    }
    
    res.json({ 
      message: 'Venue images updated to use local paths',
      updatedVenues: updatedCount,
      totalVenues: venueImageMappings.length,
      details: updateResults
    });
    
  } catch (error) {
    console.error('Error updating venue images:', error);
    res.status(500).json({ error: 'Failed to update venue images' });
  }
});

export default router;
