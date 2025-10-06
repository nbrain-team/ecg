import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface ProposalData {
  id: string;
  client: {
    name: string;
    company: string;
    email: string;
    phone?: string;
    logoUrl?: string;
  };
  eventDetails: {
    name: string;
    purpose?: string;
    startDate: string;
    endDate: string;
    attendeeCount: number;
  };
  destination: {
    name: string;
    country?: string;
    imageUrl?: string;
    description?: string;
  };
  resort?: {
    name?: string;
    description?: string;
    images?: string[];
  };
  selectedRooms: Array<{
    id: string;
    name: string;
    description?: string;
    images: string[];
    size?: string;
    view?: string;
    capacity?: number;
    amenities?: string[];
    category?: string;
  }>;
}

function PublicProposalModern() {
  const { shareId } = useParams();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = '/proposal-design.css';
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/proposals/share/${shareId}`);
        const raw = response.data || {};
        const normalized: ProposalData = {
          id: raw.id,
          client: raw.client || {},
          eventDetails: raw.eventDetails || raw.event_details || {},
          destination: raw.destination || {},
          resort: raw.resort || {},
          selectedRooms: raw.selectedRooms || raw.selected_rooms || []
        } as any;
        setProposal(normalized);
      } catch (err) {
        setProposal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [shareId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading your proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>Proposal Not Found</h2>
        <p>The proposal you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const headerImage = proposal?.resort?.images?.[0] || proposal?.destination?.imageUrl || '/images/hotel-overview.webp';
  const eventSubtitle = `${proposal?.eventDetails?.startDate ? formatDate(proposal.eventDetails.startDate) : ''}${proposal?.eventDetails?.endDate ? ` - ${formatDate(proposal.eventDetails.endDate)}` : ''}${proposal?.eventDetails?.attendeeCount ? ` • ${proposal.eventDetails.attendeeCount} Attendees` : ''}`;

  return (
    <div>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="top-bar-title">{proposal?.resort?.name || 'Event Proposal'}</div>
          <button className="save-button" onClick={() => window.print()}>Download PDF</button>
        </div>
      </div>

      {/* Header Section */}
      <header className="proposal-header">
        <div className="header-background" style={{ backgroundImage: `url('${headerImage}')` }} />
        <div className="header-content">
          <h1 className="company-name">
            {proposal?.client?.company || 'Your Company'}
            <span className="company-subtitle"></span>
          </h1>
          <h2 className="event-name">{(proposal?.eventDetails?.name || 'Event Proposal').replace(' + ', ' ')}</h2>
          <p className="event-subtitle">{eventSubtitle}</p>
          <div className="header-ecg-logo">
            <img src="/images/ecg-logo.avif" alt="ECG" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="proposal-content">
        <div className="section-header">
          <h2 className="section-title">Your Event Experience</h2>
          <p className="section-subtitle">{proposal?.destination?.name || ''}{proposal?.destination?.country ? ` • ${proposal.destination.country}` : ''}</p>
        </div>

        {/* Rooms Section */}
        {proposal?.selectedRooms?.length > 0 && (
          <div className="rooms-container">
            {proposal.selectedRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-images">
                  <div className="room-main-image">
                    <img src={room?.images?.[0] || ''} alt={room?.name || ''} />
                  </div>
                  <div className="room-thumbnails">
                    <div className="room-thumbnail">
                      <img src={room?.images?.[1] || room?.images?.[0] || ''} alt={`${room?.name || 'Room'} alt view`} />
                    </div>
                    <div className="room-thumbnail">
                      <img src={room?.images?.[2] || room?.images?.[0] || ''} alt={`${room?.name || 'Room'} amenities`} />
                    </div>
                  </div>
                </div>
                <div className="room-info">
                  <div className="room-header">
                    <div>
                      <h3 className="room-name">{room?.name || 'Room'}</h3>
                      {room?.category && <p className="room-category">{room.category}</p>}
                    </div>
                    <div className="room-capacity">
                      {room?.capacity ? (
                        <>
                          <div className="capacity-number">{room?.capacity}</div>
                          <div className="capacity-label">SLEEPS</div>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {room?.description && (
                    <p className="room-description">{room?.description}</p>
                  )}
                  <div className="room-features">
                    {room?.amenities?.slice(0, 4).map((a, i) => (
                      <div key={i} className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="room-details">
                    {room?.capacity !== undefined && (
                      <div className="detail-item">
                        <div className="detail-label">Capacity</div>
                        <div className="detail-value">{room?.capacity} guests</div>
                      </div>
                    )}
                    {room?.view && (
                      <div className="detail-item">
                        <div className="detail-label">View Type</div>
                        <div className="detail-value">{room?.view}</div>
                      </div>
                    )}
                    {room?.size && (
                      <div className="detail-item">
                        <div className="detail-label">Suite Size</div>
                        <div className="detail-value">{room?.size}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Section */}
        <section className="summary-section">
          <div className="summary-content">
            <h3 className="section-title" style={{ marginBottom: 0 }}>Program Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">{proposal?.eventDetails?.attendeeCount ?? ''}</div>
                <div className="summary-label">Attendees</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{proposal?.destination?.name || ''}</div>
                <div className="summary-label">Destination</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{proposal?.resort?.name || 'TBD'}</div>
                <div className="summary-label">Resort</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="proposal-footer">
        <div className="footer-content">
          <div className="footer-logo">{proposal?.client?.company || ''}</div>
          <div className="footer-info">
            <p>© {new Date().getFullYear()} {proposal?.client?.company || ''} • Powered by ECG Intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicProposalModern;


