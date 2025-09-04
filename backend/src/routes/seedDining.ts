import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Seed all Grand Velas Los Cabos dining options
router.post('/seed-grand-velas-dining', async (req, res) => {
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
    
    // Delete existing dining options for this hotel
    await pool.query('DELETE FROM hotel_dining WHERE hotel_id = $1', [hotelId]);
    
    // Dining data based on Grand Velas website
    const diningOptions = [
      {
        name: 'Cocina de Autor',
        description: 'Creative cuisine led by Two Michelin Star Chef Sidney Schutte. An exclusive culinary experience for ages 18 and over with elegant-casual attire required.',
        cuisine_type: 'Creative Cuisine',
        meal_periods: ['Dinner'],
        price_range: '$$$$',
        capacity: 142,
        hours_of_operation: 'Open daily from 6:00 p.m. to 11:00 p.m.',
        dress_code: 'Elegant-Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/cocina-de-autor-dining-area-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Fine Dining',
          reservations_required: true,
          age_restriction: '18+',
          michelin_star: 'Awarded',
          chef: 'Sidney Schutte',
          private_dining: true,
          ocean_view: true,
          specialties: ['Tasting Menu', 'Wine Pairing', 'Creative Cuisine']
        }
      },
      {
        name: 'Azul',
        description: 'International buffet and à la carte menu offering diverse culinary options throughout the day. Family-friendly with casual attire.',
        cuisine_type: 'International',
        meal_periods: ['Breakfast', 'Lunch', 'Dinner'],
        price_range: '$$',
        capacity: 264,
        hours_of_operation: 'Open daily from 7:00 a.m. to 5:00 p.m. and seasonally for dinner (6:00 p.m. to 11:00 p.m.)',
        dress_code: 'Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/azul-dining-area-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Casual Dining',
          family_friendly: true,
          buffet_available: true,
          ocean_view: true,
          outdoor_seating: true,
          specialties: ['International Buffet', 'Made-to-Order Stations', 'Theme Nights']
        }
      },
      {
        name: 'Cabrilla',
        description: 'Poolside ceviche and seafood restaurant offering fresh Baja flavors in a casual beachfront setting.',
        cuisine_type: 'Ceviche and Seafood',
        meal_periods: ['Lunch', 'Light Dinner'],
        price_range: '$$',
        capacity: 40,
        hours_of_operation: 'Open daily from 11:00 a.m. to 6:00 p.m.',
        dress_code: 'Pool Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/cabrilla-dining-area-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Poolside Dining',
          family_friendly: true,
          pool_access: true,
          beachfront: true,
          specialties: ['Fresh Ceviche', 'Seafood Tacos', 'Tropical Cocktails']
        }
      },
      {
        name: 'Velas 10',
        description: 'Sophisticated steakhouse and seafood restaurant with an extensive wine list. Features prime cuts and fresh catches in an elegant setting.',
        cuisine_type: 'Seafood and Steaks',
        meal_periods: ['Dinner'],
        price_range: '$$$',
        capacity: 114,
        hours_of_operation: 'Open daily from 6:00 p.m. to 11:00 p.m.',
        dress_code: 'Elegant-Casual (collared shirt, trousers and closed footwear for men; dresses, skirts, or evening trousers for women)',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/velas-10-restaurant-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Upscale Steakhouse',
          reservations_required: true,
          wine_cellar: true,
          private_dining: true,
          specialties: ['Prime Steaks', 'Fresh Lobster', 'Wine Selection']
        }
      },
      {
        name: 'Sen Lin',
        description: 'Asian fusion restaurant offering authentic flavors from across Asia with a contemporary twist. Family-friendly fine dining experience.',
        cuisine_type: 'Asian Fusion',
        meal_periods: ['Dinner'],
        price_range: '$$$',
        capacity: 138,
        hours_of_operation: 'Open daily from 6:00 p.m. to 11:00 p.m.',
        dress_code: 'Elegant-Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/piaf-restaurant-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Contemporary Asian',
          family_friendly: true,
          reservations_recommended: true,
          specialties: ['Sushi', 'Teppanyaki', 'Asian Fusion Cuisine']
        }
      },
      {
        name: 'Lucca',
        description: 'Italian-Mediterranean restaurant featuring traditional recipes with a modern presentation. Family-friendly atmosphere with authentic Italian cuisine.',
        cuisine_type: 'Italian-Mediterranean',
        meal_periods: ['Dinner'],
        price_range: '$$$',
        capacity: 143,
        hours_of_operation: 'Open daily from 6:00 p.m. to 11:00 p.m.',
        dress_code: 'Resort Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/lucca-restaurant-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Romantic Italian',
          family_friendly: true,
          wood_fired_oven: true,
          specialties: ['Fresh Pasta', 'Wood-Fired Pizza', 'Italian Wines']
        }
      },
      {
        name: 'Frida',
        description: 'Gourmet Mexican restaurant celebrating the rich culinary traditions of Mexico with contemporary flair. Features regional specialties and artisanal tequilas.',
        cuisine_type: 'Gourmet Mexican',
        meal_periods: ['Dinner'],
        price_range: '$$$',
        capacity: 140,
        hours_of_operation: 'Open daily from 6:00 p.m. to 11:00 p.m.',
        dress_code: 'Resort Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/frida-dining-area-at-grand-velas-los-cabos.jpg'],
        attributes: {
          ambiance: 'Contemporary Mexican',
          family_friendly: true,
          tequila_menu: true,
          live_music: true,
          specialties: ['Regional Mexican Cuisine', 'Mole', 'Artisanal Tequilas']
        }
      },
      {
        name: 'Loto Robata Grill',
        description: 'Led by 2-Michelin-star chef Sidney Schutte, Loto promises an unmatched gastronomic journey where traditional Japanese flavors merge with creative innovation.',
        cuisine_type: 'Japanese Robata',
        meal_periods: ['Dinner'],
        price_range: '$$$$',
        capacity: 80,
        hours_of_operation: 'Open select evenings from 6:00 p.m. to 11:00 p.m.',
        dress_code: 'Elegant-Casual',
        images: ['https://www.grandvelas.com/resourcefiles/dining-filterable-snippets/loto-robata-grill.jpg'],
        attributes: {
          ambiance: 'Intimate Japanese',
          reservations_required: true,
          chef: 'Sidney Schutte',
          michelin_chef: true,
          robata_grill: true,
          sake_selection: true,
          specialties: ['Robata Grilled Items', 'Omakase', 'Premium Sake']
        }
      },
      {
        name: 'Koi Bar',
        description: 'Sophisticated late-night lounge offering craft cocktails, premium spirits, and light bites in an elegant atmosphere.',
        cuisine_type: 'Bar & Lounge',
        meal_periods: ['Late Night'],
        price_range: '$$',
        capacity: 110,
        hours_of_operation: 'Open nightly from 9:00 p.m. to 2:00 a.m.',
        dress_code: 'Smart Casual',
        images: ['/images/dining/koi-bar.jpg'],
        attributes: {
          ambiance: 'Upscale Lounge',
          live_entertainment: true,
          craft_cocktails: true,
          premium_spirits: true,
          specialties: ['Craft Cocktails', 'Premium Spirits', 'Late Night Bites']
        }
      },
      {
        name: 'Sky Sports Bar',
        description: 'Rooftop sports bar with panoramic views, multiple screens for sporting events, and a full bar menu. Perfect for late-night entertainment.',
        cuisine_type: 'Sports Bar',
        meal_periods: ['Lunch', 'Dinner', 'Late Night'],
        price_range: '$$',
        capacity: 220,
        hours_of_operation: 'Open daily from 11:00 a.m. to 2:00 a.m.',
        dress_code: 'Casual',
        images: ['/images/dining/sky-sports-bar.jpg'],
        attributes: {
          ambiance: 'Sports Bar',
          rooftop_location: true,
          multiple_screens: true,
          ocean_view: true,
          specialties: ['Bar Food', 'Craft Beer', 'Sports Viewing']
        }
      },
      {
        name: 'Tequila & Mezcal Bar',
        description: 'Specialized tequila and mezcal tasting bar featuring Mexico\'s finest agave spirits with expert-guided tastings.',
        cuisine_type: 'Tequila Bar',
        meal_periods: ['Afternoon', 'Evening'],
        price_range: '$$$',
        capacity: 60,
        hours_of_operation: 'Open daily from 4:00 p.m. to 11:00 p.m.',
        dress_code: 'Resort Casual',
        images: ['/images/dining/tequila-mezcal-bar.jpg'],
        attributes: {
          ambiance: 'Tasting Room',
          expert_guided_tastings: true,
          premium_selection: true,
          specialties: ['Premium Tequilas', 'Artisanal Mezcals', 'Tasting Flights']
        }
      },
      {
        name: 'Miramar Bar',
        description: 'Beachfront bar offering tropical cocktails and refreshing beverages with stunning ocean views and beach access.',
        cuisine_type: 'Beach Bar',
        meal_periods: ['All Day'],
        price_range: '$$',
        capacity: 80,
        hours_of_operation: 'Open daily from 10:00 a.m. to sunset',
        dress_code: 'Beach Casual',
        images: ['/images/dining/miramar-bar.jpg'],
        attributes: {
          ambiance: 'Beach Bar',
          beachfront: true,
          swim_up_bar: true,
          sunset_views: true,
          specialties: ['Tropical Cocktails', 'Fresh Fruit Drinks', 'Beach Snacks']
        }
      },
      {
        name: 'Amat Café',
        description: 'Artisanal coffee bar and café offering premium coffee drinks, fresh pastries, and light breakfast options throughout the day.',
        cuisine_type: 'Café',
        meal_periods: ['Breakfast', 'All Day'],
        price_range: '$',
        capacity: 50,
        hours_of_operation: 'Open daily from 6:00 a.m. to 6:00 p.m.',
        dress_code: 'Casual',
        images: ['/images/dining/amat-cafe.jpg'],
        attributes: {
          ambiance: 'Coffee House',
          artisanal_coffee: true,
          fresh_pastries: true,
          grab_and_go: true,
          specialties: ['Specialty Coffee', 'Fresh Pastries', 'Light Breakfast']
        }
      },
      {
        name: 'Autor Bar',
        description: 'Elegant bar adjacent to Cocina de Autor, offering pre-dinner aperitifs and post-dinner digestifs with a sophisticated ambiance.',
        cuisine_type: 'Bar',
        meal_periods: ['Evening'],
        price_range: '$$$',
        capacity: 40,
        hours_of_operation: 'Open daily from 5:30 p.m. to midnight',
        dress_code: 'Elegant-Casual',
        images: ['/images/dining/autor-bar.jpg'],
        attributes: {
          ambiance: 'Upscale Bar',
          pre_dinner_drinks: true,
          digestifs: true,
          wine_list: true,
          specialties: ['Aperitifs', 'Digestifs', 'Wine Selection']
        }
      }
    ];
    
    // Insert all dining options
    for (const dining of diningOptions) {
      await pool.query(
        `INSERT INTO hotel_dining 
        (hotel_id, name, description, cuisine_type, meal_periods, price_range, capacity, hours_of_operation, dress_code, images, attributes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
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
          JSON.stringify(dining.attributes)
        ]
      );
    }
    
    res.json({ 
      message: 'Successfully seeded Grand Velas Los Cabos dining options',
      count: diningOptions.length 
    });
    
  } catch (error) {
    console.error('Error seeding dining options:', error);
    res.status(500).json({ error: 'Failed to seed dining options' });
  }
});

export default router;
