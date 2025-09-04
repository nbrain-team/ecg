import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../config/database';

const GRAND_VELAS_BASE_URL = 'https://loscabos.grandvelas.com';

// Room URLs based on the suites page structure
const roomUrls: Record<string, string> = {
  'Ambassador Spa & Pool Suite': '/suites/ambassador-spa-pool-suite',
  'Ambassador Ocean Suite': '/suites/ambassador-ocean-suite',
  'Master Pool Suite': '/suites/master-pool-suite',
  'Master Ocean Suite': '/suites/master-ocean-suite',
  'Grand Class Spa Suite': '/suites/grand-class-spa-suite',
  'Grand Class Ocean Suite': '/suites/grand-class-ocean-suite',
  'Wellness Suite Ocean View': '/suites/wellness-suite-ocean-view',
  'Wellness Suite Oceanfront': '/suites/wellness-suite-oceanfront',
  'Two Bedroom Family Suite': '/suites/two-bedroom-family-suite',
  'Two Bedroom Residence Suite': '/suites/two-bedroom-residence-suite',
  'Imperial Suite': '/suites/imperial-suite',
  'Presidential Suite': '/suites/presidential-suite'
};

async function fetchRoomImage(roomName: string, relativeUrl: string): Promise<string | null> {
  try {
    const fullUrl = `${GRAND_VELAS_BASE_URL}${relativeUrl}`;
    console.log(`Fetching image for ${roomName} from ${fullUrl}`);
    
    const response = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Try different selectors that Grand Velas might use
    let imageUrl = null;
    
    // Check for Open Graph image first (most reliable)
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      imageUrl = ogImage.startsWith('http') ? ogImage : `${GRAND_VELAS_BASE_URL}${ogImage}`;
      console.log(`Found OG image for ${roomName}: ${imageUrl}`);
      return imageUrl;
    }
    
    // Check for hero image
    const heroImage = $('.hero-image img, .suite-hero img, .room-hero img, .header-image img').first().attr('src');
    if (heroImage) {
      imageUrl = heroImage.startsWith('http') ? heroImage : `${GRAND_VELAS_BASE_URL}${heroImage}`;
      console.log(`Found hero image for ${roomName}: ${imageUrl}`);
      return imageUrl;
    }
    
    // Check for gallery first image
    const galleryImage = $('.gallery img, .suite-gallery img, .room-gallery img').first().attr('src');
    if (galleryImage) {
      imageUrl = galleryImage.startsWith('http') ? galleryImage : `${GRAND_VELAS_BASE_URL}${galleryImage}`;
      console.log(`Found gallery image for ${roomName}: ${imageUrl}`);
      return imageUrl;
    }
    
    console.log(`No image found for ${roomName}`);
    return null;
  } catch (error) {
    console.error(`Error fetching image for ${roomName}:`, error);
    return null;
  }
}

async function updateRoomImages() {
  const client = await pool.connect();
  
  try {
    // Get Grand Velas hotel ID
    const hotelRes = await client.query(
      `SELECT id FROM hotels WHERE slug = 'grand-velas-los-cabos'`
    );
    
    if (hotelRes.rows.length === 0) {
      throw new Error('Grand Velas Los Cabos hotel not found');
    }
    
    const hotelId = hotelRes.rows[0].id;
    
    // Process each room
    for (const [roomName, roomUrl] of Object.entries(roomUrls)) {
      const imageUrl = await fetchRoomImage(roomName, roomUrl);
      
      if (imageUrl) {
        // Update the room with the new image
        await client.query(
          `UPDATE hotel_rooms 
           SET images = $1::jsonb 
           WHERE hotel_id = $2 AND name = $3`,
          [JSON.stringify([imageUrl]), hotelId, roomName]
        );
        console.log(`Updated ${roomName} with image`);
      }
      
      // Add a small delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Room image update completed');
  } catch (error) {
    console.error('Error updating room images:', error);
  } finally {
    client.release();
    process.exit();
  }
}

// Run the update
updateRoomImages();
