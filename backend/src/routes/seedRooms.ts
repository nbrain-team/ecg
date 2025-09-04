import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Special endpoint to seed all Grand Velas rooms
router.post('/seed-grand-velas-rooms', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the Grand Velas Los Cabos hotel ID
    const hotelRes = await client.query(
      `SELECT id FROM hotels WHERE slug = 'grand-velas-los-cabos'`
    );
    
    if (hotelRes.rows.length === 0) {
      throw new Error('Grand Velas Los Cabos hotel not found');
    }
    
    const hotelId = hotelRes.rows[0].id;

    // Delete existing rooms to avoid duplicates
    await client.query(
      `DELETE FROM hotel_rooms WHERE hotel_id = $1`,
      [hotelId]
    );

    // All 12 rooms from Grand Velas Los Cabos
    const rooms = [
      // Ambassador Level
      {
        name: 'Ambassador Spa & Pool Suite',
        description: 'Luxurious suite with spa privileges, pool views, and spacious living areas. Features a private terrace, premium bath amenities, and exclusive access to spa facilities.',
        size_sqft: 1000,
        view: 'Pool',
        capacity: 3,
        base_rate: 850.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-spa-and-pool-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-spa-pool-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King or Two Queens',
          in_room_amenities: 'Premium L\'Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge',
          bathroom_features: 'Separate shower and bathtub, Double vanity, Luxury bath amenities',
          accessibility_features: 'Available on request',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Ambassador Ocean Suite',
        description: 'Elegant suite with stunning ocean views, private terrace, and luxurious amenities. Wake up to breathtaking views of the Sea of Cortez.',
        size_sqft: 1000,
        view: 'Ocean',
        capacity: 3,
        base_rate: 950.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-ocean-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-ocean-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King or Two Queens',
          in_room_amenities: 'Premium L\'Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge',
          bathroom_features: 'Separate shower and bathtub, Double vanity, Ocean-view bathroom',
          accessibility_features: 'Available on request',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      // Master Level
      {
        name: 'Master Pool Suite',
        description: 'Sophisticated suite with direct pool access, modern Mexican decor, and premium amenities. Perfect for those who love poolside relaxation.',
        size_sqft: 1200,
        view: 'Pool',
        capacity: 3,
        base_rate: 1050.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-pool-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-pool-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King or Two Queens',
          in_room_amenities: 'Premium L\'Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Pool access',
          bathroom_features: 'Walk-in shower, Deep soaking tub, Double vanity',
          accessibility_features: 'Available on request',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Master Ocean Suite',
        description: 'Spacious suite with panoramic ocean views, contemporary design, and exclusive amenities. Features a private terrace perfect for sunset viewing.',
        size_sqft: 1200,
        view: 'Ocean',
        capacity: 3,
        base_rate: 1150.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-ocean-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-ocean-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King or Two Queens',
          in_room_amenities: 'Premium L\'Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Binoculars',
          bathroom_features: 'Walk-in shower, Deep soaking tub, Double vanity, Ocean views',
          accessibility_features: 'Available on request',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      // Grand Class Level
      {
        name: 'Grand Class Spa Suite',
        description: 'Ultimate luxury suite with spa privileges, oversized terrace, and premium amenities. Includes exclusive access to spa facilities and treatments.',
        size_sqft: 1300,
        view: 'Spa Gardens',
        capacity: 3,
        base_rate: 1250.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-spa-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-spa-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Premium L\'Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Spa access, Butler service',
          bathroom_features: 'Walk-in shower, Jacuzzi tub, Double vanity, Luxury amenities',
          accessibility_features: 'Available on request',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Grand Class Ocean Suite',
        description: 'Spectacular suite with unobstructed ocean views, luxurious furnishings, and personalized butler service. The epitome of oceanfront luxury.',
        size_sqft: 1300,
        view: 'Ocean',
        capacity: 3,
        base_rate: 1350.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-ocean-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-ocean-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Premium L\'Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Butler service, Telescope',
          bathroom_features: 'Walk-in shower, Jacuzzi tub, Double vanity, Ocean-view bathroom',
          accessibility_features: 'Available on request',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      // Wellness Suites
      {
        name: 'Wellness Suite Ocean View',
        description: 'Health-focused suite with wellness amenities, ocean views, and access to exclusive wellness programs. Features vitamin-infused shower and circadian lighting.',
        size_sqft: 1100,
        view: 'Ocean',
        capacity: 2,
        base_rate: 1100.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-ocean-view-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-bathroom-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Vitamin C shower, Circadian lighting, Air purification system, Yoga mat, Meditation cushions, Healthy minibar, Nespresso coffee maker',
          bathroom_features: 'Vitamin-infused shower, Deep soaking tub, Natural bath products',
          accessibility_features: 'Available on request',
          max_occupancy: 2,
          extra_bed_available: false,
          smoking_allowed: false
        }
      },
      {
        name: 'Wellness Suite Oceanfront',
        description: 'Premium wellness suite with direct ocean views, advanced wellness technology, and personalized health programs. Includes sleep therapy system.',
        size_sqft: 1100,
        view: 'Oceanfront',
        capacity: 2,
        base_rate: 1200.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-oceanfront-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-bathroom-oceanfront-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Vitamin C shower, Sleep therapy system, Circadian lighting, Air purification, Yoga equipment, Meditation tools, Healthy minibar',
          bathroom_features: 'Vitamin-infused shower, Chromotherapy tub, Natural products',
          accessibility_features: 'Available on request',
          max_occupancy: 2,
          extra_bed_available: false,
          smoking_allowed: false
        }
      },
      // Special Suites
      {
        name: 'Two Bedroom Family Suite',
        description: 'Spacious two-bedroom suite perfect for families, with connecting rooms, living area, and ocean views. Ideal for multi-generational travel.',
        size_sqft: 2000,
        view: 'Ocean',
        capacity: 6,
        base_rate: 1800.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/two-bedroom-family-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/family-suite-living-room-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'King + Two Queens',
          in_room_amenities: 'Two bedrooms, Living room, Dining area, Two bathrooms, Stocked premium bar, Nespresso coffee maker, Smart TVs, WiFi',
          bathroom_features: 'Two full bathrooms, Walk-in showers, Bathtubs',
          accessibility_features: 'Available on request',
          max_occupancy: 6,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Two Bedroom Residence Suite',
        description: 'Luxurious residential-style suite with two bedrooms, full kitchen, and expansive living spaces. Perfect for extended stays or special occasions.',
        size_sqft: 2500,
        view: 'Ocean',
        capacity: 6,
        base_rate: 2200.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/two-bedroom-residence-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/residence-suite-kitchen-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'Two Kings',
          in_room_amenities: 'Full kitchen, Living room, Dining room, Two bedrooms, Two bathrooms, Butler service, Premium bar, Entertainment system',
          bathroom_features: 'Two luxury bathrooms, Jacuzzi tubs, Walk-in showers',
          accessibility_features: 'Available on request',
          max_occupancy: 6,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Imperial Suite',
        description: 'The most exclusive accommodation with three bedrooms, private pool, cinema room, and dedicated butler. Ultimate luxury for discerning guests.',
        size_sqft: 5000,
        view: 'Ocean',
        capacity: 8,
        base_rate: 5000.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/imperial-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/imperial-suite-pool-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'Three Kings',
          in_room_amenities: 'Private pool, Cinema room, Full kitchen, Dining room, Living room, Office, Three bedrooms, Butler service, Private chef available',
          bathroom_features: 'Three luxury bathrooms, Steam shower, Jacuzzi, Premium amenities',
          accessibility_features: 'Full accessibility available',
          max_occupancy: 8,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Presidential Suite',
        description: 'Opulent three-bedroom suite with panoramic ocean views, private terrace with plunge pool, and personalized concierge service.',
        size_sqft: 3500,
        view: 'Ocean',
        capacity: 8,
        base_rate: 3500.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/presidential-suite-at-grand-velas-los-cabos.jpg',
          'https://www.grandvelas.com/resourcefiles/roomsuitegallery/presidential-suite-terrace-at-grand-velas-los-cabos.jpg'
        ],
        attributes: {
          bed_configuration: 'Three Kings',
          in_room_amenities: 'Plunge pool, Living room, Dining room, Full kitchen, Three bedrooms, Butler service, Concierge, Entertainment system',
          bathroom_features: 'Three luxury bathrooms, Jacuzzi, Walk-in showers, Designer amenities',
          accessibility_features: 'Available on request',
          max_occupancy: 8,
          extra_bed_available: true,
          smoking_allowed: false
        }
      }
    ];

    // Insert all rooms
    for (const room of rooms) {
      await client.query(
        `INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images, attributes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          hotelId, 
          room.name, 
          room.description, 
          room.size_sqft, 
          room.view, 
          room.capacity, 
          room.base_rate, 
          JSON.stringify(room.images),
          JSON.stringify(room.attributes)
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ 
      success: true, 
      message: 'Successfully added all 12 rooms for Grand Velas Los Cabos',
      roomCount: rooms.length 
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Failed to seed rooms:', err);
    res.status(500).json({ error: err.message || 'Failed to seed rooms' });
  } finally {
    client.release();
  }
});

export default router;
