import pool from '../config/database';
import bcrypt from 'bcryptjs';

export async function bootstrapGrandVelasIfMissing(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id FROM hotels WHERE slug = $1', ['grand-velas-los-cabos']);
    if (existing.rowCount && existing.rows[0]?.id) {
      await client.query('ROLLBACK');
      return;
    }

    const hotelRes = await client.query(
      `INSERT INTO hotels (name, slug, website, description, address, city, country, latitude, longitude, rating_standard, rating_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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

    const password = await bcrypt.hash('hotel123', 10);
    await client.query(
      `INSERT INTO hotel_users (hotel_id, email, password, name, role)
       VALUES ($1,$2,$3,$4,$5)`,
      [hotelId, 'manager@grandvelasloscabos.com', password, 'Grand Velas Manager', 'hotel']
    );

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
        `INSERT INTO hotel_images (hotel_id, url, alt, category) VALUES ($1,$2,$3,$4)`,
        [hotelId, img.url, img.alt, img.category]
      );
    }

    await client.query(
      `INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        hotelId,
        'Ambassador Suite Ocean View',
        'Spacious suite with ocean view, modern design, and premium amenities.',
        1000,
        'Ocean',
        3,
        950.0,
        JSON.stringify(['https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg'])
      ]
    );

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
        JSON.stringify(['https://www.grandvelas.com/resourcefiles/resorts-page-offers/brunch-with-ocean-backdrop-at-grand-velas-los-cabos.jpg'])
      ]
    );

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
        JSON.stringify(['https://www.grandvelas.com/resourcefiles/resorts-page-offers/picnic-in-paradise-experience-at-grand-velas-los-cabos.jpg'])
      ]
    );

    await client.query('COMMIT');
    console.log('Grand Velas bootstrap completed');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bootstrap failed:', err);
  } finally {
    client.release();
  }
}


