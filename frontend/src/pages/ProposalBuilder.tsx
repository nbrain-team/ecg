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
  
  // Step 2: Event Basics - Updated with new fields
  eventType: string;
  eventName: string;
  eventPurpose: 'corporate' | 'incentive' | 'conference' | 'retreat' | '';
  preferredDates: string;
  datesFlexible: boolean;
  flexibleDateRange: string;
  startDate: string;
  endDate: string;
  numberOfNights: number;
  daysPattern: string;
  attendeeCount: number;
  attendeeRooms: number;
  staffRooms: number;
  roomsNeeded: number;
  doubleOccupancy: boolean;
  roomView: 'ocean' | 'run_of_house';
  suiteCount: number;
  privateSatelliteCheckIn: boolean;
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
  
  // Step 9: Program Inclusions - Updated
  welcomeReception: boolean;
  businessSessions: { day: number; description?: string }[];
  awardsDinner: { night: number } | null;
  dineArounds: { nights: number[] };
  otherEvents: { day: number; description: string }[];
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
  const loadDraftKey = 'proposalDraft';
  
  // Load saved step from draft
  const [currentStep, setCurrentStep] = useState(() => {
    const savedDraft = localStorage.getItem(loadDraftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        return parsed.currentStep || 1;
      } catch (e) {
        return 1;
      }
    }
    return 1;
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Mock data states
  const [destinations, setDestinations] = useState<any[]>([]);
  const [resorts, setResorts] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [eventSpaces, setEventSpaces] = useState<any[]>([]);
  const [diningOptions, setDiningOptions] = useState<any[]>([]);
  const [flightRoutes, setFlightRoutes] = useState<any[]>([]);

  // Form data with draft loading
  const [formData, setFormData] = useState<FormData>(() => {
    const savedDraft = localStorage.getItem(loadDraftKey);

    const defaultData: FormData = {
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      eventType: '',
      eventName: '',
      eventPurpose: '',
      preferredDates: '',
      datesFlexible: false,
      flexibleDateRange: '',
      startDate: '',
      endDate: '',
      numberOfNights: 3,
      daysPattern: '',
      attendeeCount: 50,
      attendeeRooms: 25,
      staffRooms: 2,
      roomsNeeded: 27,
      doubleOccupancy: true,
      roomView: 'run_of_house',
      suiteCount: 0,
      privateSatelliteCheckIn: false,
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
      welcomeReception: false,
      businessSessions: [],
      awardsDinner: null,
      dineArounds: { nights: [] },
      otherEvents: [],
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
    };

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        const draftData = (parsed && parsed.formData) ? parsed.formData : {};
        return {
          ...defaultData,
          ...draftData,
          roomPreferences: {
            ...defaultData.roomPreferences,
            ...(draftData.roomPreferences || {})
          },
          spaceSetups: {
            ...defaultData.spaceSetups,
            ...(draftData.spaceSetups || {})
          },
          programInclusions: {
            ...defaultData.programInclusions,
            ...(draftData.programInclusions || {})
          }
        };
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }

    return defaultData;
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Autosave draft to localStorage
  useEffect(() => {
    const draft = {
      formData,
      currentStep,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(loadDraftKey, JSON.stringify(draft));
  }, [formData, currentStep]);

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/400x250?text=Image+Not+Available';
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch both mock resorts and hotel profile resorts
      const [mockResortsRes, hotelResortsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/destinations/${destinationId}/resorts`),
        axios.get(`${apiUrl}/api/hotel-integration/resorts`, { headers }).catch(() => ({ data: [] }))
      ]);
      
      // Combine both sources, with hotel resorts first
      const combinedResorts = [...(hotelResortsRes.data || []), ...(mockResortsRes.data || [])];
      
      // Remove duplicates by name
      const uniqueResorts = combinedResorts.reduce((acc: any[], resort) => {
        if (!acc.find(r => r.name === resort.name)) {
          acc.push(resort);
        }
        return acc;
      }, []);
      
      setResorts(uniqueResorts);
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Check if this is a hotel-based resort
      if (resortId.startsWith('hotel-')) {
        const [roomsRes, spacesRes, diningRes] = await Promise.all([
          axios.get(`${apiUrl}/api/hotel-integration/resorts/${resortId}/rooms`, { headers }),
          axios.get(`${apiUrl}/api/hotel-integration/resorts/${resortId}/spaces`, { headers }),
          axios.get(`${apiUrl}/api/hotel-integration/resorts/${resortId}/dining`, { headers })
        ]);
        
        setRoomTypes(roomsRes.data);
        setEventSpaces(spacesRes.data);
        setDiningOptions(diningRes.data);
      } else {
        // Use regular mock data endpoints
        const [roomsRes, spacesRes, diningRes] = await Promise.all([
          axios.get(`${apiUrl}/api/destinations/resorts/${resortId}/rooms`),
          axios.get(`${apiUrl}/api/destinations/resorts/${resortId}/spaces`),
          axios.get(`${apiUrl}/api/destinations/resorts/${resortId}/dining`)
        ]);
        
        setRoomTypes(roomsRes.data);
        setEventSpaces(spacesRes.data);
        setDiningOptions(diningRes.data);
      }
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

      // Calculate dates if needed
      let startDate = formData.startDate;
      let endDate = formData.endDate;
      
      if (!startDate && formData.preferredDates && formData.numberOfNights) {
        const baseDate = new Date(formData.preferredDates.includes('2025') ? '2025-03-15' : '2025-06-01');
        startDate = baseDate.toISOString().split('T')[0];
        const endDateObj = new Date(baseDate);
        endDateObj.setDate(endDateObj.getDate() + (formData.numberOfNights - 1));
        endDate = endDateObj.toISOString().split('T')[0];
      }

      const proposalData = {
        client: {
          name: formData.clientName,
          company: formData.clientCompany,
          email: formData.clientEmail,
          phone: formData.clientPhone
        },
        eventDetails: {
          name: formData.eventName || `${formData.eventType} - ${formData.clientCompany}`,
          purpose: formData.eventPurpose,
          startDate: startDate,
          endDate: endDate,
          attendeeCount: formData.attendeeCount,
          roomsNeeded: formData.roomsNeeded,
          hotelRating: formData.hotelRating || '5-star',
          ratingStandard: formData.ratingStandard,
          programLengthDays: formData.numberOfNights || calculateProgramLengthDays() || undefined,
          roomPreferences: formData.roomPreferences,
          // New fields
          eventType: formData.eventType,
          preferredDates: formData.preferredDates,
          datesFlexible: formData.datesFlexible,
          flexibleDateRange: formData.flexibleDateRange,
          numberOfNights: formData.numberOfNights,
          daysPattern: formData.daysPattern,
          attendeeRooms: formData.attendeeRooms,
          staffRooms: formData.staffRooms,
          doubleOccupancy: formData.doubleOccupancy,
          roomView: formData.roomView,
          suiteCount: formData.suiteCount,
          privateSatelliteCheckIn: formData.privateSatelliteCheckIn,
          businessSessions: formData.businessSessions,
          awardsDinner: formData.awardsDinner,
          dineArounds: formData.dineArounds,
          otherEvents: formData.otherEvents
        },
        destination: selectedDestination,
        resort: selectedResort,
        selectedRooms,
        selectedSpaces,
        selectedDining,
        flightRoutes: selectedFlights,
        spaceSetups: {
          ...formData.spaceSetups,
          // Update based on events
          theater: formData.businessSessions.length > 0 || formData.spaceSetups.theater,
          banquet: formData.awardsDinner !== null || formData.spaceSetups.banquet,
          reception: formData.welcomeReception || formData.spaceSetups.reception
        },
        stageSize: formData.stageSize,
        programInclusions: {
          ...formData.programInclusions,
          // Sync with event schedule
          welcomeReception: formData.welcomeReception,
          businessMeeting: formData.businessSessions.length > 0,
          awardDinner: formData.awardsDinner !== null,
          dineArounds: formData.dineArounds.nights.length > 0
        },
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

      // Clear the draft after successful submission
      localStorage.removeItem(loadDraftKey);
      
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
                <label className="form-label">Event Type *</label>
                <select
                  className="form-control"
                  value={formData.eventType}
                  onChange={(e) => {
                    updateFormData('eventType', e.target.value);
                    // Map event type to purpose
                    const purposeMap: any = {
                      'Corporate Meeting': 'corporate',
                      'Incentive Trip': 'incentive',
                      'Conference': 'conference',
                      'Company Retreat': 'retreat',
                      'Sales Meeting': 'corporate',
                      'Board Meeting': 'corporate'
                    };
                    updateFormData('eventPurpose', purposeMap[e.target.value] || 'corporate');
                  }}
                  required
                >
                  <option value="">Select event type</option>
                  <option value="Corporate Meeting">Corporate Meeting</option>
                  <option value="Incentive Trip">Incentive Trip</option>
                  <option value="Conference">Conference</option>
                  <option value="Company Retreat">Company Retreat</option>
                  <option value="Sales Meeting">Sales Meeting</option>
                  <option value="Board Meeting">Board Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Dates *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.preferredDates}
                  onChange={(e) => updateFormData('preferredDates', e.target.value)}
                  placeholder="e.g., March 2025 or Q2 2025"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Are dates flexible? *</label>
                <select
                  className="form-control"
                  value={formData.datesFlexible ? 'yes' : 'no'}
                  onChange={(e) => updateFormData('datesFlexible', e.target.value === 'yes')}
                  required
                >
                  <option value="no">No, fixed dates</option>
                  <option value="yes">Yes, flexible</option>
                </select>
              </div>
              {formData.datesFlexible && (
                <div className="form-group">
                  <label className="form-label">Date Range (if flexible)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.flexibleDateRange}
                    onChange={(e) => updateFormData('flexibleDateRange', e.target.value)}
                    placeholder="e.g., March 15 - April 30, 2025"
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Number of Nights *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.numberOfNights}
                  onChange={(e) => updateFormData('numberOfNights', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Days Pattern *</label>
                <select
                  className="form-control"
                  value={formData.daysPattern}
                  onChange={(e) => updateFormData('daysPattern', e.target.value)}
                  required
                >
                  <option value="">Select pattern</option>
                  <option value="Monday-Friday">Monday-Friday</option>
                  <option value="Sunday-Thursday">Sunday-Thursday</option>
                  <option value="Tuesday-Saturday">Tuesday-Saturday</option>
                  <option value="No preference">No preference</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Attendees *</label>
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
                <label className="form-label">Attendee Rooms *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.attendeeRooms}
                  onChange={(e) => {
                    const attendeeRooms = parseInt(e.target.value);
                    updateFormData('attendeeRooms', attendeeRooms);
                    updateFormData('roomsNeeded', attendeeRooms + formData.staffRooms);
                  }}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Staff Rooms *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.staffRooms}
                  onChange={(e) => {
                    const staffRooms = parseInt(e.target.value);
                    updateFormData('staffRooms', staffRooms);
                    updateFormData('roomsNeeded', formData.attendeeRooms + staffRooms);
                  }}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Rooms</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.roomsNeeded}
                  readOnly
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Double Occupancy? *</label>
                <select
                  className="form-control"
                  value={formData.doubleOccupancy ? 'yes' : 'no'}
                  onChange={(e) => updateFormData('doubleOccupancy', e.target.value === 'yes')}
                  required
                >
                  <option value="yes">Yes, majority double occupancy</option>
                  <option value="no">No, mostly single occupancy</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room View Preference *</label>
                <select
                  className="form-control"
                  value={formData.roomView}
                  onChange={(e) => updateFormData('roomView', e.target.value)}
                  required
                >
                  <option value="run_of_house">Run of house</option>
                  <option value="ocean">All ocean view</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Suites *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.suiteCount}
                  onChange={(e) => updateFormData('suiteCount', parseInt(e.target.value))}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Private Satellite Check-in? *</label>
                <select
                  className="form-control"
                  value={formData.privateSatelliteCheckIn ? 'yes' : 'no'}
                  onChange={(e) => updateFormData('privateSatelliteCheckIn', e.target.value === 'yes')}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes, private check-in</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hotel Rating Standard</label>
                <select
                  className="form-control"
                  value={formData.ratingStandard}
                  onChange={(e) => updateFormData('ratingStandard', e.target.value)}
                >
                  <option value="forbes">Forbes Stars</option>
                  <option value="aaa">AAA Diamonds</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hotel Rating Preference</label>
                <select
                  className="form-control"
                  value={formData.hotelRating}
                  onChange={(e) => updateFormData('hotelRating', e.target.value)}
                >
                  <option value="">Select rating</option>
                  <option value="5-star">{formData.ratingStandard === 'aaa' ? '5 Diamonds' : '5 Stars'}</option>
                  <option value="4-star">{formData.ratingStandard === 'aaa' ? '4 Diamonds' : '4 Stars'}</option>
                </select>
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
            <h2>Travel Planning</h2>
            <div className="flight-planner">
              <h3>Add Flight Origins</h3>
              <p>Where will your attendees be flying from?</p>
              
              <div className="flight-inputs">
                <div className="form-group">
                  <label>Origin City</label>
                  <input
                    type="text"
                    placeholder="e.g., New York, Los Angeles, Chicago"
                    className="form-control"
                    id="flight-origin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Number of Travelers</label>
                  <input
                    type="number"
                    placeholder="How many from this location?"
                    className="form-control"
                    id="flight-travelers-input"
                    min="1"
                  />
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    const originInput = document.getElementById('flight-origin-input') as HTMLInputElement;
                    const travelersInput = document.getElementById('flight-travelers-input') as HTMLInputElement;
                    const origin = originInput?.value || '';
                    const travelers = parseInt(travelersInput?.value || '1');
                    
                    if (origin) {
                      const newRoute = {
                        id: `custom-${Date.now()}`,
                        originCity: origin,
                        travelers: travelers,
                        destinationId: formData.destinationId,
                        airline: 'Various',
                        duration: 'TBD',
                        directFlight: false,
                        frequency: 'Multiple daily'
                      };
                      
                      setFlightRoutes(prev => [...prev, newRoute]);
                      setFormData(prev => ({
                        ...prev,
                        flightRouteIds: [...prev.flightRouteIds, newRoute.id]
                      }));
                      
                      if (originInput) originInput.value = '';
                      if (travelersInput) travelersInput.value = '';
                    }
                  }}
                >
                  Add Origin
                </button>
              </div>
              
              <div className="selected-flights">
                <h3>Flight Origins Added</h3>
                {flightRoutes.filter(f => formData.flightRouteIds.includes(f.id)).length === 0 ? (
                  <p className="empty-state">No flight origins added yet</p>
                ) : (
                  <div className="flight-list">
                    {flightRoutes.filter(f => formData.flightRouteIds.includes(f.id)).map(flight => (
                      <div key={flight.id} className="flight-item selected">
                        <div className="flight-info">
                          <h4>{flight.originCity} → {destinations.find(d => d.id === formData.destinationId)?.name}</h4>
                          <p>{flight.travelers ? `${flight.travelers} travelers` : 'Group size TBD'}</p>
                        </div>
                        <button
                          className="btn-icon"
                          onClick={() => toggleArrayItem('flightRouteIds', flight.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flight-note">
                <p><small>We'll research the best flight options and include detailed flight information in your proposal.</small></p>
              </div>
            </div>
          </div>
        );

      case 9:
        const dayOptions: { value: number; label: string }[] = [];
        const nightOptions: { value: number; label: string }[] = [];
        for (let i = 1; i <= formData.numberOfNights; i++) {
          dayOptions.push({ value: i, label: `Day ${i}` });
          nightOptions.push({ value: i, label: `Night ${i}` });
        }

        return (
          <div className="step-content">
            <h2>Program Schedule & Events</h2>
            
            <div className="form-group full-width">
              <label className="form-label">Welcome Reception on First Night?</label>
              <input
                type="checkbox"
                id="welcomeReception"
                checked={formData.welcomeReception}
                onChange={(e) => {
                  updateFormData('welcomeReception', e.target.checked);
                  updateFormData('programInclusions', { 
                    ...formData.programInclusions, 
                    welcomeReception: e.target.checked 
                  });
                }}
              />
              <label htmlFor="welcomeReception" style={{ marginLeft: '8px' }}>
                Yes, include welcome reception
              </label>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Business Sessions</label>
              {formData.businessSessions.map((session, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <select
                    className="form-control"
                    value={session.day}
                    onChange={(e) => {
                      const updated = [...formData.businessSessions];
                      updated[index] = { ...session, day: parseInt(e.target.value) };
                      updateFormData('businessSessions', updated);
                    }}
                  >
                    <option value="">Select day</option>
                    {dayOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const updated = formData.businessSessions.filter((_, i) => i !== index);
                      updateFormData('businessSessions', updated);
                      updateFormData('programInclusions', { 
                        ...formData.programInclusions, 
                        businessMeeting: updated.length > 0 
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  updateFormData('businessSessions', [...formData.businessSessions, { day: 1 }]);
                  updateFormData('programInclusions', { 
                    ...formData.programInclusions, 
                    businessMeeting: true 
                  });
                }}
              >
                + Add Business Session
              </button>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Awards Dinner</label>
              {formData.awardsDinner ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="form-control"
                    value={formData.awardsDinner.night}
                    onChange={(e) => updateFormData('awardsDinner', { night: parseInt(e.target.value) })}
                  >
                    <option value="">Select night</option>
                    {nightOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      updateFormData('awardsDinner', null);
                      updateFormData('programInclusions', { 
                        ...formData.programInclusions, 
                        awardDinner: false 
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    updateFormData('awardsDinner', { night: formData.numberOfNights });
                    updateFormData('programInclusions', { 
                      ...formData.programInclusions, 
                      awardDinner: true 
                    });
                  }}
                >
                  + Add Awards Dinner
                </button>
              )}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Dine-Around Nights</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                {nightOptions.map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.dineArounds.nights.includes(opt.value)}
                      onChange={(e) => {
                        let nights = [...formData.dineArounds.nights];
                        if (e.target.checked) {
                          nights.push(opt.value);
                        } else {
                          nights = nights.filter(n => n !== opt.value);
                        }
                        updateFormData('dineArounds', { nights });
                        updateFormData('programInclusions', { 
                          ...formData.programInclusions, 
                          dineArounds: nights.length > 0 
                        });
                      }}
                    />
                    <span style={{ marginLeft: '5px' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Other Events</label>
              {formData.otherEvents.map((event, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Event description"
                    value={event.description}
                    onChange={(e) => {
                      const updated = [...formData.otherEvents];
                      updated[index] = { ...event, description: e.target.value };
                      updateFormData('otherEvents', updated);
                    }}
                  />
                  <select
                    className="form-control"
                    style={{ maxWidth: '150px' }}
                    value={event.day}
                    onChange={(e) => {
                      const updated = [...formData.otherEvents];
                      updated[index] = { ...event, day: parseInt(e.target.value) };
                      updateFormData('otherEvents', updated);
                    }}
                  >
                    <option value="">Select day</option>
                    {dayOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const updated = formData.otherEvents.filter((_, i) => i !== index);
                      updateFormData('otherEvents', updated);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => updateFormData('otherEvents', [...formData.otherEvents, { day: 1, description: '' }])}
              >
                + Add Other Event
              </button>
            </div>

            <h3 style={{ marginTop: '30px' }}>Additional Program Elements</h3>
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
                  id="teamBuilding"
                  checked={formData.programInclusions.teamBuilding}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, teamBuilding: !formData.programInclusions.teamBuilding })}
                />
                <label htmlFor="teamBuilding">Team Building Activities</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="csrOptions"
                  checked={formData.programInclusions.csrOptions}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, csrOptions: !formData.programInclusions.csrOptions })}
                />
                <label htmlFor="csrOptions">CSR Activities</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="giftingIdeas"
                  checked={formData.programInclusions.giftingIdeas}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, giftingIdeas: !formData.programInclusions.giftingIdeas })}
                />
                <label htmlFor="giftingIdeas">Gift Amenities</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="finalNightDinner"
                  checked={formData.programInclusions.finalNightDinner}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, finalNightDinner: !formData.programInclusions.finalNightDinner })}
                />
                <label htmlFor="finalNightDinner">Farewell Dinner</label>
              </div>
              <div className="inclusion-item">
                <input
                  type="checkbox"
                  id="danceBand"
                  checked={formData.programInclusions.danceBand}
                  onChange={() => updateFormData('programInclusions', { ...formData.programInclusions, danceBand: !formData.programInclusions.danceBand })}
                />
                <label htmlFor="danceBand">Entertainment/DJ/Band</label>
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
                    <strong>Event Type:</strong> {formData.eventType}
                  </div>
                  <div className="review-item">
                    <strong>Preferred Dates:</strong> {formData.preferredDates}
                    {formData.datesFlexible && ` (Flexible: ${formData.flexibleDateRange})`}
                  </div>
                  <div className="review-item">
                    <strong>Number of Nights:</strong> {formData.numberOfNights}
                  </div>
                  <div className="review-item">
                    <strong>Days Pattern:</strong> {formData.daysPattern}
                  </div>
                  <div className="review-item">
                    <strong>Attendees:</strong> {formData.attendeeCount}
                  </div>
                  <div className="review-item">
                    <strong>Room Breakdown:</strong> {formData.attendeeRooms} attendee + {formData.staffRooms} staff = {formData.roomsNeeded} total
                  </div>
                  <div className="review-item">
                    <strong>Room Type:</strong> {formData.doubleOccupancy ? 'Double' : 'Single'} occupancy, {formData.roomView === 'ocean' ? 'Ocean view' : 'Run of house'}
                  </div>
                  <div className="review-item">
                    <strong>Suites:</strong> {formData.suiteCount}
                  </div>
                  <div className="review-item">
                    <strong>Private Check-in:</strong> {formData.privateSatelliteCheckIn ? 'Yes' : 'No'}
                  </div>
                  <div className="review-item">
                    <strong>Hotel Rating:</strong> {formData.hotelRating || '5-star'}
                  </div>
                  <div className="review-item">
                    <strong>Destination:</strong> {destinations.find(d => d.id === formData.destinationId)?.name || 'To be selected'}
                  </div>
                  <div className="review-item">
                    <strong>Resort:</strong> {resorts.find(r => r.id === formData.resortId)?.name || 'To be selected'}
                  </div>
                  <div className="review-item full-width">
                    <strong>Events Schedule:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {formData.welcomeReception && <li>Welcome Reception - Night 1</li>}
                      {formData.businessSessions.map((s, i) => (
                        <li key={`bs-${i}`}>Business Session - Day {s.day}</li>
                      ))}
                      {formData.awardsDinner && <li>Awards Dinner - Night {formData.awardsDinner.night}</li>}
                      {formData.dineArounds.nights.length > 0 && (
                        <li>Dine-Arounds - Night(s) {formData.dineArounds.nights.join(', ')}</li>
                      )}
                      {formData.otherEvents.map((e, i) => (
                        <li key={`oe-${i}`}>{e.description} - Day {e.day}</li>
                      ))}
                    </ul>
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