// Shared types for ECG Intelligence platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  logoUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  currency: string;
  timezone: string;
  climate: string;
  highlights: string[];
  weatherInfo: {
    avgTemp: number;
    rainyMonths: string[];
    bestMonths: string[];
  };
  imageUrl: string;
  flightInfo: {
    majorAirports: string[];
    avgFlightTime: string;
  };
}

export interface Resort {
  id: string;
  destinationId: string;
  name: string;
  description: string;
  amenities: string[];
  rating: number;
  images: string[];
  features: string[];
  priceRange: string;
  vendorRating?: {
    overall: number;
    service: number;
    facilities: number;
    foodQuality: number;
    eventExecution: number;
    reviews: number;
  };
  beachInfo?: {
    type: string;
    size: string;
    waterActivities: string[];
  };
  spaInfo?: {
    name: string;
    treatments: number;
    size: string;
  };
  restaurantCount?: number;
  restaurants?: string[];
}

export interface RoomType {
  id: string;
  resortId: string;
  name: string;
  description: string;
  capacity: number;
  amenities: string[];
  images: string[];
  size: string;
  view: string;
}

export interface EventSpace {
  id: string;
  resortId: string;
  name: string;
  capacity: number;
  sqft: number;
  layoutTypes: ('theater' | 'classroom' | 'banquet' | 'u-shape' | 'boardroom')[];
  features: string[];
  imageUrl: string;
}

export interface DiningOption {
  id: string;
  resortId: string;
  name: string;
  cuisine: string;
  description: string;
  hours: string;
  dressCode: string;
  specialties: string[];
  imageUrl: string;
}

export interface FlightRoute {
  id: string;
  destinationId: string;
  originCity: string;
  airline: string;
  duration: string;
  directFlight: boolean;
  frequency: string;
}

export interface Proposal {
  id: string;
  userId: string;
  client: Client;
  eventDetails: {
    name: string;
    startDate: string;
    endDate: string;
    attendeeCount: number;
    purpose: 'corporate' | 'incentive' | 'conference' | 'retreat';
  };
  destination: Destination;
  resort: Resort;
  selectedRooms: RoomType[];
  selectedSpaces: EventSpace[];
  selectedDining: DiningOption[];
  flightRoutes: FlightRoute[];
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    theme: 'modern' | 'classic' | 'vibrant' | 'minimal';
  };
  generatedContent: {
    heroTitle: string;
    heroSubtitle: string;
    destinationOverview: string;
    resortHighlight: string;
    diningDescription: string;
    travelInfo: string;
  };
  status: 'draft' | 'published' | 'viewed';
  shareableLink?: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  lastViewedAt?: Date;
}

export interface ProposalFormData {
  step: number;
  clientInfo: Partial<Client>;
  eventBasics: Partial<Proposal['eventDetails']>;
  destinationId?: string;
  resortId?: string;
  roomTypeIds: string[];
  eventSpaceIds: string[];
  diningIds: string[];
  flightRouteIds: string[];
  branding: Partial<Proposal['branding']>;
} 