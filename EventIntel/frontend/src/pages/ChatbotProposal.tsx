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
    eventPurpose?: string;
    startDate?: string;
    endDate?: string;
    attendeeCount?: number;
    roomsNeeded?: number;
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
  EVENT_NAME: 'event_name',
  EVENT_TYPE: 'event_type',
  EVENT_DATES: 'event_dates',
  ATTENDEE_COUNT: 'attendee_count',
  ROOM_NEEDS: 'room_needs',
  HOTEL_RATING: 'hotel_rating',
  DESTINATION: 'destination',
  RESORT: 'resort',
  MEETING_NEEDS: 'meeting_needs',
  MEETING_SETUP: 'meeting_setup',
  PROGRAM_ELEMENTS: 'program_elements',
  CLIENT_INFO: 'client_info',
  BRANDING: 'branding',
  REVIEW: 'review',
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
      addBotMessage("Hi! I'm here to help you create a perfect event proposal. What's the name of your event?");
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
            formData: { ...prev.formData, eventName: userInput },
            currentStep: CHAT_STEPS.EVENT_TYPE
          }));
          addBotMessage("Great! What type of event is this?", {
            options: ['Corporate Meeting', 'Incentive Trip', 'Conference', 'Company Retreat']
          });
        }
        break;
        
      case CHAT_STEPS.EVENT_TYPE:
        if (userInput) {
          const purposeMap: any = {
            'Corporate Meeting': 'corporate',
            'Incentive Trip': 'incentive',
            'Conference': 'conference',
            'Company Retreat': 'retreat'
          };
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, eventPurpose: purposeMap[userInput] || userInput },
            currentStep: CHAT_STEPS.EVENT_DATES
          }));
          addBotMessage(`Perfect! When are you planning this ${userInput.toLowerCase()}? You can tell me the dates like "March 15-20, 2025" or use the date picker.`, {
            inputType: 'date'
          });
        }
        break;
        
      case CHAT_STEPS.EVENT_DATES:
        if (userInput) {
          // Parse dates - this is simplified, would need better parsing
          const dates = userInput.split(' to ');
          setChatState(prev => ({
            ...prev,
            formData: { 
              ...prev.formData, 
              startDate: dates[0],
              endDate: dates[1] || dates[0]
            },
            currentStep: CHAT_STEPS.ATTENDEE_COUNT
          }));
          addBotMessage("How many people will be attending?", {
            inputType: 'number'
          });
        }
        break;
        
      case CHAT_STEPS.ATTENDEE_COUNT:
        if (userInput) {
          const attendees = parseInt(userInput);
          const estimatedRooms = Math.ceil(attendees / 2);
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, attendeeCount: attendees },
            currentStep: CHAT_STEPS.ROOM_NEEDS
          }));
          addBotMessage(`Based on ${attendees} attendees, I estimate you'll need about ${estimatedRooms} rooms. Does that sound right?`, {
            options: [`Yes, ${estimatedRooms} rooms`, `No, let me specify`]
          });
        }
        break;
        
      case CHAT_STEPS.ROOM_NEEDS:
        if (userInput) {
          if (userInput.includes('Yes')) {
            const rooms = parseInt(userInput.match(/\d+/)?.[0] || '0');
            setChatState(prev => ({
              ...prev,
              formData: { ...prev.formData, roomsNeeded: rooms },
              currentStep: CHAT_STEPS.HOTEL_RATING
            }));
          } else {
            addBotMessage("How many rooms would you like?", {
              inputType: 'number'
            });
            return;
          }
          addBotMessage("What's your preferred hotel rating?", {
            options: ['5-star Luxury', '4-star Premium', 'No preference']
          });
        }
        break;
        
      case CHAT_STEPS.HOTEL_RATING:
        if (userInput) {
          const rating = userInput.includes('5-star') ? '5-star' : userInput.includes('4-star') ? '4-star' : '';
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, hotelRating: rating },
            currentStep: CHAT_STEPS.DESTINATION
          }));
          
          // Show destinations based on event type
          const eventType = chatState.formData.eventPurpose;
          addBotMessage(`Based on your ${eventType} event, here are my top destination recommendations:`, {
            options: destinations.slice(0, 4).map(d => d.name).concat(['Show me more', 'I have a specific place in mind'])
          });
        }
        break;
        
      case CHAT_STEPS.DESTINATION:
        if (userInput) {
          if (userInput === 'Show me more') {
            addBotMessage("Here are more destinations:", {
              options: destinations.slice(4, 8).map(d => d.name)
            });
            return;
          }
          
          const selectedDest = destinations.find(d => d.name === userInput);
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, destinationId: selectedDest?.id },
            currentStep: CHAT_STEPS.RESORT
          }));
          
          // Show hotels/resorts
          const availableHotels = hotels.length > 0 ? hotels : [
            { name: 'Grand Velas Los Cabos', id: 'gv1', description: 'Luxury all-inclusive resort' },
            { name: 'Four Seasons Resort', id: 'fs1', description: 'Premium beachfront property' }
          ];
          
          addBotMessage(`Excellent choice! Here are the best resorts in ${userInput} for your event:`, {
            options: availableHotels.map(h => h.name)
          });
        }
        break;
        
      case CHAT_STEPS.RESORT:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, resortId: userInput },
            currentStep: CHAT_STEPS.MEETING_NEEDS
          }));
          addBotMessage("Will you need meeting spaces for your event?", {
            options: ['Yes, for the full group', 'Yes, with breakout rooms', 'No meeting space needed']
          });
        }
        break;
        
      case CHAT_STEPS.MEETING_NEEDS:
        if (userInput) {
          if (userInput.includes('No meeting')) {
            setChatState(prev => ({
              ...prev,
              currentStep: CHAT_STEPS.PROGRAM_ELEMENTS
            }));
          } else {
            setChatState(prev => ({
              ...prev,
              currentStep: CHAT_STEPS.MEETING_SETUP
            }));
            addBotMessage("What setup style do you prefer?", {
              options: ['Theater Style', 'Banquet Rounds', 'Classroom', 'Reception Style', 'Mixed Setups']
            });
            return;
          }
          showProgramElements();
        }
        break;
        
      case CHAT_STEPS.MEETING_SETUP:
        if (userInput) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, setupPreferences: [userInput] },
            currentStep: CHAT_STEPS.PROGRAM_ELEMENTS
          }));
          showProgramElements();
        }
        break;
        
      case CHAT_STEPS.PROGRAM_ELEMENTS:
        if (selectedOptions.length > 0) {
          setChatState(prev => ({
            ...prev,
            formData: { ...prev.formData, programInclusions: selectedOptions },
            currentStep: CHAT_STEPS.CLIENT_INFO
          }));
          addBotMessage("Almost done! Who should I address this proposal to? Please provide your name, company, and email.", {
            inputType: 'text'
          });
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
            currentStep: CHAT_STEPS.REVIEW
          }));
          showReview();
        }
        break;
        
      case CHAT_STEPS.REVIEW:
        if (userInput === 'Generate Proposal') {
          await createProposal();
        } else if (userInput === 'Make Changes') {
          addBotMessage("What would you like to change? You can tell me, and I'll help you update it.");
          // TODO: Implement change flow
        }
        break;
        
      case CHAT_STEPS.COMPLETE:
        if (userInput === 'View Proposal') {
          const proposalId = localStorage.getItem('lastProposalId');
          if (proposalId) {
            navigate(`/proposal/${proposalId}`);
          }
        } else if (userInput === 'Create Another') {
          startNewChat();
        }
        break;
    }
    
    setIsTyping(false);
  };

  const showProgramElements = () => {
    const eventType = chatState.formData.eventPurpose;
    const defaultSelections = PROGRAM_OPTIONS
      .filter(opt => {
        if (eventType === 'corporate' && opt.id === 'businessMeeting') return true;
        return opt.defaultChecked;
      })
      .map(opt => opt.id);
    
    setSelectedOptions(defaultSelections);
    
    addBotMessage("Which of these would you like included in your program? (Check all that apply)", {
      inputType: 'multiselect'
    });
  };

  const showReview = () => {
    const { formData } = chatState;
    const summary = `
      <div class="proposal-summary">
        <h3>Here's what I've put together:</h3>
        <ul>
          <li><strong>Event:</strong> ${formData.eventName}</li>
          <li><strong>Type:</strong> ${formData.eventPurpose}</li>
          <li><strong>Dates:</strong> ${formData.startDate} to ${formData.endDate}</li>
          <li><strong>Attendees:</strong> ${formData.attendeeCount}</li>
          <li><strong>Rooms:</strong> ${formData.roomsNeeded}</li>
          <li><strong>Program Includes:</strong> ${formData.programInclusions?.join(', ')}</li>
        </ul>
      </div>
    `;
    
    addBotMessage(summary, {
      options: ['Generate Proposal', 'Make Changes']
    });
  };

  const createProposal = async () => {
    try {
      setIsTyping(true);
      addBotMessage("Creating your proposal now...");
      
      const token = localStorage.getItem('token');
      const { formData } = chatState;
      
      // Build proposal payload matching the backend structure
      const proposalPayload = {
        client: {
          name: formData.clientName || '',
          company: formData.clientCompany || '',
          email: formData.clientEmail || ''
        },
        eventDetails: {
          name: formData.eventName || '',
          purpose: formData.eventPurpose || '',
          startDate: formData.startDate || '',
          endDate: formData.endDate || '',
          attendeeCount: formData.attendeeCount || 0,
          roomsNeeded: formData.roomsNeeded || 0,
          hotelRating: formData.hotelRating || ''
        },
        destinationId: formData.destinationId || destinations[0]?.id,
        resortId: formData.resortId || hotels[0]?.id,
        roomTypeIds: formData.roomTypeIds || [],
        eventSpaceIds: formData.eventSpaceIds || [],
        diningIds: formData.diningIds || [],
        flightRouteIds: [],
        spaceSetups: {
          banquet: formData.setupPreferences?.includes('Banquet') || false,
          theater: formData.setupPreferences?.includes('Theater') || false,
          reception: formData.setupPreferences?.includes('Reception') || false
        },
        programInclusions: formData.programInclusions?.reduce((acc: any, inc: string) => {
          acc[inc] = true;
          return acc;
        }, {}) || {},
        branding: {
          primaryColor: formData.primaryColor || '#0066FF',
          secondaryColor: formData.secondaryColor || '#00B8D4',
          theme: formData.theme || 'modern'
        }
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/proposals`,
        proposalPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setChatState(prev => ({
        ...prev,
        currentStep: CHAT_STEPS.COMPLETE
      }));
      
      const proposalId = response.data.id;
      
      addBotMessage("🎉 Your proposal has been created successfully!", {
        options: ['View Proposal', 'Create Another']
      });
      
      // Store proposal ID for viewing
      localStorage.setItem('lastProposalId', proposalId);
      
      // Clear chat session
      localStorage.removeItem('activeChatId');
      localStorage.removeItem(`chat_${chatId.current}`);
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      addBotMessage("Sorry, there was an error creating your proposal. Please try again.");
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
