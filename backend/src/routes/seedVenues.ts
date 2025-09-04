import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Seed all Grand Velas Los Cabos venues/meeting spaces
router.post('/seed-grand-velas-venues', async (req, res) => {
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
    
    // Delete existing venues for this hotel (optional - comment out if you want to keep existing)
    // await client.query('DELETE FROM hotel_venues WHERE hotel_id = $1', [hotelId]);
    
    const venues = [
      {
        name: 'GRAND MARISSA',
        description: 'Banquets, galas and celebrations come alive in the elegant Grand Marissa Ballroom. Our versatile event and meeting space can accommodate up to 360 people for banquets.',
        sqft: 6617,
        ceiling_height_ft: 18,
        capacity_reception: 800,
        capacity_banquet: 400,
        capacity_theater: 600,
        images: ['/images/venues/GRAND-MARISSA.webp'],
        attributes: {
          length_m: '31.4', // 103 ft converted
          width_m: '20.4', // 67 ft converted
          height_m: '5.5', // 18 ft converted
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'true',
          theater: '600',
          classroom: '360',
          banquet_rounds_10: '400',
          reception: '800',
          u_shape: '100',
          boardroom: '0',
          hollow_square: '150',
          crescent_rounds: '216',
          royal_conference: '600'
        }
      },
      {
        name: 'Marissa',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 2206,
        ceiling_height_ft: 18,
        capacity_reception: 250,
        capacity_banquet: 120,
        capacity_theater: 180,
        images: ['/images/venues/Marissa.webp'],
        attributes: {
          length_m: '10.7', // 35 ft
          width_m: '20.4', // 67 ft
          height_m: '5.5', // 18 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'true',
          theater: '180',
          classroom: '120',
          banquet_rounds_10: '120',
          reception: '250',
          u_shape: '45',
          boardroom: '0',
          hollow_square: '60',
          crescent_rounds: '72',
          royal_conference: '180'
        }
      },
      {
        name: 'Monica',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 2206,
        ceiling_height_ft: 18,
        capacity_reception: 250,
        capacity_banquet: 120,
        capacity_theater: 180,
        images: ['/images/venues/Monica.webp'],
        attributes: {
          length_m: '10.7', // 35 ft
          width_m: '20.4', // 67 ft
          height_m: '5.5', // 18 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'true',
          theater: '180',
          classroom: '120',
          banquet_rounds_10: '120',
          reception: '250',
          u_shape: '45',
          boardroom: '0',
          hollow_square: '60',
          crescent_rounds: '72',
          royal_conference: '180'
        }
      },
      {
        name: 'Mariana',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 2206,
        ceiling_height_ft: 18,
        capacity_reception: 250,
        capacity_banquet: 120,
        capacity_theater: 180,
        images: ['/images/venues/Mariana.webp'],
        attributes: {
          length_m: '10.1', // 33 ft
          width_m: '20.4', // 67 ft
          height_m: '5.5', // 18 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'true',
          theater: '180',
          classroom: '120',
          banquet_rounds_10: '120',
          reception: '250',
          u_shape: '45',
          boardroom: '0',
          hollow_square: '60',
          crescent_rounds: '72',
          royal_conference: '180'
        }
      },
      {
        name: 'Mariana 1',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 742,
        ceiling_height_ft: 18,
        capacity_reception: 60,
        capacity_banquet: 30,
        capacity_theater: 50,
        images: ['/images/venues/Mariana 1.webp'],
        attributes: {
          length_m: '6.7', // 22 ft
          width_m: '9.1', // 30 ft
          height_m: '5.5', // 18 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'false',
          theater: '50',
          classroom: '30',
          banquet_rounds_10: '30',
          reception: '60',
          u_shape: '25',
          boardroom: '30',
          hollow_square: '30',
          crescent_rounds: '18'
        }
      },
      {
        name: 'Mariana 2',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 742,
        ceiling_height_ft: 18,
        capacity_reception: 60,
        capacity_banquet: 30,
        capacity_theater: 50,
        images: ['/images/venues/Mariana 2.webp'],
        attributes: {
          length_m: '6.4', // 21 ft
          width_m: '10.1', // 33 ft
          height_m: '5.5', // 18 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'false',
          theater: '50',
          classroom: '30',
          banquet_rounds_10: '30',
          reception: '60',
          u_shape: '25',
          boardroom: '30',
          hollow_square: '30',
          crescent_rounds: '18'
        }
      },
      {
        name: 'Mariana 3',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 796,
        ceiling_height_ft: 18,
        capacity_reception: 60,
        capacity_banquet: 30,
        capacity_theater: 50,
        images: ['/images/venues/Mariana 3.webp'],
        attributes: {
          length_m: '6.7', // 22 ft
          width_m: '10.1', // 33 ft
          height_m: '5.5', // 18 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'false',
          theater: '50',
          classroom: '30',
          banquet_rounds_10: '30',
          reception: '60',
          u_shape: '25',
          boardroom: '30',
          hollow_square: '30',
          crescent_rounds: '18'
        }
      },
      {
        name: 'TAMAYO I & II',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 2798,
        ceiling_height_ft: 13,
        capacity_reception: 150,
        capacity_banquet: 110,
        capacity_theater: 140,
        images: ['/images/venues/TAMAYO I & II.webp'],
        attributes: {
          length_m: '23.2', // 76 ft
          width_m: '12.2', // 40 ft
          height_m: '4', // 13 ft
          floor_type: 'Carpet',
          natural_light: 'true',
          rigging_points: 'false',
          theater: '140',
          classroom: '100',
          banquet_rounds_10: '110',
          reception: '150',
          u_shape: '0',
          boardroom: '0',
          crescent_rounds: '66'
        }
      },
      {
        name: 'Tamayo I',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 1399,
        ceiling_height_ft: 13,
        capacity_reception: 75,
        capacity_banquet: 50,
        capacity_theater: 70,
        images: ['/images/venues/Tamayo I.webp'],
        attributes: {
          length_m: '12.5', // 41 ft
          width_m: '12.2', // 40 ft
          height_m: '4', // 13 ft
          floor_type: 'Carpet',
          natural_light: 'true',
          rigging_points: 'false',
          theater: '70',
          classroom: '50',
          banquet_rounds_10: '50',
          reception: '75',
          u_shape: '30',
          boardroom: '30',
          hollow_square: '40',
          crescent_rounds: '30'
        }
      },
      {
        name: 'Tamayo II',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 1399,
        ceiling_height_ft: 13,
        capacity_reception: 75,
        capacity_banquet: 50,
        capacity_theater: 70,
        images: ['/images/venues/Tamayo II.webp'],
        attributes: {
          length_m: '10.7', // 35 ft
          width_m: '12.5', // 41 ft
          height_m: '4', // 13 ft
          floor_type: 'Carpet',
          natural_light: 'true',
          rigging_points: 'false',
          theater: '70',
          classroom: '50',
          banquet_rounds_10: '50',
          reception: '75',
          u_shape: '30',
          boardroom: '30',
          hollow_square: '40',
          crescent_rounds: '30'
        }
      },
      {
        name: 'Diego Rivera',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 463,
        ceiling_height_ft: 13,
        capacity_reception: 0,
        capacity_banquet: 0,
        capacity_theater: 0,
        images: ['/images/venues/Diego Rivera.webp'],
        attributes: {
          length_m: '7.3', // 24 ft
          width_m: '5.8', // 19 ft
          height_m: '4', // 13 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'false',
          theater: '0',
          classroom: '0',
          banquet_rounds_10: '0',
          reception: '0',
          u_shape: '0',
          boardroom: '12'
        }
      },
      {
        name: 'Siqueiros',
        description: 'Configure this room to your needs, decor and overall layout. A fantastic option for group events, meetups, celebrations and more.',
        sqft: 506,
        ceiling_height_ft: 13,
        capacity_reception: 0,
        capacity_banquet: 0,
        capacity_theater: 0,
        images: ['/images/venues/Siqueiros.webp'],
        attributes: {
          length_m: '8.8', // 29 ft
          width_m: '5.8', // 19 ft
          height_m: '4', // 13 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'false',
          theater: '0',
          classroom: '0',
          banquet_rounds_10: '0',
          reception: '0',
          u_shape: '0',
          boardroom: '16'
        }
      },
      {
        name: 'Velasco',
        description: 'Velasco room is located next to Grand Marissa Ballroom. Excellent venue for office or storage while using the ballroom.',
        sqft: 581,
        ceiling_height_ft: 10.5,
        capacity_reception: 35,
        capacity_banquet: 30,
        capacity_theater: 56,
        images: ['/images/venues/velasco.webp'], // No image provided, using lowercase
        attributes: {
          length_m: '7.8', // 25.5 ft
          width_m: '6.2', // 20.4 ft
          height_m: '3.2', // 10.5 ft
          floor_type: 'Carpet',
          natural_light: 'false',
          rigging_points: 'false',
          theater: '56',
          classroom: '32',
          banquet_rounds_10: '30',
          reception: '35',
          u_shape: '24',
          boardroom: '0',
          hollow_square: '25',
          crescent_rounds: '24'
        }
      },
      {
        name: 'Amphitheatre',
        description: 'Ground floor, next to the pool. Characteristics: Round outdoor stage space with seating and great acoustics. Suggested time: 5 pm to 11 pm. Event: Performance',
        sqft: 1,
        ceiling_height_ft: 0,
        capacity_reception: 0,
        capacity_banquet: 0,
        capacity_theater: 180,
        images: ['/images/venues/amphitheatre.webp'], // No image provided
        attributes: {
          length_m: '0',
          width_m: '0',
          height_m: '0',
          floor_type: 'Outdoor',
          natural_light: 'true',
          rigging_points: 'true',
          theater: '180',
          classroom: '0',
          banquet_rounds_10: '0',
          reception: '0',
          u_shape: '0',
          boardroom: '0'
        }
      },
      {
        name: 'Ocean Garden',
        description: 'Ocean-front, to the side of the pool. Characteristics: Large outdoor lawn for events, surrounded by beautiful tropical foliage. Suggested Hours: 7 am to 11pm. Event: Breakfast, lunch, Cocktail, Dinner with Show. Additional Considerations: Lighting, stage for musical group, dance floor, tent',
        sqft: 8134,
        ceiling_height_ft: 0,
        capacity_reception: 1500,
        capacity_banquet: 700,
        capacity_theater: 0,
        images: ['/images/venues/Ocean Garden.webp'],
        attributes: {
          length_m: '0',
          width_m: '0',
          height_m: '0',
          floor_type: 'Outdoor Lawn',
          natural_light: 'true',
          rigging_points: 'true',
          theater: '0',
          classroom: '0',
          banquet_rounds_10: '700',
          reception: '1500',
          u_shape: '0',
          boardroom: '0'
        }
      },
      {
        name: 'Gazebo',
        description: 'Ocean-front, to the side of Azul Restaurant. Characteristics: Outdoor space with three majestic stone windows framing the sea. Suggested Time 5pm to 11pm. Event: Breakfast, Cocktail reception, Dinner. Additional considerations: Lighting.',
        sqft: 1,
        ceiling_height_ft: 0,
        capacity_reception: 100,
        capacity_banquet: 70,
        capacity_theater: 0,
        images: ['/images/venues/Gazebo.webp'],
        attributes: {
          length_m: '0',
          width_m: '0',
          height_m: '0',
          floor_type: 'Outdoor',
          natural_light: 'true',
          rigging_points: 'false',
          theater: '0',
          classroom: '0',
          banquet_rounds_10: '70',
          reception: '100',
          u_shape: '0',
          boardroom: '0'
        }
      }
    ];
    
    // Insert venues
    for (const venue of venues) {
      await client.query(
        `INSERT INTO hotel_venues 
         (hotel_id, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images, attributes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          hotelId,
          venue.name,
          venue.description,
          venue.sqft,
          venue.ceiling_height_ft,
          venue.capacity_reception,
          venue.capacity_banquet,
          venue.capacity_theater,
          JSON.stringify(venue.images),
          JSON.stringify(venue.attributes)
        ]
      );
    }
    
    await client.query('COMMIT');
    res.json({ 
      message: 'Grand Velas Los Cabos venues seeded successfully', 
      venuesCreated: venues.length 
    });
    
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error seeding venues:', error);
    res.status(500).json({ message: 'Failed to seed venues', error: error.message });
  } finally {
    client.release();
  }
});

export default router;
