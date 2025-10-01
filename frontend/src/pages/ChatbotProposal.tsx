import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import axios from 'axios';
import './ChatbotProposal.css';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
  inputType?: 'text' | 'date' | 'number' | 'select' | 'multiselect';
  inputConfig?: any;
  timestamp: Date;
}

interface ChatState {
  currentStep: string;
  formData: {
    eventName?: string;
    eventType?: string;
    eventPurpose?: string;
    preferredDates?: string;
    datesFlexible?: boolean;
    flexibleDateRange?: string;
    startDate?: string;
    endDate?: string;
    numberOfNights?: number;
    daysPattern?: string;
    attendeeCount?: number;
    attendeeRooms?: number;
    staffRooms?: number;
    roomsNeeded?: number;
    doubleOccupancy?: boolean;
    roomView?: 'ocean' | 'run_of_house';
    suiteCount?: number;
    privateSatelliteCheckIn?: boolean;
    welcomeReception?: boolean;
    businessSessions?: { day: number; description?: string }[];
    awardsDinner?: { night: number };
    dineArounds?: { nights: number[] };
    otherEvents?: { day: number; description: string }[];
    hotelRating?: string;
    ratingStandard?: string;
    destinationId?: string;
    resortId?: string;
    roomTypeIds?: string[];
    eventSpaceIds?: string[];
    diningIds?: string[];
    setupPreferences?: string[];
    programInclusions?: string[];
    clientName?: string;
    clientCompany?: string;
    clientEmail?: string;
    clientPhone?: string;
    primaryColor?: string;
    secondaryColor?: string;
    theme?: string;
  };
  messages: Message[];
  lastUpdated: Date;
}

const CHAT_STEPS = {
  START: 'start',
  EVENT_TYPE: 'event_type',
  PREFERRED_DATES: 'preferred_dates',
  DATE_FLEXIBILITY: 'date_flexibility',
  NUMBER_OF_NIGHTS: 'number_of_nights',
  DAYS_PATTERN: 'days_pattern',
  ATTENDEE_COUNT: 'attendee_count',
  ATTENDEE_ROOMS: 'attendee_rooms',
  STAFF_ROOMS: 'staff_rooms',
  DOUBLE_OCCUPANCY: 'double_occupancy',
  ROOM_VIEW: 'room_view',
  SUITE_COUNT: 'suite_count',
  SATELLITE_CHECKIN: 'satellite_checkin',
  WELCOME_RECEPTION: 'welcome_reception',
  BUSINESS_SESSIONS: 'business_sessions',
  AWARDS_DINNER: 'awards_dinner',
  DINE_AROUNDS: 'dine_arounds',
  OTHER_EVENTS: 'other_events',
  DESTINATION: 'destination',
  RESORT: 'resort',
  REVIEW: 'review',
  CLIENT_INFO: 'client_info',
  COMPLETE: 'complete'
};

const PROGRAM_OPTIONS = [
  { id: 'airportTransfers', label: 'Airport transfers', defaultChecked: true },
  { id: 'welcomeReception', label: 'Welcome reception', defaultChecked: true },
  { id: 'businessMeeting', label: 'Business meetings', defaultChecked: true },
  { id: 'finalNightDinner', label: 'Farewell dinner', defaultChecked: true },
  { id: 'teamBuilding', label: 'Team building activities', defaultChecked: false },
  { id: 'offSiteVenues', label: 'Off-site dinner', defaultChecked: false },
  { id: 'awardDinner', label: 'Awards gala', defaultChecked: false },
  { id: 'csrOptions', label: 'CSR activity', defaultChecked: false },
  { id: 'danceBand', label: 'Entertainment/DJ/Band', defaultChecked: false },
  { id: 'giftingIdeas', label: 'Gift amenities', defaultChecked: false }
];

function ChatbotProposal() {
  const navigate = useNavigate();
  const [chatState, setChatState] = useState<ChatState>({
    currentStep: CHAT_STEPS.START,
    formData: {},
    messages: [],
    lastUpdated: new Date()
  });
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = useRef<string>('');
  
  // Mock data - will be replaced with API calls
  const [destinations, setDestinations] = useState<any[]>([]);
  const [resorts, setResorts] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);

  // Load saved chat state on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem('activeChatId');
    if (savedChatId) {
      const savedState = localStorage.getItem(`chat_${savedChatId}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setChatState(parsed);
        chatId.current = savedChatId;
      }
    } else {
      // New chat
      chatId.current = `chat_${Date.now()}`;
      localStorage.setItem('activeChatId', chatId.current);
      addBotMessage("Hi! I'm here to help you create a perfect event proposal. Let's start with some details about your program. What type of program event are you holding?", {
        options: ['Corporate Meeting', 'Incentive Trip', 'Conference', 'Company Retreat', 'Sales Meeting', 'Board Meeting', 'Other']
      });
    }
    
    loadMockData();
  }, []);

  // Save chat state whenever it changes
  useEffect(() => {
    if (chatId.current) {
      localStorage.setItem(`chat_${chatId.current}`, JSON.stringify(chatState));
    }
  }, [chatState]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const loadMockData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Load destinations
      const destResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/destinations`, { headers });
      setDestinations(destResponse.data || []);
      
      // Load hotels from hotel portal - use regular auth to get all hotels
      try {
        // Get all hotels data including rooms, venues, dining
        const [hotelsRes, roomsRes, venuesRes, diningRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/hotels/all`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/hotels/rooms/all`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/hotels/venues/all`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/hotels/dining/all`, { headers }).catch(() => ({ data: [] }))
        ]);
        
        // For now, use mock data if APIs don't exist yet
        const mockHotels = [
          { 
            id: 'gv1', 
            name: 'Grand Velas Los Cabos', 
            description: 'Ultra-luxury all-inclusive resort',
            city: 'Los Cabos',
            rating: '5-star'
          }
        ];
        
        setHotels(hotelsRes.data?.length > 0 ? hotelsRes.data : mockHotels);
        
        // Store room/venue/dining data for later use
        (window as any).hotelRoomsData = roomsRes.data || [];
        (window as any).hotelVenuesData = venuesRes.data || [];
        (window as any).hotelDiningData = diningRes.data || [];
      } catch (error) {
        console.log('Using mock hotel data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addBotMessage = (content: string, options?: any) => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      ...options
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const handleNextStep = async (userInput?: string) => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    switch (chatState.currentStep) {
      case CHAT_STEPS.START:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, eventType: userInput },
            currentStep: CHAT_STEPS.PREFERRED_DATES
          }));
          addBotMessage("What are your preferred program dates? You can enter specific dates or a general timeframe like 'March 2025' or 'Q2 2025'.", {
            inputType: 'text'
          });
        }
        break;
        
      case CHAT_STEPS.PREFERRED_DATES:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, preferredDates: userInput },
            currentStep: CHAT_STEPS.DATE_FLEXIBILITY
          }));
          addBotMessage("Are your dates flexible?", {
            options: ['Yes, flexible', 'No, fixed dates']
          });
        }
        break;
        
      case CHAT_STEPS.DATE_FLEXIBILITY:
        if (userInput) {
          const isFlexible = userInput.includes('flexible');
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, datesFlexible: isFlexible },
            currentStep: isFlexible ? CHAT_STEPS.NUMBER_OF_NIGHTS : CHAT_STEPS.NUMBER_OF_NIGHTS
          }));
          if (isFlexible) {
            addBotMessage("What is your date range for flexibility? (e.g., 'March 15 - April 30, 2025')", {
              inputType: 'text'
            });
          } else {
            // Skip directly to number of nights
            setChatState(prev => ({ ...prev, currentStep: CHAT_STEPS.NUMBER_OF_NIGHTS }));
            addBotMessage("How many nights is your program?", {
              inputType: 'number'
            });
          }
        }
        break;
        
      case CHAT_STEPS.NUMBER_OF_NIGHTS:
        if (userInput) {
          if (chatState.formData.datesFlexible && !chatState.formData.flexibleDateRange) {
            // This was the date range input
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, flexibleDateRange: userInput },
              currentStep: CHAT_STEPS.NUMBER_OF_NIGHTS
            }));
            addBotMessage("How many nights is your program?", {
              inputType: 'number'
            });
          } else {
            // This was the number of nights input
            const nights = parseInt(userInput);
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, numberOfNights: nights },
              currentStep: CHAT_STEPS.DAYS_PATTERN
            }));
            addBotMessage("Do you have preferred days of the week pattern for your program?", {
              options: ['Monday-Friday', 'Sunday-Thursday', 'Tuesday-Saturday', 'No preference']
            });
          }
        }
        break;
        
      case CHAT_STEPS.DAYS_PATTERN:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, daysPattern: userInput },
            currentStep: CHAT_STEPS.ATTENDEE_COUNT
          }));
          addBotMessage("What's your best guess on the total number of people attending?", {
            inputType: 'number'
          });
        }
        break;
        
      case CHAT_STEPS.ATTENDEE_COUNT:
        if (userInput) {
          const attendees = parseInt(userInput);
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, attendeeCount: attendees },
            currentStep: CHAT_STEPS.ATTENDEE_ROOMS
          }));
          addBotMessage("How many attendee rooms do you need?", {
            inputType: 'number',
            placeholder: `Suggested: ${Math.ceil(attendees / 2)} rooms (based on double occupancy)`
          });
        }
        break;
        
      case CHAT_STEPS.ATTENDEE_ROOMS:
        if (userInput) {
          const attendeeRooms = parseInt(userInput);
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, attendeeRooms: attendeeRooms },
            currentStep: CHAT_STEPS.STAFF_ROOMS
          }));
          addBotMessage("How many staff rooms do you need?", {
            inputType: 'number'
          });
        }
        break;
        
      case CHAT_STEPS.STAFF_ROOMS:
        if (userInput) {
          const staffRooms = parseInt(userInput);
          const totalRooms = (chatState.formData.attendeeRooms || 0) + staffRooms;
          setChatState(prev => ({
            ...prev,
            formData: { 
              ...prev.formData, 
              staffRooms: staffRooms,
              roomsNeeded: totalRooms
            },
            currentStep: CHAT_STEPS.DOUBLE_OCCUPANCY
          }));
          addBotMessage("Will the majority of your rooms be double occupancy?", {
            options: ['Yes', 'No']
          });
        }
        break;
        
      case CHAT_STEPS.DOUBLE_OCCUPANCY:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, doubleOccupancy: userInput === 'Yes' },
            currentStep: CHAT_STEPS.ROOM_VIEW
          }));
          addBotMessage("Do you want all ocean view rooms or just run of house?", {
            options: ['All ocean view', 'Run of house']
          });
        }
        break;
        
      case CHAT_STEPS.ROOM_VIEW:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, roomView: userInput.includes('ocean') ? 'ocean' : 'run_of_house' },
            currentStep: CHAT_STEPS.SUITE_COUNT
          }));
          addBotMessage("How many suites will you need?", {
            inputType: 'number'
          });
        }
        break;
        
      case CHAT_STEPS.SUITE_COUNT:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, suiteCount: parseInt(userInput) },
            currentStep: CHAT_STEPS.SATELLITE_CHECKIN
          }));
          addBotMessage("Do you want a private satellite check in?", {
            options: ['Yes', 'No']
          });
        }
        break;
        
      case CHAT_STEPS.SATELLITE_CHECKIN:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, privateSatelliteCheckIn: userInput === 'Yes' },
            currentStep: CHAT_STEPS.WELCOME_RECEPTION
          }));
          addBotMessage("Do you want a welcome reception on the first night?", {
            options: ['Yes', 'No']
          });
        }
        break;
        
      case CHAT_STEPS.WELCOME_RECEPTION:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, welcomeReception: userInput === 'Yes' },
            currentStep: CHAT_STEPS.BUSINESS_SESSIONS
          }));
          const nights = chatState.formData.numberOfNights || 3;
          const dayOptions = [];
          for (let i = 1; i <= nights; i++) {
            dayOptions.push(`Day ${i}`);
          }
          dayOptions.push('Multiple days');
          dayOptions.push('No business sessions');
          
          addBotMessage("Will there be business session(s)? If so, which day(s)?", {
            options: dayOptions
          });
        }
        break;
        
      case CHAT_STEPS.BUSINESS_SESSIONS:
        if (userInput) {
          if (userInput === 'No business sessions') {
            setChatState(prev => ({
              ...prev,
              currentStep: CHAT_STEPS.AWARDS_DINNER
            }));
          } else if (userInput === 'Multiple days') {
            addBotMessage("Please specify which days (e.g., 'Day 1 and Day 3' or '1,3')", {
              inputType: 'text'
            });
            return;
          } else if (userInput.includes('Day')) {
            const day = parseInt(userInput.replace('Day ', ''));
            setChatState(prev => ({
              ...prev,
              formData: { 
                ...prev.formData, 
                businessSessions: [{ day }]
              },
              currentStep: CHAT_STEPS.AWARDS_DINNER
            }));
          } else {
            // Parse multiple days from text input
            const days = userInput.match(/\d+/g)?.map(d => parseInt(d)) || [];
            setChatState(prev => ({
              ...prev,
              formData: { 
                ...prev.formData, 
                businessSessions: days.map(day => ({ day }))
              },
              currentStep: CHAT_STEPS.AWARDS_DINNER
            }));
          }
          
          const nights = chatState.formData.numberOfNights || 3;
          const nightOptions = [];
          for (let i = 1; i <= nights; i++) {
            nightOptions.push(`Night ${i}`);
          }
          nightOptions.push('No awards dinner');
          
          addBotMessage("Will there be an awards dinner? If so, which night?", {
            options: nightOptions
          });
        }
        break;
        
      case CHAT_STEPS.AWARDS_DINNER:
        if (userInput) {
          if (userInput !== 'No awards dinner') {
            const night = parseInt(userInput.replace('Night ', ''));
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, awardsDinner: { night } },
              currentStep: CHAT_STEPS.DINE_AROUNDS
            }));
          } else {
            setChatState(prev => ({
              ...prev,
              currentStep: CHAT_STEPS.DINE_AROUNDS
            }));
          }
          
          const nights = chatState.formData.numberOfNights || 3;
          const nightOptions = [];
          for (let i = 1; i <= nights; i++) {
            nightOptions.push(`Night ${i}`);
          }
          nightOptions.push('Multiple nights');
          nightOptions.push('No dine-arounds');
          
          addBotMessage("Do you want on-property dine-arounds for all your guests? If so, which night(s)?", {
            options: nightOptions
          });
        }
        break;
        
      case CHAT_STEPS.DINE_AROUNDS:
        if (userInput) {
          if (userInput === 'No dine-arounds') {
            setChatState(prev => ({
              ...prev,
              currentStep: CHAT_STEPS.OTHER_EVENTS
            }));
          } else if (userInput === 'Multiple nights') {
            addBotMessage("Please specify which nights (e.g., 'Night 2 and Night 3' or '2,3')", {
              inputType: 'text'
            });
            return;
          } else if (userInput.includes('Night')) {
            const night = parseInt(userInput.replace('Night ', ''));
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, dineArounds: { nights: [night] } },
              currentStep: CHAT_STEPS.OTHER_EVENTS
            }));
          } else {
            // Parse multiple nights from text input
            const nights = userInput.match(/\d+/g)?.map(n => parseInt(n)) || [];
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, dineArounds: { nights } },
              currentStep: CHAT_STEPS.OTHER_EVENTS
            }));
          }
          
          addBotMessage("Any other events for the program? If yes, please describe them and which day(s).", {
            options: ['No other events', 'Yes, I have other events']
          });
        }
        break;
        
      case CHAT_STEPS.OTHER_EVENTS:
        if (userInput) {
          if (userInput === 'No other events') {
            setChatState(prev => ({
              ...prev,
              currentStep: CHAT_STEPS.REVIEW
            }));
            showReview();
          } else if (userInput === 'Yes, I have other events') {
            addBotMessage("Please describe the events and their days (e.g., 'Team building on Day 2, CSR activity on Day 3')", {
              inputType: 'text'
            });
          } else {
            // Parse other events from text
            // Simple parsing - in production would be more sophisticated
            const events: { day: number; description: string }[] = [];
            const eventPattern = /(?:day\s*(\d+)[:\s-]*([^,]+))|(?:([^,]+)\s*on\s*day\s*(\d+))/gi;
            let match;
            while ((match = eventPattern.exec(userInput)) !== null) {
              const day = parseInt(match[1] || match[4]);
              const description = (match[2] || match[3]).trim();
              if (day && description) {
                events.push({ day, description });
              }
            }
            
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, otherEvents: events },
              currentStep: CHAT_STEPS.REVIEW
            }));
            showReview();
          }
        }
        break;
        
        
      case CHAT_STEPS.CLIENT_INFO:
        if (userInput) {
          // Simple parsing - in production would use a form
          setChatState(prev => ({
            ...prev,
            formData: { 
              ...prev.formData, 
              clientName: userInput.split(',')[0]?.trim(),
              clientCompany: userInput.split(',')[1]?.trim(),
              clientEmail: userInput.split(',')[2]?.trim()
            },
            currentStep: CHAT_STEPS.COMPLETE
          }));
          createProposal();
        }
        break;
        
      case CHAT_STEPS.REVIEW:
        if (userInput === 'Continue to Venue Selection') {
          setChatState(prev => ({
            ...prev,
            currentStep: CHAT_STEPS.DESTINATION
          }));
          const destOptions = destinations.map((d: any) => d.name);
          addBotMessage("Great. First, please select a destination:", {
            options: destOptions.length ? destOptions : ['Los Cabos']
          });
        } else if (userInput === 'Make Changes') {
          addBotMessage("What would you like to change? You can tell me, and I'll help you update it.");
        }
        break;

      case CHAT_STEPS.DESTINATION:
        if (userInput) {
          const selected = destinations.find((d: any) => d.name === userInput) || destinations[0];
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, destinationId: selected?.id || 'los-cabos' },
            currentStep: CHAT_STEPS.RESORT
          }));
          // Build resort options: prefer hotels list for now
          const resortOptions = hotels.map((h: any) => h.name);
          addBotMessage("Now select a resort:", {
            options: resortOptions.length ? resortOptions : ['Grand Velas Los Cabos']
          });
        }
        break;

      case CHAT_STEPS.RESORT:
        if (userInput) {
          const selectedHotel = hotels.find((h: any) => h.name === userInput) || hotels[0];
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, resortId: selectedHotel?.id || 'grand-velas' },
            currentStep: CHAT_STEPS.CLIENT_INFO
          }));
          addBotMessage("Almost done — who should I address this proposal to? Please provide your name, company, and email (comma separated).", {
            inputType: 'text'
          });
        }
        break;
        
      case CHAT_STEPS.COMPLETE:
        if (userInput === 'View Proposal') {
          const proposalId = localStorage.getItem('lastProposalId');
          console.log('Attempting to view proposal with ID:', proposalId);
          if (proposalId) {
            // Navigate to the proposal view page
            navigate(`/proposal/${proposalId}`);
          } else {
            console.error('No proposal ID found in localStorage');
            addBotMessage("Sorry, couldn't find the proposal ID. Please try creating the proposal again.");
          }
        } else if (userInput === 'Create Another') {
          // Clear the session and start fresh
          localStorage.removeItem('lastProposalId');
          localStorage.removeItem('activeChatId');
          localStorage.removeItem(`chat_${chatId.current}`);
          startNewChat();
        }
        break;
    }
    
    setIsTyping(false);
  };


  const showReview = () => {
    const { formData } = chatState;
    
    // Format business sessions
    const businessSessionsText = formData.businessSessions?.length 
      ? formData.businessSessions.map(s => `Day ${s.day}`).join(', ')
      : 'None';
    
    // Format dine-arounds
    const dineAroundsText = formData.dineArounds?.nights?.length
      ? `Night(s) ${formData.dineArounds.nights.join(', ')}`
      : 'None';
    
    // Format other events
    const otherEventsText = formData.otherEvents?.length
      ? formData.otherEvents.map(e => `${e.description} (Day ${e.day})`).join(', ')
      : 'None';
    
    const summary = `
      <div class="proposal-summary">
        <h3>Here's what I've captured for your program:</h3>
        <ul>
          <li><strong>Event Type:</strong> ${formData.eventType}</li>
          <li><strong>Preferred Dates:</strong> ${formData.preferredDates}${formData.datesFlexible ? ' (Flexible)' : ''}</li>
          ${formData.flexibleDateRange ? `<li><strong>Date Range:</strong> ${formData.flexibleDateRange}</li>` : ''}
          <li><strong>Number of Nights:</strong> ${formData.numberOfNights}</li>
          <li><strong>Days Pattern:</strong> ${formData.daysPattern}</li>
          <li><strong>Total Attendees:</strong> ${formData.attendeeCount}</li>
          <li><strong>Room Breakdown:</strong> ${formData.attendeeRooms} attendee + ${formData.staffRooms} staff = ${formData.roomsNeeded} total</li>
          <li><strong>Double Occupancy:</strong> ${formData.doubleOccupancy ? 'Yes' : 'No'}</li>
          <li><strong>Room View:</strong> ${formData.roomView === 'ocean' ? 'All ocean view' : 'Run of house'}</li>
          <li><strong>Suites Needed:</strong> ${formData.suiteCount}</li>
          <li><strong>Private Check-in:</strong> ${formData.privateSatelliteCheckIn ? 'Yes' : 'No'}</li>
          <li><strong>Welcome Reception:</strong> ${formData.welcomeReception ? 'Yes (First night)' : 'No'}</li>
          <li><strong>Business Sessions:</strong> ${businessSessionsText}</li>
          <li><strong>Awards Dinner:</strong> ${formData.awardsDinner ? `Night ${formData.awardsDinner.night}` : 'No'}</li>
          <li><strong>Dine-Arounds:</strong> ${dineAroundsText}</li>
          <li><strong>Other Events:</strong> ${otherEventsText}</li>
        </ul>
        <p>Ready to find the perfect venue for your program?</p>
      </div>
    `;
    
    addBotMessage(summary, {
      options: ['Continue to Venue Selection', 'Make Changes']
    });
  };

  const createProposal = async () => {
    try {
      setIsTyping(true);
      addBotMessage("Creating your proposal now...");
      
      const token = localStorage.getItem('token');
      const { formData } = chatState;
      
      // Build proposal payload matching the backend structure
      // Calculate start and end dates from preferred dates and number of nights
      let startDate = formData.startDate || '';
      let endDate = formData.endDate || '';
      
      if (formData.preferredDates && formData.numberOfNights) {
        // Simple date parsing - in production would be more sophisticated
        const baseDate = new Date(formData.preferredDates.includes('2025') ? '2025-03-15' : '2025-06-01');
        startDate = baseDate.toISOString().split('T')[0];
        const endDateObj = new Date(baseDate);
        endDateObj.setDate(endDateObj.getDate() + (formData.numberOfNights - 1));
        endDate = endDateObj.toISOString().split('T')[0];
      }

      const proposalPayload = {
        client: {
          name: formData.clientName || '',
          company: formData.clientCompany || '',
          email: formData.clientEmail || ''
        },
        eventDetails: {
          name: `${formData.eventType || 'Corporate Event'} - ${formData.clientCompany || 'Company'}`,
          purpose: formData.eventType === 'Corporate Meeting' ? 'corporate' : 
                  formData.eventType === 'Incentive Trip' ? 'incentive' :
                  formData.eventType === 'Conference' ? 'conference' : 'retreat',
          startDate: startDate,
          endDate: endDate,
          attendeeCount: formData.attendeeCount || 0,
          roomsNeeded: formData.roomsNeeded || 0,
          hotelRating: '5-star', // Default to 5-star for now
          // Extended fields
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
        // These fields are required by backend
        destination: {
          id: formData.destinationId || 'los-cabos',
          name: 'Los Cabos'
        },
        resort: {
          id: formData.resortId || 'grand-velas',
          name: 'Grand Velas Los Cabos'
        },
        selectedRooms: [],
        selectedSpaces: [],
        selectedDining: [],
        flightRoutes: [],
        programFlow: {
          spaceSetups: {
            banquet: formData.awardsDinner !== undefined,
            theater: ((formData.businessSessions?.length ?? 0) > 0),
            reception: formData.welcomeReception || false
          },
          programInclusions: {
            airportTransfers: true, // Default to true
            welcomeReception: formData.welcomeReception || false,
            businessMeeting: ((formData.businessSessions?.length ?? 0) > 0),
            awardDinner: formData.awardsDinner !== undefined,
            dineArounds: ((formData.dineArounds?.nights?.length ?? 0) > 0),
            finalNightDinner: true, // Default to true
            teamBuilding: formData.otherEvents?.some(e => e.description.toLowerCase().includes('team')) || false,
            offSiteVenues: formData.otherEvents?.some(e => e.description.toLowerCase().includes('off-site')) || false,
            csrOptions: formData.otherEvents?.some(e => e.description.toLowerCase().includes('csr')) || false,
            giftingIdeas: false,
            danceBand: false,
            decorIdeas: false,
            activityOptions: false,
            offSiteRestaurants: false
          }
        },
        branding: {
          primaryColor: formData.primaryColor || '#0066FF',
          secondaryColor: formData.secondaryColor || '#00B8D4',
          theme: formData.theme || 'modern'
        },
        generatedContent: null // Will be populated by AI later
      };
      
      // Use API URL from environment
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check environment variables.');
      }
      console.log('Creating proposal with payload:', proposalPayload);
      console.log('API URL:', apiUrl);
      
      const response = await axios.post(
        `${apiUrl}/api/proposals`,
        proposalPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Proposal created successfully:', response.data);
      
      setChatState(prev => ({
        ...prev,
        currentStep: CHAT_STEPS.COMPLETE
      }));
      
      const proposalId = response.data.id;
      
      if (!proposalId) {
        console.error('No proposal ID in response:', response.data);
        throw new Error('Proposal created but no ID returned');
      }
      
      addBotMessage(`🎉 Your proposal has been created successfully! (ID: ${proposalId})`, {
        options: ['View Proposal', 'Create Another']
      });
      
      // Store proposal ID for viewing
      localStorage.setItem('lastProposalId', proposalId);
      
      // Don't clear the chat session immediately - wait for user action
      // This prevents loss of context if there's an issue
      
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      addBotMessage(`Sorry, there was an error creating your proposal: ${errorMessage}. Please check the console for details.`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    handleNextStep(inputValue);
    setInputValue('');
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    handleNextStep(option);
  };

  const handleMultiSelectSubmit = () => {
    addUserMessage(selectedOptions.join(', '));
    handleNextStep();
  };

  const startNewChat = () => {
    localStorage.removeItem('activeChatId');
    localStorage.removeItem(`chat_${chatId.current}`);
    window.location.reload();
  };

  const currentMessage = chatState.messages[chatState.messages.length - 1];

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <Bot size={24} />
        <h2>Proposal Assistant</h2>
        <button className="btn-icon" onClick={startNewChat} title="Start new chat">
          <RefreshCw size={20} />
        </button>
      </div>
      
      <div className="chatbot-messages">
        {chatState.messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              {message.content.includes('<div') ? 
                <div dangerouslySetInnerHTML={{ __html: message.content }} /> :
                <p>{message.content}</p>
              }
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-input-area">
        {currentMessage?.options && (
          <div className="options-container">
            {currentMessage.options.map((option, idx) => (
              <button 
                key={idx} 
                className="option-button"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {currentMessage?.inputType === 'multiselect' && (
          <div className="multiselect-container">
            {PROGRAM_OPTIONS.map(option => (
              <label key={option.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOptions([...selectedOptions, option.id]);
                    } else {
                      setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                    }
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
            <button 
              className="btn btn-primary"
              onClick={handleMultiSelectSubmit}
              disabled={selectedOptions.length === 0}
            >
              Continue
            </button>
          </div>
        )}
        
        {currentMessage?.inputType === 'date' && (
          <div className="date-input-container">
            <input
              type="date"
              value={inputValue.split(' to ')[0] || ''}
              onChange={(e) => setInputValue(e.target.value)}
              className="form-control"
            />
            <span>to</span>
            <input
              type="date"
              value={inputValue.split(' to ')[1] || ''}
              onChange={(e) => setInputValue(prev => {
                const start = prev.split(' to ')[0] || '';
                return `${start} to ${e.target.value}`;
              })}
              className="form-control"
            />
            <button onClick={handleSendMessage} className="btn btn-primary">
              <Send size={18} />
            </button>
          </div>
        )}
        
        {(!currentMessage?.options && !currentMessage?.inputType?.includes('select') && currentMessage?.inputType !== 'date') && (
          <div className="input-container">
            <input
              type={currentMessage?.inputType || 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your response..."
              className="form-control"
            />
            <button onClick={handleSendMessage} className="btn btn-primary">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatbotProposal;
