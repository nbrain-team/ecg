-- Delete existing rooms for Grand Velas Los Cabos
DELETE FROM hotel_rooms WHERE hotel_id = '9f1c8a51-f264-4422-9783-04fabc5f8bb7';

-- Add all 12 rooms from Grand Velas Los Cabos
INSERT INTO hotel_rooms (hotel_id, name, description, size_sqft, view, capacity, base_rate, images, attributes)
VALUES 
-- Ambassador Level
('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Ambassador Spa & Pool Suite', 'Luxurious suite with spa privileges, pool views, and spacious living areas. Features a private terrace, premium bath amenities, and exclusive access to spa facilities.', 1000, 'Pool', 3, 850.0, 
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-spa-and-pool-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-spa-pool-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King or Two Queens", "in_room_amenities": "Premium L''Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge", "bathroom_features": "Separate shower and bathtub, Double vanity, Luxury bath amenities", "accessibility_features": "Available on request", "max_occupancy": 3, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Ambassador Ocean Suite', 'Elegant suite with stunning ocean views, private terrace, and luxurious amenities. Wake up to breathtaking views of the Sea of Cortez.', 1000, 'Ocean', 3, 950.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-ocean-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/ambassador-ocean-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King or Two Queens", "in_room_amenities": "Premium L''Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge", "bathroom_features": "Separate shower and bathtub, Double vanity, Ocean-view bathroom", "accessibility_features": "Available on request", "max_occupancy": 3, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

-- Master Level
('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Master Pool Suite', 'Sophisticated suite with direct pool access, modern Mexican decor, and premium amenities. Perfect for those who love poolside relaxation.', 1200, 'Pool', 3, 1050.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-pool-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-pool-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King or Two Queens", "in_room_amenities": "Premium L''Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Pool access", "bathroom_features": "Walk-in shower, Deep soaking tub, Double vanity", "accessibility_features": "Available on request", "max_occupancy": 3, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Master Ocean Suite', 'Spacious suite with panoramic ocean views, contemporary design, and exclusive amenities. Features a private terrace perfect for sunset viewing.', 1200, 'Ocean', 3, 1150.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-ocean-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/master-ocean-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King or Two Queens", "in_room_amenities": "Premium L''Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Binoculars", "bathroom_features": "Walk-in shower, Deep soaking tub, Double vanity, Ocean views", "accessibility_features": "Available on request", "max_occupancy": 3, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

-- Grand Class Level
('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Grand Class Spa Suite', 'Ultimate luxury suite with spa privileges, oversized terrace, and premium amenities. Includes exclusive access to spa facilities and treatments.', 1300, 'Spa Gardens', 3, 1250.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-spa-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-spa-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King", "in_room_amenities": "Premium L''Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Spa access, Butler service", "bathroom_features": "Walk-in shower, Jacuzzi tub, Double vanity, Luxury amenities", "accessibility_features": "Available on request", "max_occupancy": 3, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Grand Class Ocean Suite', 'Spectacular suite with unobstructed ocean views, luxurious furnishings, and personalized butler service. The epitome of oceanfront luxury.', 1300, 'Ocean', 3, 1350.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-ocean-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/grand-class-ocean-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King", "in_room_amenities": "Premium L''Occitane bath amenities, Stocked premium bar, Nespresso coffee maker, Smart TV, WiFi, In-room safe, Mini-fridge, Butler service, Telescope", "bathroom_features": "Walk-in shower, Jacuzzi tub, Double vanity, Ocean-view bathroom", "accessibility_features": "Available on request", "max_occupancy": 3, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

-- Wellness Suites
('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Wellness Suite Ocean View', 'Health-focused suite with wellness amenities, ocean views, and access to exclusive wellness programs. Features vitamin-infused shower and circadian lighting.', 1100, 'Ocean', 2, 1100.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-ocean-view-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-bathroom-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King", "in_room_amenities": "Vitamin C shower, Circadian lighting, Air purification system, Yoga mat, Meditation cushions, Healthy minibar, Nespresso coffee maker", "bathroom_features": "Vitamin-infused shower, Deep soaking tub, Natural bath products", "accessibility_features": "Available on request", "max_occupancy": 2, "extra_bed_available": false, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Wellness Suite Oceanfront', 'Premium wellness suite with direct ocean views, advanced wellness technology, and personalized health programs. Includes sleep therapy system.', 1100, 'Oceanfront', 2, 1200.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-oceanfront-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/wellness-suite-bathroom-oceanfront-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King", "in_room_amenities": "Vitamin C shower, Sleep therapy system, Circadian lighting, Air purification, Yoga equipment, Meditation tools, Healthy minibar", "bathroom_features": "Vitamin-infused shower, Chromotherapy tub, Natural products", "accessibility_features": "Available on request", "max_occupancy": 2, "extra_bed_available": false, "smoking_allowed": false}'::jsonb),

-- Special Suites
('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Two Bedroom Family Suite', 'Spacious two-bedroom suite perfect for families, with connecting rooms, living area, and ocean views. Ideal for multi-generational travel.', 2000, 'Ocean', 6, 1800.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/two-bedroom-family-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/family-suite-living-room-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "King + Two Queens", "in_room_amenities": "Two bedrooms, Living room, Dining area, Two bathrooms, Stocked premium bar, Nespresso coffee maker, Smart TVs, WiFi", "bathroom_features": "Two full bathrooms, Walk-in showers, Bathtubs", "accessibility_features": "Available on request", "max_occupancy": 6, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Two Bedroom Residence Suite', 'Luxurious residential-style suite with two bedrooms, full kitchen, and expansive living spaces. Perfect for extended stays or special occasions.', 2500, 'Ocean', 6, 2200.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/two-bedroom-residence-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/residence-suite-kitchen-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "Two Kings", "in_room_amenities": "Full kitchen, Living room, Dining room, Two bedrooms, Two bathrooms, Butler service, Premium bar, Entertainment system", "bathroom_features": "Two luxury bathrooms, Jacuzzi tubs, Walk-in showers", "accessibility_features": "Available on request", "max_occupancy": 6, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Imperial Suite', 'The most exclusive accommodation with three bedrooms, private pool, cinema room, and dedicated butler. Ultimate luxury for discerning guests.', 5000, 'Ocean', 8, 5000.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/imperial-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/imperial-suite-pool-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "Three Kings", "in_room_amenities": "Private pool, Cinema room, Full kitchen, Dining room, Living room, Office, Three bedrooms, Butler service, Private chef available", "bathroom_features": "Three luxury bathrooms, Steam shower, Jacuzzi, Premium amenities", "accessibility_features": "Full accessibility available", "max_occupancy": 8, "extra_bed_available": true, "smoking_allowed": false}'::jsonb),

('9f1c8a51-f264-4422-9783-04fabc5f8bb7', 'Presidential Suite', 'Opulent three-bedroom suite with panoramic ocean views, private terrace with plunge pool, and personalized concierge service.', 3500, 'Ocean', 8, 3500.0,
'["https://www.grandvelas.com/resourcefiles/roomsuitegallery/presidential-suite-at-grand-velas-los-cabos.jpg", "https://www.grandvelas.com/resourcefiles/roomsuitegallery/presidential-suite-terrace-at-grand-velas-los-cabos.jpg"]'::jsonb,
'{"bed_configuration": "Three Kings", "in_room_amenities": "Plunge pool, Living room, Dining room, Full kitchen, Three bedrooms, Butler service, Concierge, Entertainment system", "bathroom_features": "Three luxury bathrooms, Jacuzzi, Walk-in showers, Designer amenities", "accessibility_features": "Available on request", "max_occupancy": 8, "extra_bed_available": true, "smoking_allowed": false}'::jsonb);
