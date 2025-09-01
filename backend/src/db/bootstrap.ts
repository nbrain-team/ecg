import pool from '../config/database';
import bcrypt from 'bcryptjs';

export async function bootstrapGrandVelasIfMissing(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id FROM hotels WHERE slug = $1', ['grand-velas-los-cabos']);
    let hotelId: string;
    if (existing.rowCount && existing.rows[0]?.id) {
      hotelId = existing.rows[0].id;
    } else {
      const hotelRes = await client.query(
        `INSERT INTO hotels (name, slug, website, description, address, city, country, latitude, longitude, rating_standard, rating_level)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          'Grand Velas Los Cabos',
          'grand-velas-los-cabos',
          'https://www.grandvelas.com/resorts/grand-velas-los-cabos',
          'All-inclusive luxury resort in Los Cabos featuring modern suites, world-class spa, and acclaimed dining.',
          'Carretera Transpeninsular Km 17, San José del Cabo, Corredor Turístico, Los Cabos, B.C.S., México',
          'Los Cabos',
          'Mexico',
          22.968141,
          -109.794384,
          'aaa',
          '5-star'
        ]
      );
      hotelId = hotelRes.rows[0].id;
    }

    // Upsert schema sections (best-effort realistic values)
    const schemaHeader = {
      version: '1.0.0',
      last_updated_utc: new Date().toISOString(),
      id: 'grand_velas_los_cabos'
    };
    const metadata = {
      status: 'active',
      visibility: 'public',
      languages_supported: ['en', 'es'],
      timezone: 'America/Mazatlan'
    };
    const identity = {
      legal_name: 'Operadora de Hoteles Gran Clase Los Cabos, S.A. de C.V.',
      brand_name: 'Grand Velas Los Cabos',
      chain: 'Velas Resorts',
      opening_date: '2016-12-20',
      last_renovation_date: '2023-01-01',
      star_rating: 5.0,
      description_short: 'Ultra-luxury all-inclusive resort between Cabo San Lucas and San José del Cabo.',
      description_long: 'Award-winning all-inclusive luxury resort with oceanview suites, acclaimed dining including Cocina de Autor, SE Spa, and versatile event venues with ocean vistas.'
    };
    const contact = {
      primary_contact: {
        name: 'Sales Office',
        title: 'Group Sales',
        email: 'sales.loscabos@velasresorts.com',
        phone: '+52 624 104 9800',
        preferred_contact_method: 'email'
      },
      rfp_inbox_email: 'groups.loscabos@velasresorts.com',
      website_url: 'https://www.grandvelas.com/resorts/grand-velas-los-cabos',
      booking_portal_url: 'https://www.grandvelas.com',
      virtual_tour_url: '',
      social: {
        instagram: 'https://www.instagram.com/velasresorts/',
        linkedin: 'https://www.linkedin.com/company/velas-resorts/'
      }
    };
    const location = {
      address: {
        line1: 'Carretera Transpeninsular Km 17',
        line2: 'Corredor Turístico',
        city: 'Los Cabos',
        state_region: 'B.C.S.',
        postal_code: '',
        country: 'MX'
      },
      latitude: 22.968141,
      longitude: -109.794384,
      neighborhood: 'Tourist Corridor',
      transport: {
        distance_to_airports_km: {
          SJD: 30
        },
        public_transit: [],
        shuttle: { airport_shuttle: true, local_shuttle: false },
        parking: { on_site: true, valet: true, self_park: false, bus_parking: true, electric_vehicle_charging: true }
      }
    };
    const images_media = {
      primary_image: {
        url: 'https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg',
        alt: 'Oceanfront suite at Grand Velas Los Cabos',
        width_px: 1920,
        height_px: 1080,
        caption: 'Oceanfront Suite',
        tags: ['ocean', 'suite'],
        license: 'reference'
      },
      gallery: [
        {
          url: 'https://www.grandvelas.com/resourcefiles/resorts-page-offers/stargazing-experience-at-grand-velas-los-cabos.jpg',
          alt: 'Stargazing Experience',
          width_px: 1600,
          height_px: 900,
          caption: 'Experiences',
          tags: ['experience'],
          license: 'reference'
        }
      ],
      floorplans: [],
      logos: {
        light_bg_url: 'https://www.grandvelas.com/resourcefiles/hotellogo/grandvelas-logo.svg',
        dark_bg_url: 'https://www.grandvelas.com/resourcefiles/hotellogo/grandvelas-logo.svg'
      },
      '3d_models': []
    };
    const amenities_property = {
      pool: { indoor: false, outdoor: true, heated: true, seasonal: false },
      fitness_center: { hours: '24/7', size_sqm: 250, classes_available: true },
      spa: { onsite: true, treatment_rooms: 16 },
      beach_access: true,
      rooftop: false,
      business_center: true,
      concierge: true,
      laundry: ['valet']
    };
    const accommodations = {
      total_rooms: 307,
      total_suites: 307,
      room_types: [
        {
          id: 'ambassador_ocean_view',
          name: 'Ambassador Suite Ocean View',
          room_count: 100,
          bed_configuration: ['king','queen'],
          size_sqm: 98,
          max_occupancy: 3,
          connectable: true,
          images: [],
          in_room_amenities: ['terrace','minibar','n espresso','smart_tv'],
          typical_group_rate_usd: { low: 650, high: 1200 },
          view: 'ocean'
        }
      ],
      inventory_rules: { max_allocation_pct_for_groups: 60 }
    };
    const meeting_event_spaces = [
      {
        id: 'grand_velas_ballroom',
        name: 'Grand Velas Ballroom',
        level: 1,
        area_sqm: 900,
        dimensions_m: { length: 45, width: 20, height: 7 },
        divisible: true,
        partitions: 3,
        natural_light: false,
        capacities: { theater: 1200, classroom: 700, banquet_rounds_10: 800, reception: 1500 },
        outdoor: false,
        images: []
      },
      {
        id: 'oceanfront_terrace',
        name: 'Oceanfront Terrace',
        level: 1,
        area_sqm: 500,
        natural_light: true,
        capacities: { banquet_rounds_10: 250, reception: 400 },
        outdoor: true,
        images: []
      }
    ];
    const dining_outlets = [
      { id: 'cocina_de_autor', name: 'Cocina de Autor', type: 'restaurant', cuisine: ['Signature'], buyout_available: true, seating_capacity: 90 },
      { id: 'velas_10', name: 'Velas 10', type: 'restaurant', cuisine: ['Steak','Seafood'], buyout_available: true, seating_capacity: 120 },
      { id: 'frida', name: 'Frida', type: 'restaurant', cuisine: ['Mexican'], seating_capacity: 110 },
      { id: 'lucca', name: 'Lucca', type: 'restaurant', cuisine: ['Italian'], seating_capacity: 140 },
      { id: 'azul', name: 'Azul', type: 'restaurant', cuisine: ['International'], seating_capacity: 200 },
      { id: 'cabrilla', name: 'Cabrilla', type: 'restaurant', cuisine: ['Seafood'], seating_capacity: 60 }
    ];
    const catering_banquets = {
      in_house_only: true,
      service_styles: ['plated','buffet','reception','stations'],
      dietary_accommodations: ['vegan','vegetarian','gluten_free','kosher','halal','nut_free'],
      bar_packages: [ { name: 'Premium Open Bar', duration_hours: 4 } ]
    };
    const policies = {
      check_in_time: '15:00',
      check_out_time: '12:00',
      smoking: 'non_smoking_property',
      pets_allowed: false,
      outdoor_event_curfew: '22:00'
    };
    const sustainability = {
      certifications: [],
      linen_reuse_program: true,
      single_use_plastic_reduction: true
    };
    const taxes_fees = {
      occupancy_tax_pct: 20.0,
      tourism_assessment_pct: 0.0,
      service_charge_pct: 0.0,
      resort_fee_usd_per_night: 0
    };
    const network_it = {
      wifi: { property_wide: true, meeting_space_dedicated_ssid: true, redundancy: 'dual-fiber' }
    };
    const financials_group_contracting = {
      currency: 'USD',
      rate_types_supported: ['Net','Package'],
      group_rate_range_usd_per_night: { min: 650, max: 1500 },
      min_block_size_rooms: 10,
      max_block_size_rooms: 300
    };
    const availability_calendar = { closures: [], high_demand_periods: [] };
    const outdoor_spaces = [ meeting_event_spaces[1] ];
    const activities = { onsite: [], offsite_partners: [] };
    const risk_safety_compliance = { fire_code_cert_current: true, sprinklered: true };
    const ai_hints = {
      target_segments: ['luxury_incentive','executive_retreat'],
      price_positioning: 'luxury',
      unique_selling_points: ['All-suites oceanview','Award-winning dining','SE Spa']
    };
    const workflow = { rfp_response_sla_hours: 24 };

    await client.query(
      `UPDATE hotels SET
        schema_header = $2,
        metadata = $3,
        identity = $4,
        contact = $5,
        location = $6,
        images_media = $7,
        amenities_property = $8,
        accommodations = $9,
        meeting_event_spaces = $10,
        dining_outlets = $11,
        catering_banquets = $12,
        policies = $13,
        sustainability = $14,
        taxes_fees = $15,
        network_it = $16,
        financials_group_contracting = $17,
        availability_calendar = $18,
        outdoor_spaces = $19,
        activities = $20,
        risk_safety_compliance = $21,
        ai_hints = $22,
        workflow = $23,
        updated_at = NOW()
       WHERE id = $1`,
      [
        hotelId,
        schemaHeader,
        metadata,
        identity,
        contact,
        location,
        images_media,
        amenities_property,
        accommodations,
        meeting_event_spaces,
        dining_outlets,
        catering_banquets,
        policies,
        sustainability,
        taxes_fees,
        network_it,
        financials_group_contracting,
        availability_calendar,
        outdoor_spaces,
        activities,
        risk_safety_compliance,
        ai_hints,
        workflow
      ]
    );

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
        `INSERT INTO hotel_images (hotel_id, url, alt, category)
         SELECT $1,$2,$3,$4 WHERE NOT EXISTS (
           SELECT 1 FROM hotel_images WHERE hotel_id=$1 AND url=$2
         )`,
        [hotelId, img.url, img.alt, img.category]
      );
    }

    await client.query(
      `INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8 WHERE NOT EXISTS (
         SELECT 1 FROM hotel_rooms WHERE hotel_id=$1 AND name=$2
       )`,
      [
        hotelId,
        'Ambassador Suite Ocean View',
        'Spacious suite with ocean view, modern design, and premium amenities.',
        1050,
        'Ocean',
        3,
        950.0,
        JSON.stringify(['https://www.grandvelas.com/resourcefiles/hero-image/oceanfront-living-room-at-grand-velas-los-cabos.jpg'])
      ]
    );

    await client.query(
      `INSERT INTO hotel_venues (hotel_id, name, description, sqft, ceiling_height_ft, capacity_reception, capacity_banquet, capacity_theater, images)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS (
         SELECT 1 FROM hotel_venues WHERE hotel_id=$1 AND name=$2
       )`,
      [
        hotelId,
        'Oceanfront Terrace',
        'Elegant outdoor venue with ocean vistas, ideal for receptions and dinners.',
        5380,
        20,
        350,
        250,
        380,
        JSON.stringify(['https://www.grandvelas.com/resourcefiles/resorts-page-offers/brunch-with-ocean-backdrop-at-grand-velas-los-cabos.jpg'])
      ]
    );

    await client.query(
      `INSERT INTO hotel_dining (hotel_id, name, cuisine, description, hours, dress_code, images)
       SELECT $1,$2,$3,$4,$5,$6,$7 WHERE NOT EXISTS (
         SELECT 1 FROM hotel_dining WHERE hotel_id=$1 AND name=$2
       )`,
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


