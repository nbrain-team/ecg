import { 
  Destination, 
  Resort, 
  RoomType, 
  EventSpace, 
  DiningOption, 
  FlightRoute 
} from '../types';

// Mock Destinations
export const destinations: Destination[] = [
  {
    id: 'dest-1',
    name: 'Los Cabos',
    country: 'Mexico',
    description: 'Where desert meets sea in spectacular fashion',
    currency: 'MXN',
    timezone: 'MST',
    climate: 'Desert/Tropical',
    highlights: [
      'World-class golf courses',
      'Pristine beaches',
      'Vibrant nightlife',
      'Water sports paradise',
      'Luxury shopping'
    ],
    weatherInfo: {
      avgTemp: 78,
      rainyMonths: ['August', 'September'],
      bestMonths: ['November', 'December', 'January', 'February', 'March', 'April']
    },
    imageUrl: 'https://images.unsplash.com/photo-1558212628-ad3c3ff77558?auto=format&fit=crop&w=1200&q=80',
    flightInfo: {
      majorAirports: ['SJD - Los Cabos International'],
      avgFlightTime: '2.5 hours from major US cities'
    }
  },
  {
    id: 'dest-2',
    name: 'Maui',
    country: 'USA',
    description: 'The Valley Isle - Paradise found',
    currency: 'USD',
    timezone: 'HST',
    climate: 'Tropical',
    highlights: [
      'Road to Hana adventure',
      'Haleakala National Park',
      'Snorkeling at Molokini',
      'Whale watching',
      'Farm-to-table dining'
    ],
    weatherInfo: {
      avgTemp: 81,
      rainyMonths: ['November', 'December', 'January'],
      bestMonths: ['April', 'May', 'June', 'September', 'October']
    },
    imageUrl: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80',
    flightInfo: {
      majorAirports: ['OGG - Kahului Airport'],
      avgFlightTime: '5.5 hours from West Coast'
    }
  },
  {
    id: 'dest-3',
    name: 'Nassau',
    country: 'Bahamas',
    description: 'Caribbean charm with British colonial heritage',
    currency: 'BSD',
    timezone: 'EST',
    climate: 'Tropical',
    highlights: [
      'Crystal clear waters',
      'World-famous Atlantis Resort',
      'Swimming with dolphins',
      'Historic downtown',
      'Paradise Island'
    ],
    weatherInfo: {
      avgTemp: 82,
      rainyMonths: ['June', 'July', 'August', 'September'],
      bestMonths: ['December', 'January', 'February', 'March', 'April']
    },
    imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80',
    flightInfo: {
      majorAirports: ['NAS - Lynden Pindling International'],
      avgFlightTime: '3 hours from East Coast'
    }
  }
];

// Mock Resorts
export const resorts: Resort[] = [
  // Los Cabos Resorts
  {
    id: 'resort-1',
    destinationId: 'dest-1',
    name: 'Waldorf Astoria Los Cabos Pedregal',
    description: 'Carved into the mountain with unparalleled Pacific views',
    amenities: ['Spa', 'Golf', 'Beach Club', 'Fitness Center', 'Kids Club'],
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      '24-hour concierge',
      'Private beach access',
      'Infinity pools',
      'World-class spa',
      'Championship golf'
    ],
    priceRange: '$$$$'
  },
  {
    id: 'resort-2',
    destinationId: 'dest-1',
    name: 'Four Seasons Resort Los Cabos',
    description: 'Contemporary luxury on the Sea of Cortez',
    amenities: ['Multiple Pools', 'Golf', 'Water Sports', 'Spa', 'Tennis'],
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      'Swimmable beach',
      'Championship golf course',
      'Kids for All Seasons program',
      'Sea safari adventures',
      'Tequila tasting room'
    ],
    priceRange: '$$$$'
  },
  // Maui Resorts
  {
    id: 'resort-3',
    destinationId: 'dest-2',
    name: 'Grand Wailea Maui',
    description: 'Hawaiian luxury on 40 oceanfront acres',
    amenities: ['Spa', 'Golf', 'Water Park', 'Cultural Center', 'Fitness'],
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200'
    ],
    features: [
      '9 pools including adults-only',
      'Lazy river and water slides',
      '50,000 sq ft spa',
      'Art collection tours',
      'Championship golf nearby'
    ],
    priceRange: '$$$'
  },
  {
    id: 'resort-4',
    destinationId: 'dest-2',
    name: 'Four Seasons Resort Maui',
    description: 'Sophisticated beachfront paradise in Wailea',
    amenities: ['Beach', 'Spa', 'Tennis', 'Snorkeling', 'Fine Dining'],
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200'
    ],
    features: [
      'Adults-only serenity pool',
      'Outrigger canoe experiences',
      'Complimentary kids club',
      'Celebrity chef restaurants',
      'Sunset cocktail rituals'
    ],
    priceRange: '$$$$'
  },
  // Nassau Resorts
  {
    id: 'resort-5',
    destinationId: 'dest-3',
    name: 'The Ocean Club, A Four Seasons Resort',
    description: 'Legendary elegance on Paradise Island',
    amenities: ['Golf', 'Spa', 'Beach', 'Tennis', 'Gardens'],
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200'
    ],
    features: [
      'Versailles-inspired gardens',
      'Championship golf course',
      'Private beach club',
      'Adults-only pool',
      'Michelin-starred dining'
    ],
    priceRange: '$$$$'
  },
  {
    id: 'resort-6',
    destinationId: 'dest-3',
    name: 'Atlantis Paradise Island',
    description: 'Iconic resort with endless entertainment',
    amenities: ['Water Park', 'Casino', 'Marina', 'Aquarium', 'Beach'],
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200',
      'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=1200'
    ],
    features: [
      '141-acre water park',
      'Marine habitat',
      '11 swimming pools',
      'Dolphin encounters',
      '21 restaurants'
    ],
    priceRange: '$$$'
  }
];

// Mock Room Types
export const roomTypes: RoomType[] = [
  // Waldorf Astoria Los Cabos rooms
  {
    id: 'room-1',
    resortId: 'resort-1',
    name: 'Ocean View Suite',
    description: 'Elegant suite with panoramic Pacific views',
    capacity: 2,
    amenities: ['Private plunge pool', 'Outdoor shower', 'Soaking tub', 'Premium bar'],
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200'],
    size: '1,200 sq ft',
    view: 'Ocean'
  },
  {
    id: 'room-2',
    resortId: 'resort-1',
    name: 'Casita Suite',
    description: 'Spacious casita with private terrace',
    capacity: 4,
    amenities: ['Kitchenette', 'Living area', 'Fire pit', 'Butler service'],
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200'],
    size: '1,800 sq ft',
    view: 'Garden/Mountain'
  },
  // Four Seasons Los Cabos rooms
  {
    id: 'room-3',
    resortId: 'resort-2',
    name: 'Ocean View Room',
    description: 'Contemporary room with Sea of Cortez views',
    capacity: 2,
    amenities: ['Deep soaking tub', 'Rain shower', 'Furnished terrace'],
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200'],
    size: '635 sq ft',
    view: 'Partial Ocean'
  },
  // Grand Wailea rooms
  {
    id: 'room-4',
    resortId: 'resort-3',
    name: 'Napua Tower Ocean View',
    description: 'Exclusive tower room with club access',
    capacity: 2,
    amenities: ['Club lounge access', 'Premium amenities', 'Concierge service'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200'],
    size: '640 sq ft',
    view: 'Ocean'
  },
  // Four Seasons Maui rooms
  {
    id: 'room-5',
    resortId: 'resort-4',
    name: 'Prime Ocean View Suite',
    description: 'Luxurious suite steps from the beach',
    capacity: 3,
    amenities: ['Separate living room', 'Marble bathroom', 'L\'Occitane products'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'],
    size: '950 sq ft',
    view: 'Ocean Front'
  },
  // Ocean Club rooms
  {
    id: 'room-6',
    resortId: 'resort-5',
    name: 'Beachfront Villa',
    description: 'Private villa with direct beach access',
    capacity: 4,
    amenities: ['Full kitchen', 'Private pool', 'Butler service', 'Golf cart'],
    images: ['https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200'],
    size: '2,500 sq ft',
    view: 'Beach'
  }
];

// Mock Event Spaces
export const eventSpaces: EventSpace[] = [
  {
    id: 'space-1',
    resortId: 'resort-1',
    name: 'Pacific Ballroom',
    capacity: 300,
    sqft: 4500,
    layoutTypes: ['theater', 'classroom', 'banquet', 'u-shape'],
    features: ['Ocean views', 'Built-in AV', 'Pre-function space', 'Natural light'],
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'
  },
  {
    id: 'space-2',
    resortId: 'resort-2',
    name: 'Cortez Pavilion',
    capacity: 200,
    sqft: 3000,
    layoutTypes: ['banquet', 'theater', 'classroom'],
    features: ['Outdoor terrace', 'LED lighting', 'Dance floor', 'Bar area'],
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200'
  },
  {
    id: 'space-3',
    resortId: 'resort-3',
    name: 'Grand Ballroom',
    capacity: 500,
    sqft: 7500,
    layoutTypes: ['theater', 'banquet', 'classroom'],
    features: ['Divisible space', 'High ceilings', 'State-of-art AV', 'Green room'],
    imageUrl: 'https://images.unsplash.com/photo-1549675584-91f19337af3d?w=1200'
  }
];

// Mock Dining Options
export const diningOptions: DiningOption[] = [
  // Waldorf Astoria dining
  {
    id: 'dining-1',
    resortId: 'resort-1',
    name: 'El Farallon',
    cuisine: 'Seafood',
    description: 'Cliffside dining with catch of the day',
    hours: '5:30 PM - 10:30 PM',
    dressCode: 'Resort Elegant',
    specialties: ['Lobster', 'Local catch', 'Ceviche', 'Champagne selection'],
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'
  },
  {
    id: 'dining-2',
    resortId: 'resort-1',
    name: 'Don Manuel\'s',
    cuisine: 'Mexican',
    description: 'Authentic Mexican cuisine with Pacific views',
    hours: '7:00 AM - 11:00 PM',
    dressCode: 'Resort Casual',
    specialties: ['Tacos al pastor', 'Mole', 'Tequila flights', 'Guacamole'],
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200'
  },
  // Four Seasons dining
  {
    id: 'dining-3',
    resortId: 'resort-2',
    name: 'Estiatorio Milos',
    cuisine: 'Mediterranean',
    description: 'Greek seafood with Mexican influences',
    hours: '6:00 PM - 10:00 PM',
    dressCode: 'Smart Casual',
    specialties: ['Whole fish', 'Greek salads', 'Fresh oysters', 'Baklava'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200'
  },
  // Grand Wailea dining
  {
    id: 'dining-4',
    resortId: 'resort-3',
    name: 'Humuhumunukunukuapua\'a',
    cuisine: 'Hawaiian',
    description: 'Floating restaurant over a lagoon',
    hours: '5:00 PM - 9:00 PM',
    dressCode: 'Resort Casual',
    specialties: ['Poke', 'Kalua pig', 'Fresh mahi-mahi', 'Tropical cocktails'],
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
  },
  // Four Seasons Maui dining
  {
    id: 'dining-5',
    resortId: 'resort-4',
    name: 'Spago',
    cuisine: 'Contemporary',
    description: 'Wolfgang Puck\'s Hawaiian outpost',
    hours: '5:30 PM - 9:00 PM',
    dressCode: 'Resort Elegant',
    specialties: ['Ahi tuna pizza', 'Local fish', 'Sunset views', 'Wine pairings'],
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200'
  },
  // Ocean Club dining
  {
    id: 'dining-6',
    resortId: 'resort-5',
    name: 'Dune',
    cuisine: 'French-Asian',
    description: 'Jean-Georges Vongerichten beachfront dining',
    hours: '12:00 PM - 10:00 PM',
    dressCode: 'Beach Elegant',
    specialties: ['Tuna tartare', 'Black truffle pizza', 'Lobster', 'Sake selection'],
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'
  }
];

// Mock Flight Routes
export const flightRoutes: FlightRoute[] = [
  // Los Cabos flights
  {
    id: 'flight-1',
    destinationId: 'dest-1',
    originCity: 'Los Angeles',
    airline: 'United Airlines',
    duration: '2h 30m',
    directFlight: true,
    frequency: 'Daily'
  },
  {
    id: 'flight-2',
    destinationId: 'dest-1',
    originCity: 'Dallas',
    airline: 'American Airlines',
    duration: '2h 45m',
    directFlight: true,
    frequency: '3x Daily'
  },
  {
    id: 'flight-3',
    destinationId: 'dest-1',
    originCity: 'New York',
    airline: 'JetBlue',
    duration: '5h 30m',
    directFlight: true,
    frequency: 'Daily'
  },
  // Maui flights
  {
    id: 'flight-4',
    destinationId: 'dest-2',
    originCity: 'San Francisco',
    airline: 'Hawaiian Airlines',
    duration: '5h 20m',
    directFlight: true,
    frequency: '2x Daily'
  },
  {
    id: 'flight-5',
    destinationId: 'dest-2',
    originCity: 'Seattle',
    airline: 'Alaska Airlines',
    duration: '6h',
    directFlight: true,
    frequency: 'Daily'
  },
  // Nassau flights
  {
    id: 'flight-6',
    destinationId: 'dest-3',
    originCity: 'Miami',
    airline: 'American Airlines',
    duration: '1h 15m',
    directFlight: true,
    frequency: '5x Daily'
  },
  {
    id: 'flight-7',
    destinationId: 'dest-3',
    originCity: 'Atlanta',
    airline: 'Delta',
    duration: '2h 30m',
    directFlight: true,
    frequency: '3x Daily'
  },
  {
    id: 'flight-8',
    destinationId: 'dest-3',
    originCity: 'New York',
    airline: 'JetBlue',
    duration: '3h',
    directFlight: true,
    frequency: '2x Daily'
  }
];

// Utility functions
export const getResortsForDestination = (destinationId: string): Resort[] => {
  return resorts.filter(resort => resort.destinationId === destinationId);
};

export const getRoomsForResort = (resortId: string): RoomType[] => {
  return roomTypes.filter(room => room.resortId === resortId);
};

export const getSpacesForResort = (resortId: string): EventSpace[] => {
  return eventSpaces.filter(space => space.resortId === resortId);
};

export const getDiningForResort = (resortId: string): DiningOption[] => {
  return diningOptions.filter(dining => dining.resortId === resortId);
};

export const getFlightsForDestination = (destinationId: string): FlightRoute[] => {
  return flightRoutes.filter(flight => flight.destinationId === destinationId);
};

export const getDestinationById = (id: string): Destination | undefined => {
  return destinations.find(dest => dest.id === id);
};

export const getResortById = (id: string): Resort | undefined => {
  return resorts.find(resort => resort.id === id);
}; 