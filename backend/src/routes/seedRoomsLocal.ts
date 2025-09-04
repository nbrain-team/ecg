import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Seed all Grand Velas Los Cabos rooms with local image paths
router.post('/seed-grand-velas-rooms-local', async (req, res) => {
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
    
    // Delete existing rooms for this hotel
    await client.query('DELETE FROM hotel_rooms WHERE hotel_id = $1', [hotelId]);
    
    const rooms = [
      // Wellness Level
      {
        name: 'Wellness Suite Ocean View',
        description: 'Spacious suite with wellness-focused amenities including aromatherapy, yoga mat, and healthy minibar options. Features panoramic ocean views.',
        size_sqft: 800,
        view: 'Ocean',
        capacity: 2,
        base_rate: 650.0,
        images: ['/images/rooms/wellness-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Aromatherapy kit, Yoga mat, Meditation cushion, Healthy minibar, Nespresso machine, Smart TV, WiFi',
          bathroom_features: 'Rain shower, Wellness bath products, Bathrobes and slippers',
          accessibility_features: 'Wheelchair accessible available',
          max_occupancy: 2,
          extra_bed_available: false,
          smoking_allowed: false
        }
      },
      {
        name: 'Wellness Suite Oceanfront',
        description: 'Premium wellness suite directly facing the ocean with expanded terrace for yoga and meditation. Includes daily wellness activities.',
        size_sqft: 900,
        view: 'Oceanfront',
        capacity: 2,
        base_rate: 750.0,
        images: ['/images/rooms/wellness-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Aromatherapy kit, Yoga mat, Meditation cushion, Healthy minibar, Nespresso machine, Smart TV, WiFi, Private terrace with loungers',
          bathroom_features: 'Rain shower, Jacuzzi tub, Wellness bath products, Double vanity',
          accessibility_features: 'Available on request',
          max_occupancy: 2,
          extra_bed_available: false,
          smoking_allowed: false
        }
      },
      // Ambassador Level
      {
        name: 'Ambassador Ocean Suite',
        description: 'Elegant suite with stunning ocean views, private terrace, and luxurious amenities. Wake up to breathtaking views of the Sea of Cortez.',
        size_sqft: 1000,
        view: 'Ocean',
        capacity: 3,
        base_rate: 950.0,
        images: ['/images/rooms/ambassador-ocean-suite.jpg'],
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
      {
        name: 'Ambassador Pool Suite',
        description: 'Luxurious suite with direct pool access from your private terrace. Perfect for pool enthusiasts who want immediate access to swimming.',
        size_sqft: 1000,
        view: 'Pool',
        capacity: 3,
        base_rate: 850.0,
        images: ['/images/rooms/ambassador-pool-suite.jpg'],
        attributes: {
          bed_configuration: 'King or Two Queens',
          in_room_amenities: 'Premium bath amenities, Stocked bar, Nespresso machine, Pool towels, Smart TV, WiFi',
          bathroom_features: 'Walk-in shower, Bathtub, Double vanity',
          accessibility_features: 'Ground floor options available',
          max_occupancy: 3,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Ambassador Spa & Pool Suite',
        description: 'Ultimate relaxation suite with private plunge pool and spa-inspired amenities. Features oversized bathroom with spa tub.',
        size_sqft: 1100,
        view: 'Garden/Spa',
        capacity: 3,
        base_rate: 1050.0,
        images: ['/images/rooms/ambassador-spa-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Spa amenities kit, Private plunge pool, Stocked bar, Nespresso machine, Smart TV, WiFi, Outdoor shower',
          bathroom_features: 'Spa tub, Separate rain shower, Double vanity, Spa products',
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
        capacity: 4,
        base_rate: 1100.0,
        images: ['/images/rooms/master-pool-suite.jpg'],
        attributes: {
          bed_configuration: 'King or Two Queens',
          in_room_amenities: 'Premium bar selection, Butler service, Nespresso machine, Large Smart TV, High-speed WiFi, Pool cabana access',
          bathroom_features: 'Oversized shower, Jacuzzi tub, Double vanity, Luxury bath products',
          accessibility_features: 'Available on request',
          max_occupancy: 4,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Master Ocean Suite',
        description: 'Expansive oceanfront suite with wrap-around terrace and unobstructed ocean views. Features separate living area and dining space.',
        size_sqft: 1300,
        view: 'Ocean',
        capacity: 4,
        base_rate: 1350.0,
        images: ['/images/rooms/master-ocean-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Butler service, Premium bar, Nespresso & tea service, Large Smart TV, Bose sound system, Telescope for whale watching',
          bathroom_features: 'Ocean-view bathroom, Jacuzzi for two, Rain shower, Double vanity',
          accessibility_features: 'Available on request',
          max_occupancy: 4,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Master Spa Suite',
        description: 'Tranquil suite designed for ultimate relaxation with private spa treatment room and wellness amenities. Includes daily spa credits.',
        size_sqft: 1250,
        view: 'Spa/Garden',
        capacity: 4,
        base_rate: 1250.0,
        images: ['/images/rooms/master-spa-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Private spa room, Butler service, Wellness bar, Aromatherapy, Sound therapy system, Smart TV',
          bathroom_features: 'Spa bathroom, Steam shower, Jacuzzi, Double vanity, Heated floors',
          accessibility_features: 'Available on request',
          max_occupancy: 4,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      // Grand Class Level
      {
        name: 'Grand Class Ocean Suite',
        description: 'The pinnacle of luxury with expansive ocean views, private pool, and exclusive Grand Class amenities. Butler service included.',
        size_sqft: 1500,
        view: 'Ocean',
        capacity: 4,
        base_rate: 1800.0,
        images: ['/images/rooms/grand-class-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Personal concierge, Private pool, Premium bar, Wine fridge, Nespresso & tea bar, Entertainment system, iPad control',
          bathroom_features: 'Spa-style bathroom, Ocean-view Jacuzzi, Rain shower system, Double vanity, Luxury amenities',
          accessibility_features: 'Full accessibility available',
          max_occupancy: 4,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Grand Class Spa Suite',
        description: 'Exclusive spa suite with private treatment areas, wellness concierge, and unlimited spa access. The ultimate wellness retreat.',
        size_sqft: 1400,
        view: 'Spa/Ocean',
        capacity: 4,
        base_rate: 1700.0,
        images: ['/images/rooms/grand-class-spa-suite.jpg'],
        attributes: {
          bed_configuration: 'King',
          in_room_amenities: 'Private spa facilities, Wellness concierge, Healthy gourmet bar, Meditation area, Entertainment system',
          bathroom_features: 'Dual spa bathrooms, Steam room, Jacuzzi, Rain shower, Luxury spa products',
          accessibility_features: 'Available on request',
          max_occupancy: 4,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      // Specialty Suites
      {
        name: 'Two Bedroom Family Suite',
        description: 'Ideal for families with two bedrooms, two bathrooms, and spacious living areas. Kids amenities and connecting rooms available.',
        size_sqft: 1800,
        view: 'Ocean/Garden',
        capacity: 6,
        base_rate: 2200.0,
        images: ['/images/rooms/two-bedroom-family-suite.jpg'],
        attributes: {
          bed_configuration: 'One King + Two Queens',
          in_room_amenities: 'Kids welcome amenities, Game console, Two TVs, Full kitchen, Dining area, Premium bar',
          bathroom_features: 'Two full bathrooms, Bathtub in kids bathroom, Walk-in showers',
          accessibility_features: 'Fully accessible options',
          max_occupancy: 6,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Two Bedroom Residence Suite',
        description: 'Residential-style suite with full kitchen, living room, and dining area. Perfect for extended stays or those wanting a home-like experience.',
        size_sqft: 2000,
        view: 'Ocean',
        capacity: 6,
        base_rate: 2500.0,
        images: ['/images/rooms/two-bedroom-family-suite.jpg'],
        attributes: {
          bed_configuration: 'Two Kings',
          in_room_amenities: 'Full kitchen, Washer/dryer, Living room, Dining for 8, Office area, Premium entertainment system',
          bathroom_features: 'Two luxury bathrooms, Jacuzzi in master, Double showers',
          accessibility_features: 'Available on request',
          max_occupancy: 6,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Presidential Suite',
        description: 'The most exclusive accommodation with three bedrooms, private pool, cinema room, and personal chef service. Ultimate luxury and privacy.',
        size_sqft: 3500,
        view: 'Panoramic Ocean',
        capacity: 8,
        base_rate: 5000.0,
        images: ['/images/rooms/presidential-suite.jpg'],
        attributes: {
          bed_configuration: 'Three Kings',
          in_room_amenities: 'Private pool & hot tub, Cinema room, Full kitchen with chef, Piano, Office, Gym equipment, Butler team',
          bathroom_features: 'Three luxury bathrooms, Spa facilities, Steam room, Multiple Jacuzzis',
          accessibility_features: 'Full accessibility',
          max_occupancy: 8,
          extra_bed_available: true,
          smoking_allowed: false
        }
      },
      {
        name: 'Imperial Suite',
        description: 'Ultra-luxury penthouse suite with rooftop terrace, infinity pool, and 360-degree ocean views. Includes helicopter pad access.',
        size_sqft: 4000,
        view: '360-degree Ocean',
        capacity: 10,
        base_rate: 7500.0,
        images: ['/images/rooms/imperial-suite.jpg'],
        attributes: {
          bed_configuration: 'Four Kings',
          in_room_amenities: 'Rooftop infinity pool, Private spa, Cinema, Wine cellar, Chef kitchen, Butler team, Helicopter transfers',
          bathroom_features: 'Four spa bathrooms, Private hammam, Multiple Jacuzzis, Rainfall showers',
          accessibility_features: 'Full accessibility with private elevator',
          max_occupancy: 10,
          extra_bed_available: true,
          smoking_allowed: false
        }
      }
    ];
    
    // Insert rooms
    for (const room of rooms) {
      await client.query(
        `INSERT INTO hotel_rooms 
         (hotel_id, name, description, size_sqft, view, capacity, base_rate, images, attributes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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
      message: 'Grand Velas Los Cabos rooms seeded successfully with local images', 
      roomsCreated: rooms.length 
    });
    
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error seeding rooms:', error);
    res.status(500).json({ message: 'Failed to seed rooms', error: error.message });
  } finally {
    client.release();
  }
});

export default router;
