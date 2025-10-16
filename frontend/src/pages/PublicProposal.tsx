import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Hotel, Utensils, Plane, Building, Star } from 'lucide-react';
import axios from 'axios';
import './PublicProposal.css';

interface ProposalData {
  id: string;
  client: any;
  eventDetails: any;
  destination: any;
  resort: any;
  selectedRooms: any[];
  selectedSpaces: any[];
  selectedDining: any[];
  flightRoutes: any[];
  branding: any;
  generatedContent: any;
}

function PublicProposal() {
  const { shareId } = useParams();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    fetchProposal();
  }, [shareId]);

  useEffect(() => {
    // Apply branding colors if available
    if (proposal?.branding) {
      document.documentElement.style.setProperty('--proposal-primary', proposal.branding.primaryColor || '#1e40af');
      document.documentElement.style.setProperty('--proposal-secondary', proposal.branding.secondaryColor || '#06b6d4');
    }
  }, [proposal]);

  const fetchProposal = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/proposals/share/${shareId}`);
      console.log('Fetched proposal data:', response.data);
      setProposal(response.data);
    } catch (error: any) {
      console.error('Error fetching proposal:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="proposal-loading">
        <div className="spinner"></div>
        <p>Loading your proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="proposal-error">
        <h2>Proposal Not Found</h2>
        <p>The proposal you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    // Parse as UTC to avoid timezone issues
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="public-proposal">
      {/* Navigation */}
      <nav className="proposal-nav">
        <div className="nav-content">
          {proposal.branding?.logoUrl ? (
            <img src={proposal.branding.logoUrl} alt={proposal.client.company} className="nav-logo" />
          ) : (
            <div className="nav-brand">{proposal.client.company}</div>
          )}
          <div className="nav-menu">
            <a href="#overview" className={activeSection === 'overview' ? 'active' : ''}>Overview</a>
            <a href="#destination" className={activeSection === 'destination' ? 'active' : ''}>Destination</a>
            <a href="#resort" className={activeSection === 'resort' ? 'active' : ''}>Resort</a>
            <a href="#accommodations" className={activeSection === 'accommodations' ? 'active' : ''}>Accommodations</a>
            <a href="#spaces" className={activeSection === 'spaces' ? 'active' : ''}>Event Spaces</a>
            <a href="#dining" className={activeSection === 'dining' ? 'active' : ''}>Dining</a>
            <a href="#travel" className={activeSection === 'travel' ? 'active' : ''}>Travel</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="proposal-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">{proposal.generatedContent?.heroTitle || proposal.eventDetails.name}</h1>
            <p className="hero-subtitle">{proposal.generatedContent?.heroSubtitle || `${formatDate(proposal.eventDetails.startDate)} - ${formatDate(proposal.eventDetails.endDate)}`}</p>
            <div className="hero-stats">
              <div className="stat">
                <Users size={20} />
                <span>{proposal.eventDetails.attendeeCount} Attendees</span>
              </div>
              <div className="stat">
                <MapPin size={20} />
                <span>{proposal.destination.name}, {proposal.destination.country}</span>
              </div>
              <div className="stat">
                <Calendar size={20} />
                <span>{Math.ceil((new Date(proposal.eventDetails.endDate).getTime() - new Date(proposal.eventDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="proposal-section">
        <div className="section-container">
          <h2 className="section-title">Event Overview</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>About This Event</h3>
              <p>{proposal.generatedContent?.destinationOverview || `Join us for an unforgettable ${proposal.eventDetails.purpose} experience in ${proposal.destination.name}.`}</p>
            </div>
            <div className="overview-card">
              <h3>Key Details</h3>
              <ul className="details-list">
                <li><strong>Event Type:</strong> {proposal.eventDetails.purpose}</li>
                <li><strong>Duration:</strong> {Math.ceil((new Date(proposal.eventDetails.endDate).getTime() - new Date(proposal.eventDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days</li>
                <li><strong>Group Size:</strong> {proposal.eventDetails.attendeeCount} attendees</li>
                <li><strong>Venue:</strong> {proposal.resort?.name || 'Venue TBD'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Section */}
      <section id="destination" className="proposal-section destination-section">
        <div className="section-container">
          <h2 className="section-title">Destination: {proposal.destination.name}</h2>
          <div className="destination-hero">
            <img src={proposal.destination.imageUrl} alt={proposal.destination.name} />
            <div className="destination-overlay">
              <h3>{proposal.destination.name}</h3>
              <p>{proposal.destination.description}</p>
            </div>
          </div>
          
          <div className="destination-details">
            <div className="detail-card">
              <h4>Climate & Weather</h4>
              <p>{proposal.destination.climate}</p>
              <p>Average Temperature: {proposal.destination.weatherInfo?.avgTemp}°F</p>
              <p>Best Months: {proposal.destination.weatherInfo?.bestMonths?.join(', ')}</p>
            </div>
            <div className="detail-card">
              <h4>Getting There</h4>
              <p>{proposal.destination.flightInfo?.avgFlightTime}</p>
              <p>Main Airport: {proposal.destination.flightInfo?.majorAirports?.[0]}</p>
            </div>
            <div className="detail-card">
              <h4>Highlights</h4>
              <ul>
                {proposal.destination.highlights?.map((highlight: string, index: number) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Resort Section */}
      {proposal.resort && (
      <section id="resort" className="proposal-section resort-section">
        <div className="section-container">
          <h2 className="section-title">{proposal.resort?.name || 'Resort Information'}</h2>
          <div className="resort-header">
            <div className="resort-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill={i < (proposal.resort?.rating || 0) ? 'currentColor' : 'none'} />
              ))}
              <span className="price-range">{proposal.resort?.priceRange || ''}</span>
            </div>
          </div>
          
          <p className="resort-description">{proposal.generatedContent?.resortHighlight || proposal.resort?.description || 'Resort description coming soon.'}</p>
          
          {/* Enhanced gallery with full-width hero image */}
          {proposal.resort?.images?.length > 0 && (
            <div className="resort-gallery-enhanced">
              <div className="gallery-hero">
                <img src={proposal.resort.images[0]} alt={proposal.resort?.name || 'Resort'} />
                <div className="gallery-overlay">
                  <h3>Welcome to Paradise</h3>
                  <p>Experience luxury redefined at {proposal.resort?.name || 'this resort'}</p>
                </div>
              </div>
              {proposal.resort?.images?.length > 1 && (
                <div className="gallery-grid">
                  {proposal.resort?.images?.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="gallery-item">
                      <img src={image} alt={`${proposal.resort?.name || 'Resort'} ${index + 2}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="resort-features">
            <h3>Resort Features & Amenities</h3>
            <div className="features-grid">
              {proposal.resort.features?.map((feature: string, index: number) => (
                <div key={index} className="feature-item">
                  <Building size={16} />
                  <span>{feature}</span>
                </div>
              ))}
              {proposal.resort.amenities?.map((amenity: string, index: number) => (
                <div key={`amenity-${index}`} className="feature-item">
                  <Building size={16} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Accommodations Section */}
      <section id="accommodations" className="proposal-section">
        <div className="section-container">
          <h2 className="section-title">Accommodations</h2>
          <div className="rooms-grid">
            {proposal.selectedRooms?.map(room => (
              <div key={room.id} className="room-card">
                <img src={room.images[0]} alt={room.name} />
                <div className="room-content">
                  <h3>{room.name}</h3>
                  <p className="room-size">{room.size} • {room.view} View</p>
                  <p className="room-description">{room.description}</p>
                  <div className="room-amenities">
                    {room.amenities?.slice(0, 3).map((amenity: string, index: number) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Spaces Section */}
      <section id="spaces" className="proposal-section">
        <div className="section-container">
          <h2 className="section-title">Event Spaces</h2>
          <div className="spaces-grid">
            {proposal.selectedSpaces?.map(space => (
              <div key={space.id} className="space-card">
                <img src={space.imageUrl} alt={space.name} />
                <div className="space-content">
                  <h3>{space.name}</h3>
                  <div className="space-specs">
                    <span><Users size={16} /> {space.capacity} guests</span>
                    <span><Building size={16} /> {space.sqft} sq ft</span>
                  </div>
                  <div className="space-features">
                    {space.features?.map((feature: string, index: number) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining Section */}
      <section id="dining" className="proposal-section dining-section">
        <div className="section-container">
          <h2 className="section-title">Dining Experiences</h2>
          <p className="section-intro">{proposal.generatedContent?.diningDescription}</p>
          <div className="dining-grid">
            {proposal.selectedDining?.map(dining => (
              <div key={dining.id} className="dining-card">
                <img src={dining.imageUrl} alt={dining.name} />
                <div className="dining-content">
                  <h3>{dining.name}</h3>
                  <p className="cuisine-type">{dining.cuisine}</p>
                  <p className="dining-description">{dining.description}</p>
                  <div className="dining-details">
                    <span className="hours">{dining.hours}</span>
                    <span className="dress-code">{dining.dressCode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Section */}
      <section id="travel" className="proposal-section">
        <div className="section-container">
          <h2 className="section-title">Travel Information</h2>
          <p className="travel-intro">{proposal.generatedContent?.travelInfo}</p>
          <div className="flights-list">
            {proposal.flightRoutes?.map(flight => (
              <div key={flight.id} className="flight-card">
                <div className="flight-route">
                  <Plane size={20} />
                  <h4>{flight.originCity} → {proposal.destination.name}</h4>
                </div>
                <div className="flight-details">
                  <span>{flight.airline}</span>
                  <span>{flight.duration}</span>
                  <span>{flight.directFlight ? 'Direct' : 'Connecting'}</span>
                  <span>{flight.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="proposal-cta">
        <div className="cta-content">
          <h2>Ready to Move Forward?</h2>
          <p>Contact us to discuss this proposal and customize it to your needs.</p>
          <div className="cta-buttons">
            <a href={`mailto:${proposal.client.email}?subject=Re: ${proposal.eventDetails.name}`} className="btn btn-primary">
              Contact Us
            </a>
            <button onClick={() => window.print()} className="btn btn-outline">
              Download PDF
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="proposal-footer">
        <p>© 2024 {proposal.client.company} • Powered by ECG Intelligence</p>
        <p>Event Connections Group • <a href="https://eventconnectionsgroup.com">www.eventconnectionsgroup.com</a></p>
      </footer>
    </div>
  );
}

export default PublicProposal; 