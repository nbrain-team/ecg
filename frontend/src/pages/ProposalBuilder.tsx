import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Calendar, MapPin, Users, Hotel, Utensils, Plane, Palette, Send } from 'lucide-react';
import axios from 'axios';
import './ProposalBuilder.css';

interface FormData {
  // Step 1: Client Info
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  
  // Step 2: Event Basics
  eventName: string;
  eventPurpose: 'corporate' | 'incentive' | 'conference' | 'retreat' | '';
  startDate: string;
  endDate: string;
  attendeeCount: number;
  roomsNeeded: number;
  ratingStandard: 'forbes' | 'aaa';
  hotelRating: '5-star' | '4-star' | '';
  roomPreferences: {
    kingRooms: number;
    doubleRooms: number;
    suitesNotes: string;
  };
  
  // Step 3-8: IDs for selections
  destinationId: string;
  resortId: string;
  roomTypeIds: string[];
  eventSpaceIds: string[];
  diningIds: string[];
  flightRouteIds: string[];
  
  // Step 6: Event Space Details
  spaceSetups: {
    banquet: boolean;
    theater: boolean;
    halfCrescent: boolean;
    reception: boolean;
  };
  stageSize: string;
  
  // Step 9: Program Inclusions
  programInclusions: {
    airportTransfers: boolean;
    welcomeReception: boolean;
    businessMeeting: boolean;
    awardDinner: boolean;
    activityOptions: boolean;
    offSiteVenues: boolean;
    offSiteRestaurants: boolean;
    dineArounds: boolean;
    finalNightDinner: boolean;
    teamBuilding: boolean;
    danceBand: boolean;
    decorIdeas: boolean;
    csrOptions: boolean;
    giftingIdeas: boolean;
  };
  
  // Step 10: Branding
  primaryColor: string;
  secondaryColor: string;
  theme: 'modern' | 'classic' | 'vibrant' | 'minimal';
  logoUrl?: string;
}

const STEPS = [
  { number: 1, title: 'Client Information', icon: Users },
  { number: 2, title: 'Event Details', icon: Calendar },
  { number: 3, title: 'Destination', icon: MapPin },
  { number: 4, title: 'Resort', icon: Hotel },
  { number: 5, title: 'Room Types', icon: Hotel },
  { number: 6, title: 'Event Spaces', icon: Users },
  { number: 7, title: 'Dining Options', icon: Utensils },
  { number: 8, title: 'Travel & Flights', icon: Plane },
  { number: 9, title: 'Program Inclusions', icon: Check },
  { number: 10, title: 'Branding & Review', icon: Palette }
];

function ProposalBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Mock data states
  const [destinations, setDestinations] = useState<any[]>([]);
  const [resorts, setResorts] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [eventSpaces, setEventSpaces] = useState<any[]>([]);
  const [diningOptions, setDiningOptions] = useState<any[]>([]);
  const [flightRoutes, setFlightRoutes] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    eventName: '',
    eventPurpose: '',
    startDate: '',
    endDate: '',
    attendeeCount: 50,
    roomsNeeded: 25,
    ratingStandard: 'forbes',
    hotelRating: '',
    roomPreferences: {
      kingRooms: 0,
      doubleRooms: 0,
      suitesNotes: ''
    },
    destinationId: '',
    resortId: '',
    roomTypeIds: [],
    eventSpaceIds: [],
    diningIds: [],
    flightRouteIds: [],
    spaceSetups: {
      banquet: false,
      theater: false,
      halfCrescent: false,
      reception: false
    },
    stageSize: '',
    programInclusions: {
      airportTransfers: false,
      welcomeReception: false,
      businessMeeting: false,
      awardDinner: false,
      activityOptions: false,
      offSiteVenues: false,
      offSiteRestaurants: false,
      dineArounds: false,
      finalNightDinner: false,
      teamBuilding: false,
      danceBand: false,
      decorIdeas: false,
      csrOptions: false,
      giftingIdeas: false
    },
    primaryColor: '#1e40af',
    secondaryColor: '#06b6d4',
    theme: 'modern',
    logoUrl: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x250?text=Image+Not+Available';
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (formData.destinationId) {
      fetchResortsForDestination(formData.destinationId);
      fetchFlightsForDestination(formData.destinationId);
    }
  }, [formData.destinationId]);

  useEffect(() => {
    if (formData.resortId) {
      fetchResortDetails(formData.resortId);
    }
  }, [formData.resortId]);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/destinations`);
      setDestinations(response.data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    }
  };

  const fetchResortsForDestination = async (destinationId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/api/destinations/${destinationId}/resorts`);
      setResorts(response.data);
    } catch (err) {
      console.error('Error fetching resorts:', err);
    }
  };

  const fetchFlightsForDestination = async (destinationId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/api/destinations/${destinationId}/flights`);
      setFlightRoutes(response.data);
    } catch (err) {
      console.error('Error fetching flights:', err);
    }
  };

  const fetchResortDetails = async (resortId: string) => {
    try {
      const [roomsRes, spacesRes, diningRes] = await Promise.all([
        axios.get(`${apiUrl}/api/destinations/resorts/${resortId}/rooms`),
        axios.get(`${apiUrl}/api/destinations/resorts/${resortId}/spaces`),
        axios.get(`${apiUrl}/api/destinations/resorts/${resortId}/dining`)
      ]);
      
      setRoomTypes(roomsRes.data);
      setEventSpaces(spacesRes.data);
      setDiningOptions(diningRes.data);
    } catch (err) {
      console.error('Error fetching resort details:', err);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const calculateProgramLengthDays = (): number | null => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = end.getTime() - start.getTime();
    if (isNaN(diff) || diff < 0) return null;
    const days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };


  const toggleArrayItem = (field: string, itemId: string) => {
    setFormData(prev => {
      const array = prev[field as keyof FormData] as string[];
      const newArray = array.includes(itemId)
        ? array.filter(id => id !== itemId)
        : [...array, itemId];
      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Prepare proposal data
      const selectedDestination = destinations.find(d => d.id === formData.destinationId);
      const selectedResort = resorts.find(r => r.id === formData.resortId);
      const selectedRooms = roomTypes.filter(r => formData.roomTypeIds.includes(r.id));
      const selectedSpaces = eventSpaces.filter(s => formData.eventSpaceIds.includes(s.id));
      const selectedDining = diningOptions.filter(d => formData.diningIds.includes(d.id));
      const selectedFlights = flightRoutes.filter(f => formData.flightRouteIds.includes(f.id));

      const proposalData = {
        client: {
          name: formData.clientName,
          company: formData.clientCompany,
          email: formData.clientEmail,
          phone: formData.clientPhone
        },
        eventDetails: {
          name: formData.eventName,
          purpose: formData.eventPurpose,
          startDate: formData.startDate,
          endDate: formData.endDate,
          attendeeCount: formData.attendeeCount,
          roomsNeeded: formData.roomsNeeded,
          hotelRating: formData.hotelRating,
          ratingStandard: formData.ratingStandard,
          programLengthDays: calculateProgramLengthDays() || undefined,
          roomPreferences: formData.roomPreferences
        },
        destination: selectedDestination,
        resort: selectedResort,
        selectedRooms,
        selectedSpaces,
        selectedDining,
        flightRoutes: selectedFlights,
        spaceSetups: formData.spaceSetups,
        stageSize: formData.stageSize,
        programInclusions: formData.programInclusions,
        branding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          theme: formData.theme,
          logoUrl: formData.logoUrl
        }
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/proposals`,
        proposalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to the created proposal
      navigate(`/proposal/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Client Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Contact Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.clientName}
                  onChange={(e) => updateFormData('clientName', e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.clientCompany}
                  onChange={(e) => updateFormData('clientCompany', e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.clientEmail}
                  onChange={(e) => updateFormData('clientEmail', e.target.value)}
                  placeholder="john@acme.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.clientPhone}
                  onChange={(e) => updateFormData('clientPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Event Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.eventName}
                  onChange={(e) => updateFormData('eventName', e.target.value)}
                  placeholder="2024 Annual Sales Conference"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Purpose *</label>
                <select
                  className="form-control"
                  value={formData.eventPurpose}
                  onChange={(e) => updateFormData('eventPurpose', e.target.value)}
                  required
                >
                  <option value="">Select purpose</option>
                  <option value="corporate">Corporate Meeting</option>
                  <option value="incentive">Incentive Trip</option>
                  <option value="conference">Conference</option>
                  <option value="retreat">Team Retreat</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  min={formData.startDate}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Program Length</label>
                <input
                  type="text"
                  className="form-control"
                  value={calculateProgramLengthDays() ? `${calculateProgramLengthDays()} days` : ''}
                  readOnly
                  placeholder="Calculated from dates"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Attendees *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.attendeeCount}
                  onChange={(e) => updateFormData('attendeeCount', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Rooms Needed *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.roomsNeeded}
                  onChange={(e) => updateFormData('roomsNeeded', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hotel Rating Standard *</label>
                <select
                  className="form-control"
                  value={formData.ratingStandard}
                  onChange={(e) => updateFormData('ratingStandard', e.target.value)}
                  required
                >
                  <option value="forbes">Forbes Stars</option>
                  <option value="aaa">AAA Diamonds</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Hotel Rating Preference *</label>
                <select
                  className="form-control"
                  value={formData.hotelRating}
                  onChange={(e) => updateFormData('hotelRating', e.target.value)}
                  required
                >
                  <option value="">Select rating</option>
                  <option value="5-star">{formData.ratingStandard === 'aaa' ? '5 Diamonds' : '5 Stars'}</option>
                  <option value="4-star">{formData.ratingStandard === 'aaa' ? '4 Diamonds' : '4 Stars'}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred King Rooms</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.roomPreferences.kingRooms}
                  onChange={(e) => updateFormData('roomPreferences', { ...formData.roomPreferences, kingRooms: parseInt(e.target.value || '0') })}
                  min="0"
                  placeholder="e.g., 15"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Double/Queen Rooms</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.roomPreferences.doubleRooms}
                  onChange={(e) => updateFormData('roomPreferences', { ...formData.roomPreferences, doubleRooms: parseInt(e.target.value || '0') })}
                  min="0"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Select Destination</h2>
            <div className="selection-grid">
              {destinations.map(dest => (
                <div
                  key={dest.id}
                  className={`selection-card ${formData.destinationId === dest.id ? 'selected' : ''}`}
                  onClick={() => updateFormData('destinationId', dest.id)}
                >
                  <img 
                    src={dest.imageUrl} 
                    alt={dest.name}
                    onError={handleImageError}
                  />
                  <div className="card-content">
                    <h3>{dest.name}</h3>
                    <p className="country">{dest.country}</p>
                    <p className="description">{dest.description}</p>
                    <div className="highlights">
                      {dest.highlights.slice(0, 3).map((h: string, i: number) => (
                        <span key={i} className="highlight-tag">{h}</span>
                      ))}
                    </div>
                  </div>
                  {formData.destinationId === dest.id && (
                    <div className="selected-badge"><Check size={20} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Choose Resort</h2>
            <div className="selection-grid">
              {resorts.map(resort => (
                <div
                  key={resort.id}
                  className={`selection-card resort-card ${formData.resortId === resort.id ? 'selected' : ''}`}
                  onClick={() => updateFormData('resortId', resort.id)}
                >
                  <img 
                    src={resort.images[0]} 
                    alt={resort.name}
                    onError={handleImageError}
                  />
                  <div className="card-content">
                    <h3>{resort.name}</h3>
                    <div className="resort-rating">
                      <span className="price-range">{resort.priceRange}</span>
                      {resort.vendorRating && (
                        <div className="vendor-rating">
                          <span className="rating-score">⭐ {resort.vendorRating.overall}</span>
                          <span className="rating-reviews">({resort.vendorRating.reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                    <p className="description">{resort.description}</p>
                    
                    {resort.beachInfo && (
                      <div className="resort-detail">
                        <strong>🏖️ Beach:</strong> {resort.beachInfo.type} • {resort.beachInfo.size}
                      </div>
                    )}
                    
                    {resort.restaurantCount && (
                      <div className="resort-detail">
                        <strong>🍽️ Restaurants:</strong> {resort.restaurantCount} on-site dining options
                      </div>
                    )}
                    
                    {resort.spaInfo && (
                      <div className="resort-detail">
                        <strong>💆 Spa:</strong> {resort.spaInfo.name} • {resort.spaInfo.size}
                      </div>
                    )}
                    
                    <div className="amenities">
                      {resort.amenities.slice(0, 3).map((a: string, i: number) => (
                        <span key={i} className="amenity-tag">{a}</span>
                      ))}
                    </div>
                    
                    {resort.vendorRating && (
                      <div className="rating-breakdown">
                        <div className="rating-item">
                          <span>Service</span>
                          <span>{resort.vendorRating.service}</span>
                        </div>
                        <div className="rating-item">
                          <span>Facilities</span>
                          <span>{resort.vendorRating.facilities}</span>
                        </div>
                        <div className="rating-item">
                          <span>Events</span>
                          <span>{resort.vendorRating.eventExecution}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.resortId === resort.id && (
                    <div className="selected-badge"><Check size={20} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>Select Room Types</h2>
            <div className="selection-grid">
              {roomTypes.map(room => (
                <div
                  key={room.id}
                  className={`selection-card ${formData.roomTypeIds.includes(room.id) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('roomTypeIds', room.id)}
                >
                  <img 
                    src={room.images[0]} 
                    alt={room.name}
                    onError={handleImageError}
                  />
                  <div className="card-content">
                    <h3>{room.name}</h3>
                    <p className="room-info">{room.size} • {room.view} View</p>
                    <p className="description">{room.description}</p>
                    <p className="capacity">Sleeps {room.capacity}</p>
                  </div>
                  {formData.roomTypeIds.includes(room.id) && (
                    <div className="selected-badge"><Check size={20} /></div>
                  )}
                </div>
              ))}
            </div>
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group full-width">
                <label className="form-label">Suite Preferences / Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.roomPreferences.suitesNotes}
                  onChange={(e) => updateFormData('roomPreferences', { ...formData.roomPreferences, suitesNotes: e.target.value })}
                  placeholder="Describe suite types or special requirements"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h2>Event Spaces & Setup</h2>
            
            <div className="setup-configuration">
              <h3>Space Setup Requirements</h3>
              <div className="setup-grid">
                <div className="setup-option">
                  <input
                    type="checkbox"
                    id="banquet"
                    checked={formData.spaceSetups.banquet}
                    onChange={() => updateFormData('spaceSetups', {
                      ...formData.spaceSetups,
                      banquet: !formData.spaceSetups.banquet
                    })}
                  />
                  <label htmlFor="banquet">
                    <span className="setup-icon">🍽️</span>
                    Banquet Rounds
                  </label>
                </div>
                <div className="setup-option">
                  <input
                    type="checkbox"
                    id="theater"
                    checked={formData.spaceSetups.theater}
                    onChange={() => updateFormData('spaceSetups', {
                      ...formData.spaceSetups,
                      theater: !formData.spaceSetups.theater
                    })}
                  />
                  <label htmlFor="theater">
                    <span className="setup-icon">🎭</span>
                    Theater Seating
                  </label>
                </div>
                <div className="setup-option">
                  <input
                    type="checkbox"
                    id="halfCrescent"
                    checked={formData.spaceSetups.halfCrescent}
                    onChange={() => updateFormData('spaceSetups', {
                      ...formData.spaceSetups,
                      halfCrescent: !formData.spaceSetups.halfCrescent
                    })}
                  />
                  <label htmlFor="halfCrescent">
                    <span className="setup-icon">🌙</span>
                    Half Crescent
                  </label>
                </div>
                <div className="setup-option">
                  <input
                    type="checkbox"
                    id="reception"
                    checked={formData.spaceSetups.reception}
                    onChange={() => updateFormData('spaceSetups', {
                      ...formData.spaceSetups,
                      reception: !formData.spaceSetups.reception
                    })}
                  />
                  <label htmlFor="reception">
                    <span className="setup-icon">🥂</span>
                    Reception Style
                  </label>
                </div>
              </div>
              
              <div className="stage-requirements">
                <label className="form-label">Stage Size Requirements</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.stageSize}
                  onChange={(e) => updateFormData('stageSize', e.target.value)}
                  placeholder="e.g., 20x16 feet, center stage with AV screens"
                />
              </div>
              <div className="mt-2">
                <button className="btn btn-outline" disabled title="Layout visual tool coming soon">
                  Generate Layout Visual
                </button>
              </div>
            </div>

            <h3>Select Event Spaces</h3>
            <div className="selection-grid">
              {eventSpaces.map(space => (
                <div
                  key={space.id}
                  className={`selection-card ${formData.eventSpaceIds.includes(space.id) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('eventSpaceIds', space.id)}
                >
                  <img 
                    src={space.imageUrl} 
                    alt={space.name}
                    onError={handleImageError}
                  />
                  <div className="card-content">
                    <h3>{space.name}</h3>
                    <p className="capacity">Capacity: {space.capacity} guests</p>
                    <p className="size">{space.sqft} sq ft</p>
                    <div className="features">
                      {space.features.slice(0, 2).map((f: string, i: number) => (
                        <span key={i} className="feature-tag">{f}</span>
                      ))}
                    </div>
                    <div className="layout-types">
                      {space.layoutTypes?.map((layout: string, i: number) => (
                        <span key={i} className="layout-tag">{layout}</span>
                      ))}
                    </div>
                  </div>
                  {formData.eventSpaceIds.includes(space.id) && (
                    <div className="selected-badge"><Check size={20} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content">
            <h2>Dining Options</h2>
            <div className="selection-grid">
              {diningOptions.map(dining => (
                <div
                  key={dining.id}
                  className={`selection-card ${formData.diningIds.includes(dining.id) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('diningIds', dining.id)}
                >
                  <img 
                    src={dining.imageUrl} 
                    alt={dining.name}
                    onError={handleImageError}
                  />
                  <div className="card-content">
                    <h3>{dining.name}</h3>
                    <p className="cuisine">{dining.cuisine} Cuisine</p>
                    <p className="description">{dining.description}</p>
                    <p className="hours">{dining.hours}</p>
                  </div>
                  {formData.diningIds.includes(dining.id) && (
                    <div className="selected-badge"><Check size={20} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="step-content">
            <h2>Flight Routes</h2>
            <div className="selection-list">
              {flightRoutes.map(flight => (
                <div
                  key={flight.id}
                  className={`flight-item ${formData.flightRouteIds.includes(flight.id) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('flightRouteIds', flight.id)}
                >
                  <div className="flight-info">
                    <h4>{flight.originCity} → {destinations.find(d => d.id === formData.destinationId)?.name}</h4>
                    <p>{flight.airline} • {flight.duration} • {flight.frequency}</p>
                  </div>
                  <div className="flight-badge">
                    {flight.directFlight ? 'Direct' : 'Connecting'}
                  </div>
                  {formData.flightRouteIds.includes(flight.id) && (
                    <Check size={20} className="check-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="step-content">
            <h2>Program Inclusions</h2>
            <div className="inclusion-grid">
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="airportTransfers"
                  checked={formData.programInclusions.airportTransfers}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, airportTransfers: !formData.programInclusions.airportTransfers })}
                />
                <label htmlFor="airportTransfers">Airport Transfers</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="welcomeReception"
                  checked={formData.programInclusions.welcomeReception}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, welcomeReception: !formData.programInclusions.welcomeReception })}
                />
                <label htmlFor="welcomeReception">Welcome Reception</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="businessMeeting"
                  checked={formData.programInclusions.businessMeeting}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, businessMeeting: !formData.programInclusions.businessMeeting })}
                />
                <label htmlFor="businessMeeting">Business Meeting</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="awardDinner"
                  checked={formData.programInclusions.awardDinner}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, awardDinner: !formData.programInclusions.awardDinner })}
                />
                <label htmlFor="awardDinner">Award Dinner</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="activityOptions"
                  checked={formData.programInclusions.activityOptions}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, activityOptions: !formData.programInclusions.activityOptions })}
                />
                <label htmlFor="activityOptions">Activity Options</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="offSiteVenues"
                  checked={formData.programInclusions.offSiteVenues}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, offSiteVenues: !formData.programInclusions.offSiteVenues })}
                />
                <label htmlFor="offSiteVenues">Off-Site Venues</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="offSiteRestaurants"
                  checked={formData.programInclusions.offSiteRestaurants}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, offSiteRestaurants: !formData.programInclusions.offSiteRestaurants })}
                />
                <label htmlFor="offSiteRestaurants">Off-Site Restaurants</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="dineArounds"
                  checked={formData.programInclusions.dineArounds}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, dineArounds: !formData.programInclusions.dineArounds })}
                />
                <label htmlFor="dineArounds">Dine Arounds</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="finalNightDinner"
                  checked={formData.programInclusions.finalNightDinner}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, finalNightDinner: !formData.programInclusions.finalNightDinner })}
                />
                <label htmlFor="finalNightDinner">Final Night Dinner</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="teamBuilding"
                  checked={formData.programInclusions.teamBuilding}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, teamBuilding: !formData.programInclusions.teamBuilding })}
                />
                <label htmlFor="teamBuilding">Team Building</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="danceBand"
                  checked={formData.programInclusions.danceBand}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, danceBand: !formData.programInclusions.danceBand })}
                />
                <label htmlFor="danceBand">Dance Band</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="decorIdeas"
                  checked={formData.programInclusions.decorIdeas}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, decorIdeas: !formData.programInclusions.decorIdeas })}
                />
                <label htmlFor="decorIdeas">Decor Ideas</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="csrOptions"
                  checked={formData.programInclusions.csrOptions}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, csrOptions: !formData.programInclusions.csrOptions })}
                />
                <label htmlFor="csrOptions">Corporate Social Responsibility</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="giftingIdeas"
                  checked={formData.programInclusions.giftingIdeas}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, giftingIdeas: !formData.programInclusions.giftingIdeas })}
                />
                <label htmlFor="giftingIdeas">Gifting Ideas</label>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="step-content">
            <h2>Branding & Review</h2>
            <div className="branding-section">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <input
                    type="color"
                    className="color-input"
                    value={formData.primaryColor}
                    onChange={(e) => updateFormData('primaryColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary Color</label>
                  <input
                    type="color"
                    className="color-input"
                    value={formData.secondaryColor}
                    onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select
                    className="form-control"
                    value={formData.theme}
                    onChange={(e) => updateFormData('theme', e.target.value)}
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Client Logo URL (optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.logoUrl || ''}
                    onChange={(e) => updateFormData('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.logoUrl && (
                    <div className="logo-preview">
                      <img src={formData.logoUrl} alt="Client Logo" onError={handleImageError} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="review-section">
                <h3>Review Your Selections</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <strong>Client:</strong> {formData.clientCompany}
                  </div>
                  <div className="review-item">
                    <strong>Event:</strong> {formData.eventName}
                  </div>
                  <div className="review-item">
                    <strong>Dates:</strong> {formData.startDate} to {formData.endDate}
                  </div>
                  <div className="review-item">
                    <strong>Attendees:</strong> {formData.attendeeCount}
                  </div>
                  <div className="review-item">
                    <strong>Rooms:</strong> {formData.roomsNeeded}
                  </div>
                  <div className="review-item">
                    <strong>Hotel Rating:</strong> {formData.hotelRating || 'Not specified'}
                  </div>
                  <div className="review-item">
                    <strong>Destination:</strong> {destinations.find(d => d.id === formData.destinationId)?.name}
                  </div>
                  <div className="review-item">
                    <strong>Resort:</strong> {resorts.find(r => r.id === formData.resortId)?.name}
                  </div>
                  <div className="review-item full-width">
                    <strong>Program Inclusions:</strong>
                    <div className="inclusion-summary">
                      {Object.entries(formData.programInclusions)
                        .filter(([_, value]) => value)
                        .map(([key, _]) => (
                          <span key={key} className="inclusion-tag">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="proposal-builder">
      <div className="builder-header">
        <div className="container">
          <h1>Create New Proposal</h1>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="builder-progress">
        <div className="container">
          <div className="progress-steps">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className={`progress-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              >
                <div className="step-circle">
                  {currentStep > step.number ? <Check size={16} /> : step.number}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="builder-content">
        <div className="container">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          {renderStepContent()}
          
          <div className="builder-actions">
            <button
              className="btn btn-outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            
            {currentStep < STEPS.length ? (
              <button
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Proposal'}
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProposalBuilder; 