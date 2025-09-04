import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Seed ALL Grand Velas dining options
router.post('/seed-all-dining', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get hotel_id for Grand Velas Los Cabos
    const hotelResult = await client.query(
      "SELECT id FROM hotels WHERE name = 'Grand Velas Los Cabos'"
    );
    
    if (hotelResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Grand Velas Los Cabos hotel not found' });
    }
    
    const hotelId = hotelResult.rows[0].id;
    
    // Delete ALL existing dining for this hotel
    await client.query('DELETE FROM hotel_dining WHERE hotel_id = $1', [hotelId]);
    
    const diningOptions = [
      // Restaurants
      {
        name: 'Frida',
        description: 'Mexican haute cuisine celebrating traditional flavors with contemporary presentation',
        cuisine_type: 'Mexican',
        meal_periods: ['Dinner'],
        price_range: '$$$$',
        capacity: 120,
        hours_of_operation: '6:00 PM - 11:00 PM',
        dress_code: 'Resort Elegant',
        images: ['/images/dining/frida.jpg']
      },
      {
        name: 'Piaf',
        description: 'Classic French cuisine in an elegant setting overlooking the ocean',
        cuisine_type: 'French',
        meal_periods: ['Dinner'],
        price_range: '$$$$',
        capacity: 100,
        hours_of_operation: '6:00 PM - 11:00 PM',
        dress_code: 'Resort Elegant',
        images: ['/images/dining/piaf.jpg']
      },
      {
        name: 'Lucca',
        description: 'Authentic Italian dining featuring handmade pastas and imported ingredients',
        cuisine_type: 'Italian',
        meal_periods: ['Dinner'],
        price_range: '$$$$',
        capacity: 110,
        hours_of_operation: '6:00 PM - 11:00 PM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/lucca.jpg']
      },
      {
        name: 'Velas 10',
        description: 'Fresh seafood and prime steaks with panoramic ocean views',
        cuisine_type: 'Seafood & Steakhouse',
        meal_periods: ['Lunch', 'Dinner'],
        price_range: '$$$$',
        capacity: 140,
        hours_of_operation: '12:00 PM - 11:00 PM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/velas-10.jpg']
      },
      {
        name: 'Azul',
        description: 'International buffet with live cooking stations and ocean terrace seating',
        cuisine_type: 'International',
        meal_periods: ['Breakfast', 'Lunch', 'Dinner'],
        price_range: '$$$',
        capacity: 200,
        hours_of_operation: '7:00 AM - 11:00 PM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/azul.jpg']
      },
      {
        name: 'Sen Lin',
        description: 'Pan-Asian cuisine featuring sushi, teppanyaki, and regional specialties',
        cuisine_type: 'Asian',
        meal_periods: ['Dinner'],
        price_range: '$$$$',
        capacity: 90,
        hours_of_operation: '6:00 PM - 11:00 PM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/sen-lin.jpg']
      },
      // Bars & Lounges
      {
        name: 'Miramar Bar',
        description: 'Beachfront bar with signature cocktails and light bites',
        cuisine_type: 'Bar',
        meal_periods: ['All Day'],
        price_range: '$$',
        capacity: 60,
        hours_of_operation: '10:00 AM - 12:00 AM',
        dress_code: 'Casual',
        images: ['/images/dining/miramar-bar.jpg']
      },
      {
        name: 'Koi Bar',
        description: 'Swim-up pool bar serving tropical drinks and snacks',
        cuisine_type: 'Bar',
        meal_periods: ['All Day'],
        price_range: '$$',
        capacity: 40,
        hours_of_operation: '10:00 AM - 6:00 PM',
        dress_code: 'Swimwear Welcome',
        images: ['/images/dining/koi-bar.jpg']
      },
      {
        name: 'Sky Sports Bar',
        description: 'Sports bar with multiple screens, craft beers, and pub favorites',
        cuisine_type: 'Bar & Grill',
        meal_periods: ['Lunch', 'Dinner', 'Late Night'],
        price_range: '$$',
        capacity: 80,
        hours_of_operation: '11:00 AM - 2:00 AM',
        dress_code: 'Casual',
        images: ['/images/dining/sky-sports-bar.jpg']
      },
      {
        name: 'Lobby Bar',
        description: 'Elegant lobby lounge with live music and premium spirits',
        cuisine_type: 'Bar',
        meal_periods: ['All Day'],
        price_range: '$$$',
        capacity: 70,
        hours_of_operation: '10:00 AM - 1:00 AM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/lobby-bar.jpg']
      },
      {
        name: 'Cabrilla Pool Bar',
        description: 'Adults-only pool bar with craft cocktails and ceviche',
        cuisine_type: 'Bar',
        meal_periods: ['All Day'],
        price_range: '$$',
        capacity: 50,
        hours_of_operation: '10:00 AM - 6:00 PM',
        dress_code: 'Swimwear Welcome',
        images: ['/images/dining/cabrilla-pool-bar.jpg']
      },
      {
        name: 'Grand Club Lounge',
        description: 'Exclusive lounge for Grand Club guests with continental breakfast and evening cocktails',
        cuisine_type: 'Lounge',
        meal_periods: ['Breakfast', 'All Day', 'Evening'],
        price_range: 'Included',
        capacity: 40,
        hours_of_operation: '6:00 AM - 10:00 PM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/grand-club-lounge.jpg']
      },
      {
        name: 'Mezcal & Tequila Bar',
        description: 'Specialized bar featuring extensive collection of premium tequilas and mezcals',
        cuisine_type: 'Bar',
        meal_periods: ['Evening', 'Late Night'],
        price_range: '$$$',
        capacity: 35,
        hours_of_operation: '5:00 PM - 12:00 AM',
        dress_code: 'Resort Casual',
        images: ['/images/dining/mezcal-tequila-bar.jpg']
      },
      {
        name: 'Cafe & Deli',
        description: '24-hour cafe offering coffee, pastries, sandwiches, and grab-and-go options',
        cuisine_type: 'Cafe',
        meal_periods: ['All Day'],
        price_range: '$',
        capacity: 30,
        hours_of_operation: '24 Hours',
        dress_code: 'Casual',
        images: ['/images/dining/cafe-deli.jpg']
      }
    ];
    
    // Insert all dining options
    for (const dining of diningOptions) {
      await client.query(
        `INSERT INTO hotel_dining (
          hotel_id, name, description, cuisine_type, meal_periods, 
          price_range, capacity, hours_of_operation, dress_code, images, 
          cuisine, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          hotelId,
          dining.name,
          dining.description,
          dining.cuisine_type,
          JSON.stringify(dining.meal_periods),
          dining.price_range,
          dining.capacity,
          dining.hours_of_operation,
          dining.dress_code,
          JSON.stringify(dining.images),
          dining.cuisine_type // Also populate the cuisine field for backward compatibility
        ]
      );
    }
    
    await client.query('COMMIT');
    res.json({ 
      message: 'All Grand Velas dining options seeded successfully', 
      count: diningOptions.length 
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding dining:', error);
    res.status(500).json({ message: 'Failed to seed dining options', error: error.message });
  } finally {
    client.release();
  }
});

export default router;
