import pool from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert Grand Velas Los Cabos hotel
    const hotelRes = await client.query(
      `INSERT INTO hotels (name, slug, website, description, address, city, country, latitude, longitude, rating_standard, rating_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO UPDATE SET website = EXCLUDED.website, description = EXCLUDED.description
       RETURNING id`,
      [
        'Grand Velas Los Cabos',
        'grand-velas-los-cabos',
        'https://www.grandvelas.com/resorts/grand-velas-los-cabos',
        'All-inclusive luxury resort in Los Cabos featuring modern suites, world-class spa, and acclaimed dining.',
        'Tourist Corridor Km 17, San José del Cabo, Cabo San Lucas, Mexico',
        'Los Cabos',
        'Mexico',
        22.968141,
        -109.794384,
        'forbes',
        '5-star'
      ]
    );
    const hotelId = hotelRes.rows[0].id;

    // Create a hotel user (password: hotel123)
    const password = await bcrypt.hash('hotel123', 10);
    await client.query(
      `INSERT INTO hotel_users (hotel_id, email, password, name, role)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING`,
      [hotelId, 'manager@grandvelasloscabos.com', password, 'Grand Velas Manager', 'hotel']
    );

    // Insert some images (hero and sample)
    const images = [
      {
        url: 'https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg',
        alt: 'Oceanfront living room at Grand Velas Los Cabos',
        category: 'hero'
      },
      {
        url: 'https://www.grandvelas.com/resourcefiles/resorts-page-offers/stargazing-experience-at-grand-velas-los-cabos.jpg',
        alt: 'Stargazing Experience at Grand Velas Los Cabos',
        category: 'experience'
      }
    ];
    for (const img of images) {
      await client.query(
        `INSERT INTO hotel_images (hotel_id, url, alt, category) VALUES ($1,$2,$3,$4)
         ON CONFLICT DO NOTHING`,
        [hotelId, img.url, img.alt, img.category]
      );
    }

    // Insert a couple of rooms (sample data)
    const rooms = [
      {
        name: 'Ambassador Suite Ocean View',
        description: 'Spacious suite with ocean view, modern design, and premium amenities.',
        size_sqft: 1000,
        view: 'Ocean',
        capacity: 3,
        base_rate: 950.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg'
        ]
      },
      {
        name: 'Grand Class Suite',
        description: 'Luxurious suite featuring private terrace and panoramic ocean views.',
        size_sqft: 1300,
        view: 'Ocean',
        capacity: 3,
        base_rate: 1250.0,
        images: [
          'https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg'
        ]
      }
    ];
    for (const r of rooms) {
      await client.query(
        `INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [hotelId, r.name, r.description, r.size_sqft, r.view, r.capacity, r.base_rate, JSON.stringify(r.images)]
      );
    }

    // Insert a sample venue
    await client.query(
      `INSERT INTO hotel_venues (hotel_id, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        hotelId,
        'Oceanfront Terrace',
        'Elegant outdoor venue with ocean vistas, ideal for receptions and dinners.',
        5000,
        20,
        300,
        200,
        350,
        JSON.stringify([
          'https://www.grandvelas.com/resourcefiles/resorts-page-offers/brunch-with-ocean-backdrop-at-grand-velas-los-cabos.jpg'
        ])
      ]
    );

    // Insert a dining option
    await client.query(
      `INSERT INTO hotel_dining (hotel_id, name, cuisine, description, hours, dress_code, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        hotelId,
        'Cocina de Autor',
        'Contemporary fine dining',
        'Award-winning tasting menu showcasing regional ingredients.',
        'Dinner only',
        'Resort Elegant',
        JSON.stringify([
          'https://www.grandvelas.com/resourcefiles/resorts-page-offers/picnic-in-paradise-experience-at-grand-velas-los-cabos.jpg'
        ])
      ]
    );

    await client.query('COMMIT');
    console.log('Seed completed. Hotel user: manager@grandvelasloscabos.com / hotel123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();


