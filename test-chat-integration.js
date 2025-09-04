// Test script to verify hotel data integration for chat
const axios = require('axios');

const API_URL = 'https://eventintel-api.onrender.com';

async function testChatIntegration() {
  try {
    console.log('Testing Chat Integration with Hotel Data...\n');
    
    // Test 1: Check hotel data endpoint
    console.log('1. Testing hotel data endpoint...');
    try {
      const hotelRes = await axios.get(`${API_URL}/api/hotel-integration/hotels`);
      console.log(`✓ Hotels found: ${hotelRes.data.length}`);
      if (hotelRes.data.length > 0) {
        console.log(`  - First hotel: ${hotelRes.data[0].name}`);
      }
    } catch (error) {
      console.log('✗ Hotel endpoint error:', error.response?.data || error.message);
    }
    
    // Test 2: Check rooms data
    console.log('\n2. Testing rooms data...');
    try {
      const roomsRes = await axios.get(`${API_URL}/api/hotel-integration/rooms`);
      console.log(`✓ Rooms found: ${roomsRes.data.length}`);
      if (roomsRes.data.length > 0) {
        console.log(`  Sample rooms:`);
        roomsRes.data.slice(0, 3).forEach(room => {
          console.log(`  - ${room.name}: ${room.capacity} guests, $${room.base_rate}/night`);
        });
      }
    } catch (error) {
      console.log('✗ Rooms endpoint error:', error.response?.data || error.message);
    }
    
    // Test 3: Check venues data
    console.log('\n3. Testing venues data...');
    try {
      const venuesRes = await axios.get(`${API_URL}/api/hotel-integration/venues`);
      console.log(`✓ Venues found: ${venuesRes.data.length}`);
      if (venuesRes.data.length > 0) {
        console.log(`  Sample venues:`);
        venuesRes.data.slice(0, 3).forEach(venue => {
          console.log(`  - ${venue.name}: ${venue.sqft} sqft, Theater: ${venue.capacity_theater}, Banquet: ${venue.capacity_banquet}`);
        });
      }
    } catch (error) {
      console.log('✗ Venues endpoint error:', error.response?.data || error.message);
    }
    
    // Test 4: Check dining data
    console.log('\n4. Testing dining data...');
    try {
      const diningRes = await axios.get(`${API_URL}/api/hotel-integration/dining`);
      console.log(`✓ Dining options found: ${diningRes.data.length}`);
      if (diningRes.data.length > 0) {
        console.log(`  Sample dining:`);
        diningRes.data.slice(0, 3).forEach(dining => {
          console.log(`  - ${dining.name}: ${dining.cuisine || dining.cuisine_type || 'N/A'} cuisine`);
        });
      }
    } catch (error) {
      console.log('✗ Dining endpoint error:', error.response?.data || error.message);
    }
    
    console.log('\n✓ Chat integration test complete!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testChatIntegration();
