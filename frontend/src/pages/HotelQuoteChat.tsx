import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, RefreshCw, Send, User } from 'lucide-react';
import axios from 'axios';
import './ChatbotProposal.css';

type MessageType = 'bot' | 'user';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  options?: string[];
  inputType?: 'text' | 'date' | 'number' | 'select' | 'multiselect';
  inputConfig?: any;
  timestamp: Date;
}

interface ProgramState {
  program: {
    start_date?: string;
    end_date?: string;
    is_flexible?: boolean;
    flex_start?: string;
    flex_end?: string;
    nights?: number;
    dow_pattern?: string;
  };
  attendees: {
    count?: number;
    confidence?: 'Low' | 'Med' | 'High';
  };
  occupancy: {
    is_double_majority?: boolean;
    double_pct?: number; // 0-100
  };
  rooms: {
    view_pref?: 'All Ocean View' | 'Run of House' | 'Blend';
    view_pct?: number; // if Blend, percent OV
    suites?: {
      count?: number;
    };
  };
  arrival: {
    satellite_checkin?: {
      enabled?: boolean;
      details?: string;
    };
  };
  events: {
    welcome_reception?: { enabled?: boolean; details?: string };
    business?: { days?: number[]; details?: string; seating_style?: string };
    awards_dinner?: { enabled?: boolean; night?: number; details?: string };
    dine_arounds?: { enabled?: boolean; nights?: number[] };
    custom?: { day: number; description: string }[];
  };
}

type StepId =
  | 'S1_CHOICE' | 'S1_FIXED' | 'S1_FLEX'
  | 'S2' | 'S3' | 'S4' | 'S4_CONF' | 'S5' | 'S5_PCT' | 'S6' | 'S6_BLEND_PCT'
  | 'S7' | 'S8' | 'S8_DETAILS' | 'S9' | 'S9_DETAILS' | 'S10' | 'S10_MULTI' | 'S10_DETAILS'
  | 'S11' | 'S12' | 'S12_MULTI' | 'S13' | 'S13_DETAILS' | 'S14' | 'GRID_READY' | 'COMPLETE';

function HotelQuoteChat() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StepId>('S1_CHOICE');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ProgramState>({
    program: {},
    attendees: {},
    occupancy: {},
    rooms: { suites: {} },
    arrival: {},
    events: {}
  });

  const nights = useMemo(() => {
    if (state.program.start_date && state.program.end_date) {
      const start = new Date(state.program.start_date);
      const end = new Date(state.program.end_date);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, diff);
    }
    return state.program.nights || 0;
  }, [state.program.start_date, state.program.end_date, state.program.nights]);

  useEffect(() => {
    // Boot message
    addBotMessage("Let's build your hotel quote. What are your preferred program dates? Are your dates flexible?", {
      options: ['Fixed dates', 'Flexible range']
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string, options?: Partial<Message>) => {
    const msg: Message = {
      id: `m_${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      ...options
    } as Message;
    setMessages(prev => [...prev, msg]);
  };

  const addUserMessage = (content: string) => {
    const msg: Message = {
      id: `m_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleOptionClick = async (option: string) => {
    addUserMessage(option);
    await handleNext(option);
  };

  const handleSend = async () => {
    const value = inputValue.trim();
    if (!value) return;
    addUserMessage(value);
    setInputValue('');
    await handleNext(value);
  };

  const parseDateRangeInput = (value: string) => {
    // expects "YYYY-MM-DD to YYYY-MM-DD" from date input UI
    const [start, end] = value.split(' to ').map(s => s?.trim());
    return { start, end };
  };

  const validateDateSpan = (start?: string, end?: string) => {
    if (!start || !end) return false;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return false;
    if (e <= s) return false;
    // limit span to <= 18 months in days
    const months18 = 18 * 30 * 24 * 60 * 60 * 1000;
    if (e.getTime() - s.getTime() > months18) return false;
    return true;
  };

  const saveDraftAndOpenGrid = async () => {
    try {
      setIsTyping(true);
      addBotMessage("Saving your quote and creating proposal...");
      
      const token = localStorage.getItem('hotelToken');
      if (!token) {
        throw new Error('No hotel authentication token found. Please log in again.');
      }
      
      const draft = { ...state, program: { ...state.program, nights } };
      localStorage.setItem('hotel_quote_draft', JSON.stringify(draft));
      
      // Create proposal in database
      const proposalPayload = {
        client: {
          name: 'Hotel Quote Client',
          company: 'Grand Velas Los Cabos',
          email: 'quote@grandvelasloscabos.com'
        },
        eventDetails: {
          name: `Hotel Quote - ${new Date().toLocaleDateString()}`,
          purpose: 'hotel_quote',
          startDate: state.program.start_date || state.program.flex_start || '',
          endDate: state.program.end_date || state.program.flex_end || '',
          attendeeCount: state.attendees.count || 0,
          roomsNeeded: Math.ceil((state.attendees.count || 0) * (1 - (state.occupancy.double_pct || 0) / 100)),
          numberOfNights: nights,
          daysPattern: state.program.dow_pattern,
          doubleOccupancy: state.occupancy.is_double_majority,
          roomView: state.rooms.view_pref,
          suiteCount: state.rooms.suites?.count || 0,
          privateSatelliteCheckIn: state.arrival.satellite_checkin?.enabled,
          businessSessions: state.events.business?.days?.map(d => ({ day: d, description: state.events.business?.details || '' })),
          awardsDinner: state.events.awards_dinner?.enabled ? { night: state.events.awards_dinner.night } : undefined,
          dineArounds: state.events.dine_arounds?.enabled ? { nights: state.events.dine_arounds.nights || [] } : undefined,
          otherEvents: state.events.custom
        },
        destination: {
          id: 'los-cabos',
          name: 'Los Cabos'
        },
        resort: {
          id: 'grand-velas',
          name: 'Grand Velas Los Cabos'
        },
        selectedRooms: [],
        selectedSpaces: [],
        selectedDining: [],
        flightRoutes: [],
        programFlow: {
          spaceSetups: {
            banquet: state.events.awards_dinner?.enabled || false,
            theater: (state.events.business?.days?.length ?? 0) > 0,
            reception: state.events.welcome_reception?.enabled || false
          },
          programInclusions: {
            airportTransfers: true,
            welcomeReception: state.events.welcome_reception?.enabled || false,
            businessMeeting: (state.events.business?.days?.length ?? 0) > 0,
            awardDinner: state.events.awards_dinner?.enabled || false,
            dineArounds: state.events.dine_arounds?.enabled || false,
            finalNightDinner: false,
            teamBuilding: false,
            offSiteVenues: false,
            csrOptions: false,
            giftingIdeas: false,
            danceBand: false,
            decorIdeas: false,
            activityOptions: false,
            offSiteRestaurants: false
          }
        },
        branding: {
          primaryColor: '#0066FF',
          secondaryColor: '#00B8D4',
          theme: 'modern'
        },
        generatedContent: null
      };
      
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check environment variables.');
      }
      
      console.log('Creating hotel quote proposal:', proposalPayload);
      
      const response = await axios.post(
        `${apiUrl}/api/proposals`,
        proposalPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Proposal created successfully:', response.data);
      
      if (response.data.id) {
        addBotMessage(`✅ Proposal saved successfully! (ID: ${response.data.id}). Opening grid editor...`);
        localStorage.setItem('lastHotelProposalId', response.data.id);
        
        // Wait a moment then navigate to grid
        setTimeout(() => {
          navigate('/hotel/ai-quote/grid');
        }, 1500);
      } else {
        throw new Error('Proposal created but no ID returned');
      }
      
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      addBotMessage(`❌ Error saving proposal: ${errorMessage}`);
      
      // Still navigate to grid even if save failed
      setTimeout(() => {
        navigate('/hotel/ai-quote/grid');
      }, 2000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNext = async (userInput: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 400));
    switch (currentStep) {
      case 'S1_CHOICE': {
        const isFlexible = userInput.startsWith('Flexible');
        setState(prev => ({
          ...prev,
          program: { ...prev.program, is_flexible: isFlexible }
        }));
        if (isFlexible) {
          setCurrentStep('S1_FLEX');
          addBotMessage('Select your flexible date range:', { inputType: 'date' });
        } else {
          setCurrentStep('S1_FIXED');
          addBotMessage('Select your exact start and end dates:', { inputType: 'date' });
        }
        break;
      }
      case 'S1_FIXED': {
        const { start, end } = parseDateRangeInput(userInput);
        if (!validateDateSpan(start, end)) {
          addBotMessage('Please enter a valid date range where end date is after start and within 18 months.', { inputType: 'date' });
          break;
        }
        setState(prev => ({ ...prev, program: { ...prev.program, start_date: start, end_date: end } }));
        setCurrentStep('S2');
        addBotMessage('How many nights is your program?', { inputType: 'number' });
        break;
      }
      case 'S1_FLEX': {
        const { start, end } = parseDateRangeInput(userInput);
        if (!validateDateSpan(start, end)) {
          addBotMessage('Enter a valid flexible range (end after start, <= 18 months).', { inputType: 'date' });
          break;
        }
        setState(prev => ({ ...prev, program: { ...prev.program, flex_start: start, flex_end: end } }));
        setCurrentStep('S2');
        addBotMessage('How many nights is your program?', { inputType: 'number' });
        break;
      }
      case 'S2': {
        const nightsNum = Math.max(1, parseInt(userInput, 10) || 0);
        setState(prev => ({ ...prev, program: { ...prev.program, nights: nightsNum } }));
        setCurrentStep('S3');
        addBotMessage('Do you have a preferred day-of-week pattern?', {
          options: ['Sun–Wed', 'Mon–Thu', 'Thu–Sun', 'Custom']
        });
        break;
      }
      case 'S3': {
        setState(prev => ({ ...prev, program: { ...prev.program, dow_pattern: userInput } }));
        setCurrentStep('S4');
        addBotMessage('What’s your best estimate of total attendees?', { inputType: 'number' });
        break;
      }
      case 'S4': {
        const count = Math.max(1, parseInt(userInput, 10) || 0);
        setState(prev => ({ ...prev, attendees: { ...prev.attendees, count } }));
        setCurrentStep('S4_CONF');
        addBotMessage('How confident is this estimate?', { options: ['Low', 'Med', 'High'] });
        break;
      }
      case 'S4_CONF': {
        const conf = (['Low', 'Med', 'High'] as const).includes(userInput as any) ? (userInput as 'Low' | 'Med' | 'High') : 'Low';
        setState(prev => ({ ...prev, attendees: { ...prev.attendees, confidence: conf } }));
        setCurrentStep('S5');
        addBotMessage('Will the majority of rooms be double occupancy?', { options: ['Yes', 'No'] });
        break;
      }
      case 'S5': {
        const isDouble = userInput === 'Yes';
        setState(prev => ({ ...prev, occupancy: { ...prev.occupancy, is_double_majority: isDouble } }));
        setCurrentStep('S5_PCT');
        addBotMessage(isDouble ? 'What % of guests will share double occupancy? (0–100)' : 'What % will be single occupancy? (0–100)', { inputType: 'number' });
        break;
      }
      case 'S5_PCT': {
        let pct = Math.max(0, Math.min(100, parseInt(userInput, 10) || 0));
        // Store as double % consistently
        setState(prev => ({
          ...prev,
          occupancy: {
            ...prev.occupancy,
            double_pct: prev.occupancy.is_double_majority ? pct : (100 - pct)
          }
        }));
        setCurrentStep('S6');
        addBotMessage('View preference for rooms?', { options: ['All Ocean View', 'Run of House', 'Blend'] });
        break;
      }
      case 'S6': {
        const pref = (userInput as any) as ProgramState['rooms']['view_pref'];
        setState(prev => ({ ...prev, rooms: { ...prev.rooms, view_pref: pref } }));
        if (userInput === 'Blend') {
          setCurrentStep('S6_BLEND_PCT');
          addBotMessage('What % should be Ocean View? (0–100)', { inputType: 'number' });
        } else {
          setCurrentStep('S7');
          addBotMessage('How many suites will you need?', { inputType: 'number' });
        }
        break;
      }
      case 'S6_BLEND_PCT': {
        const viewPct = Math.max(0, Math.min(100, parseInt(userInput, 10) || 0));
        setState(prev => ({ ...prev, rooms: { ...prev.rooms, view_pct: viewPct } }));
        setCurrentStep('S7');
        addBotMessage('How many suites will you need?', { inputType: 'number' });
        break;
      }
      case 'S7': {
        const suites = Math.max(0, parseInt(userInput, 10) || 0);
        setState(prev => ({ ...prev, rooms: { ...prev.rooms, suites: { count: suites } } }));
        setCurrentStep('S8');
        addBotMessage('Do you want a private satellite check-in?', { options: ['Yes', 'No'] });
        break;
      }
      case 'S8': {
        if (userInput === 'Yes') {
          setState(prev => ({ ...prev, arrival: { satellite_checkin: { enabled: true } } }));
          setCurrentStep('S8_DETAILS');
          addBotMessage('Please provide preferred location and time window.', { inputType: 'text' });
        } else {
          setState(prev => ({ ...prev, arrival: { satellite_checkin: { enabled: false } } }));
          setCurrentStep('S9');
          addBotMessage('Do you want a welcome reception on the first night?', { options: ['Yes', 'No'] });
        }
        break;
      }
      case 'S8_DETAILS': {
        setState(prev => ({ ...prev, arrival: { satellite_checkin: { enabled: true, details: userInput } } }));
        setCurrentStep('S9');
        addBotMessage('Do you want a welcome reception on the first night?', { options: ['Yes', 'No'] });
        break;
      }
      case 'S9': {
        if (userInput === 'Yes') {
          setState(prev => ({ ...prev, events: { ...prev.events, welcome_reception: { enabled: true } } }));
          setCurrentStep('S9_DETAILS');
          addBotMessage('Any preferences (time, indoor/outdoor, hosted bar)?', { inputType: 'text' });
        } else {
          setState(prev => ({ ...prev, events: { ...prev.events, welcome_reception: { enabled: false } } }));
          setCurrentStep('S10');
          askBusinessSessions();
        }
        break;
      }
      case 'S9_DETAILS': {
        setState(prev => ({ ...prev, events: { ...prev.events, welcome_reception: { enabled: true, details: userInput } } }));
        setCurrentStep('S10');
        askBusinessSessions();
        break;
      }
      case 'S10': {
        if (userInput === 'Multiple days') {
          setCurrentStep('S10_MULTI');
          addBotMessage('Please specify which days (e.g., 1,3).', { inputType: 'text' });
        } else if (userInput === 'No business sessions') {
          setState(prev => ({ ...prev, events: { ...prev.events, business: { days: [] } } }));
          setCurrentStep('S11');
          askAwards();
        } else if (/^Day\s\d+/.test(userInput)) {
          const day = parseInt(userInput.replace('Day ', ''), 10);
          setState(prev => ({ ...prev, events: { ...prev.events, business: { days: [day] } } }));
          setCurrentStep('S10_DETAILS');
          addBotMessage('Provide seating style (theater/classroom/rounds) and times.', { inputType: 'text' });
        } else {
          // fallback
          setCurrentStep('S11');
          askAwards();
        }
        break;
      }
      case 'S10_MULTI': {
        const days = (userInput.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(Boolean);
        setState(prev => ({ ...prev, events: { ...prev.events, business: { days } } }));
        setCurrentStep('S10_DETAILS');
        addBotMessage('Provide seating style (theater/classroom/rounds) and times.', { inputType: 'text' });
        break;
      }
      case 'S10_DETAILS': {
        setState(prev => ({ ...prev, events: { ...prev.events, business: { ...(prev.events.business || {}), details: userInput } } }));
        setCurrentStep('S11');
        askAwards();
        break;
      }
      case 'S11': {
        if (userInput === 'No awards dinner') {
          setState(prev => ({ ...prev, events: { ...prev.events, awards_dinner: { enabled: false } } }));
          setCurrentStep('S12');
          askDineArounds();
        } else if (/^Night\s\d+/.test(userInput)) {
          const night = parseInt(userInput.replace('Night ', ''), 10);
          setState(prev => ({ ...prev, events: { ...prev.events, awards_dinner: { enabled: true, night } } }));
          setCurrentStep('S12');
          askDineArounds();
        } else {
          setCurrentStep('S12');
          askDineArounds();
        }
        break;
      }
      case 'S12': {
        if (userInput === 'No dine-arounds') {
          setState(prev => ({ ...prev, events: { ...prev.events, dine_arounds: { enabled: false, nights: [] } } }));
          setCurrentStep('S13');
          askOtherEvents();
        } else if (userInput === 'Multiple nights') {
          setCurrentStep('S12_MULTI');
          addBotMessage('Specify which nights (e.g., 2,3).', { inputType: 'text' });
        } else if (/^Night\s\d+/.test(userInput)) {
          const night = parseInt(userInput.replace('Night ', ''), 10);
          setState(prev => ({ ...prev, events: { ...prev.events, dine_arounds: { enabled: true, nights: [night] } } }));
          setCurrentStep('S13');
          askOtherEvents();
        } else {
          setCurrentStep('S13');
          askOtherEvents();
        }
        break;
      }
      case 'S12_MULTI': {
        const nightsSel = (userInput.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(Boolean);
        setState(prev => ({ ...prev, events: { ...prev.events, dine_arounds: { enabled: true, nights: nightsSel } } }));
        setCurrentStep('S13');
        askOtherEvents();
        break;
      }
      case 'S13': {
        if (userInput === 'No other events') {
          setState(prev => ({ ...prev, events: { ...prev.events, custom: [] } }));
          setCurrentStep('S14');
          showSummary();
        } else if (userInput === 'Yes, I have other events') {
          setCurrentStep('S13_DETAILS');
          addBotMessage('Describe the events and days (e.g., Team building on Day 2).', { inputType: 'text' });
        } else {
          setCurrentStep('S14');
          showSummary();
        }
        break;
      }
      case 'S13_DETAILS': {
        const items: { day: number; description: string }[] = [];
        const re = /(?:day\s*(\d+)[:\s-]*([^,]+))|(?:([^,]+)\s*on\s*day\s*(\d+))/gi;
        let m: RegExpExecArray | null;
        while ((m = re.exec(userInput)) !== null) {
          const day = parseInt(m[1] || m[4], 10);
          const description = (m[2] || m[3] || '').trim();
          if (day && description) items.push({ day, description });
        }
        setState(prev => ({ ...prev, events: { ...prev.events, custom: items } }));
        setCurrentStep('S14');
        showSummary();
        break;
      }
      case 'S14': {
        if (userInput === 'Open Editable Grid') {
          setCurrentStep('GRID_READY');
          saveDraftAndOpenGrid();
        } else if (userInput === 'Make Changes') {
          addBotMessage('Tell me what to change and I will adjust.');
        }
        break;
      }
    }
    setIsTyping(false);
  };

  const askBusinessSessions = () => {
    const opts: string[] = [];
    const n = nights || 3;
    for (let i = 1; i <= n; i += 1) opts.push(`Day ${i}`);
    opts.push('Multiple days');
    opts.push('No business sessions');
    addBotMessage('Will there be business session(s)? If so, which day(s)?', { options: opts });
  };

  const askAwards = () => {
    const opts: string[] = [];
    const n = nights || 3;
    for (let i = 1; i <= n; i += 1) opts.push(`Night ${i}`);
    opts.push('No awards dinner');
    addBotMessage('Will there be an awards dinner? If so, which night?', { options: opts });
  };

  const askDineArounds = () => {
    const opts: string[] = [];
    const n = nights || 3;
    for (let i = 1; i <= n; i += 1) opts.push(`Night ${i}`);
    opts.push('Multiple nights');
    opts.push('No dine-arounds');
    addBotMessage('Do you want on-property dine-arounds? If so, which night(s)?', { options: opts });
  };

  const askOtherEvents = () => {
    addBotMessage('Any other program events?', { options: ['No other events', 'Yes, I have other events'] });
  };

  const showSummary = () => {
    const p = state.program;
    const att = state.attendees;
    const occ = state.occupancy;
    const r = state.rooms;
    const ev = state.events;
    const wr = (arr?: number[]) => (arr && arr.length ? arr.join(', ') : 'None');
    const summary = `
      <div class="proposal-summary">
        <h3>Review your draft details:</h3>
        <ul>
          <li><strong>Dates:</strong> ${p.start_date && p.end_date ? `${p.start_date} to ${p.end_date}` : (p.is_flexible ? `Flexible: ${p.flex_start} to ${p.flex_end}` : 'Not set')}</li>
          <li><strong>Nights:</strong> ${p.nights || nights}</li>
          <li><strong>DOW Pattern:</strong> ${p.dow_pattern || 'Any'}</li>
          <li><strong>Attendees:</strong> ${att.count} (${att.confidence || 'Low'} confidence)</li>
          <li><strong>Occupancy:</strong> ${occ.is_double_majority ? 'Double-majority' : 'Single-majority'} · ${occ.double_pct ?? 0}% double</li>
          <li><strong>View Pref:</strong> ${r.view_pref}${r.view_pref === 'Blend' ? ` (${r.view_pct ?? 0}% OV)` : ''}</li>
          <li><strong>Suites:</strong> ${r.suites?.count || 0}</li>
          <li><strong>Satellite Check-in:</strong> ${state.arrival.satellite_checkin?.enabled ? (state.arrival.satellite_checkin?.details || 'Yes') : 'No'}</li>
          <li><strong>Welcome Reception:</strong> ${ev.welcome_reception?.enabled ? (ev.welcome_reception?.details || 'Yes') : 'No'}</li>
          <li><strong>Business Sessions:</strong> ${wr(ev.business?.days)}${ev.business?.details ? ` (${ev.business.details})` : ''}</li>
          <li><strong>Awards Dinner:</strong> ${ev.awards_dinner?.enabled ? `Night ${ev.awards_dinner?.night}` : 'No'}</li>
          <li><strong>Dine-arounds:</strong> ${ev.dine_arounds?.enabled ? `Nights ${wr(ev.dine_arounds?.nights)}` : 'No'}</li>
          <li><strong>Other Events:</strong> ${(ev.custom || []).map(e => `${e.description} (Day ${e.day})`).join(', ') || 'None'}</li>
        </ul>
        <p>Open the editable grid to adjust room blocks and functions before generating visuals.</p>
      </div>
    `;
    addBotMessage(summary, { options: ['Open Editable Grid', 'Make Changes'] });
  };

  const currentMessage = messages[messages.length - 1];

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <Bot size={24} />
        <h2>Hotel AI Quote Assistant</h2>
        <button className="btn-icon" onClick={() => window.location.reload()} title="Start new chat">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map(m => (
          <div key={m.id} className={`message ${m.type}`}>
            <div className="message-avatar">{m.type === 'bot' ? <Bot size={20} /> : <User size={20} />}</div>
            <div className="message-content">
              {m.content.includes('<div') ? (
                <div dangerouslySetInnerHTML={{ __html: m.content }} />
              ) : (
                <p>{m.content}</p>
              )}
              {m.options && (
                <div className="options-container">
                  {m.options.map((opt, i) => (
                    <button key={i} className="option-button" onClick={() => handleOptionClick(opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar"><Bot size={20} /></div>
            <div className="message-content">
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
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
            <button onClick={handleSend} className="btn btn-primary">
              <Send size={18} />
            </button>
          </div>
        )}

        {!currentMessage?.options && currentMessage?.inputType !== 'date' && (
          <div className="input-container">
            <input
              type={currentMessage?.inputType || 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="form-control"
            />
            <button onClick={handleSend} className="btn btn-primary">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HotelQuoteChat;


