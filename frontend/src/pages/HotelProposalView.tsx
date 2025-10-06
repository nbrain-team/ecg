import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check, Edit, Grid as GridIcon } from 'lucide-react';
import axios from 'axios';
import './ProposalView.css';

function HotelProposalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProposal();
    // Persist last viewed id for grid editor reopen
    if (id) localStorage.setItem('lastHotelProposalId', id);
  }, [id]);

  const normalizeProposal = (raw: any) => {
    if (!raw || typeof raw !== 'object') return null;
    return {
      id: raw.id,
      status: raw.status,
      shareableLink: raw.shareableLink || raw.shareable_link,
      viewCount: raw.viewCount ?? raw.view_count ?? 0,
      lastViewedAt: raw.lastViewedAt || raw.last_viewed_at,
      createdAt: raw.createdAt || raw.created_at,
      updatedAt: raw.updatedAt || raw.updated_at,
      client: raw.client || {},
      eventDetails: raw.eventDetails || raw.event_details || {},
      destination: raw.destination || {},
      resort: raw.resort || {},
      branding: raw.branding || {},
      programFlow: raw.programFlow || raw.program_flow || {},
      selectedRooms: raw.selectedRooms || raw.selected_rooms || [],
      selectedSpaces: raw.selectedSpaces || raw.selected_spaces || [],
      selectedDining: raw.selectedDining || raw.selected_dining || [],
      metadata: raw.metadata || {}
    } as any;
  };

  const fetchProposal = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check environment variables.');
      }
      const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/proposals/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setProposal(normalizeProposal(response.data));
    } catch (error: any) {
      if (error.response?.status === 401) {
        try { localStorage.removeItem('hotelToken'); } catch {}
        navigate('/hotel/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAndOpenVisual = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured.');
      }
      const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/proposals/${id}/publish`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      navigate(`/hotel/proposal/${id}/visual`);
    } catch (error) {
      // Stay on page; could add toast
    }
  };

  const copyShareLink = () => {
    const shareId = proposal?.shareableLink;
    const shareUrl = `${window.location.origin}/proposal/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="error-container">
        <h2>Proposal Not Found</h2>
        <p>The proposal you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/hotel/portal')}>
          Back to Hotel Portal
        </button>
      </div>
    );
  }

  const shareUrl = proposal?.shareableLink ? `${window.location.origin}/proposal/share/${proposal.shareableLink}` : '';

  return (
    <div className="proposal-view">
      <header className="view-header">
        <div className="container">
          <div className="header-content">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/hotel/portal')}
            >
              <ArrowLeft size={20} />
              Back to Hotel Portal
            </button>
            <div className="header-actions">
              <button 
                className="btn btn-outline"
                onClick={() => navigate(`/hotel/proposal/${id}/grid`)}
                title="Edit Grid"
              >
                <GridIcon size={18} />
                Edit Grid
              </button>
              {proposal?.status === 'draft' ? (
                <button 
                  className="btn btn-primary"
                  onClick={handlePublishAndOpenVisual}
                >
                  Publish & Open Visual
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/hotel/proposal/${id}/visual`)}
                >
                  <ExternalLink size={18} />
                  Open Visual
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="view-main">
        <div className="container">
          <div className="proposal-header">
            <h1>{proposal?.eventDetails?.name || 'Untitled Proposal'}</h1>
            <span className={`status-badge ${proposal?.status || 'draft'}`}>
              {proposal?.status || 'draft'}
            </span>
          </div>

          <div className="proposal-grid">
            <div className="proposal-details">
              <section className="detail-section">
                <h2>Client Information</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Company</label>
                    <p>{proposal?.client?.company || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Contact</label>
                    <p>{proposal?.client?.name || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{proposal?.client?.email || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{proposal?.client?.phone || 'N/A'}</p>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h2>Event Details</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Event Type</label>
                    <p>{proposal?.eventDetails?.purpose || '—'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Attendees</label>
                    <p>{proposal?.eventDetails?.attendeeCount ?? '—'}</p>
                  </div>
                  {proposal?.eventDetails?.attendeeConfidence && (
                    <div className="detail-item">
                      <label>Attendee Confidence</label>
                      <p>{proposal?.eventDetails?.attendeeConfidence}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.roomsNeeded && (
                    <div className="detail-item">
                      <label>Rooms Needed</label>
                      <p>{proposal?.eventDetails?.roomsNeeded}</p>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Start Date</label>
                    <p>{proposal?.eventDetails?.startDate ? formatDate(proposal.eventDetails.startDate) : '—'}</p>
                  </div>
                  <div className="detail-item">
                    <label>End Date</label>
                    <p>{proposal?.eventDetails?.endDate ? formatDate(proposal.eventDetails.endDate) : '—'}</p>
                  </div>
                  {proposal?.eventDetails?.datesFlexible !== undefined && (
                    <div className="detail-item">
                      <label>Dates Flexible</label>
                      <p>{proposal?.eventDetails?.datesFlexible ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.flexibleDateRange && (
                    <div className="detail-item">
                      <label>Flexible Date Range</label>
                      <p>{proposal?.eventDetails?.flexibleDateRange}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.numberOfNights !== undefined && (
                    <div className="detail-item">
                      <label>Nights</label>
                      <p>{proposal?.eventDetails?.numberOfNights}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.daysPattern && (
                    <div className="detail-item">
                      <label>Day-of-Week Pattern</label>
                      <p>{proposal?.eventDetails?.daysPattern}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h2>Lodging & Occupancy</h2>
                <div className="detail-grid">
                  {proposal?.eventDetails?.doubleOccupancy !== undefined && (
                    <div className="detail-item">
                      <label>Double Occupancy Majority</label>
                      <p>{proposal?.eventDetails?.doubleOccupancy ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.doublePct !== undefined && (
                    <div className="detail-item">
                      <label>Double Occupancy %</label>
                      <p>{proposal?.eventDetails?.doublePct}%</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.roomView && (
                    <div className="detail-item">
                      <label>Room View Preference</label>
                      <p>{proposal?.eventDetails?.roomView}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.roomViewPct !== undefined && (
                    <div className="detail-item">
                      <label>Ocean View %</label>
                      <p>{proposal?.eventDetails?.roomViewPct}%</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.suiteCount !== undefined && (
                    <div className="detail-item">
                      <label>Suites Needed</label>
                      <p>{proposal?.eventDetails?.suiteCount}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h2>Arrival & Check-in</h2>
                <div className="detail-grid">
                  {proposal?.eventDetails?.privateSatelliteCheckIn !== undefined && (
                    <div className="detail-item">
                      <label>Private Satellite Check-in</label>
                      <p>{proposal?.eventDetails?.privateSatelliteCheckIn ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.satelliteCheckInDetails && (
                    <div className="detail-item">
                      <label>Satellite Check-in Details</label>
                      <p>{proposal?.eventDetails?.satelliteCheckInDetails}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h2>Program Events</h2>
                <div className="detail-grid">
                  {proposal?.eventDetails?.welcomeReception !== undefined && (
                    <div className="detail-item">
                      <label>Welcome Reception</label>
                      <p>{proposal?.eventDetails?.welcomeReception ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.welcomeReceptionDetails && (
                    <div className="detail-item">
                      <label>Welcome Reception Details</label>
                      <p>{proposal?.eventDetails?.welcomeReceptionDetails}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.businessSessions && proposal.eventDetails.businessSessions.length > 0 && (
                    <div className="detail-item">
                      <label>Business Sessions</label>
                      <p>
                        Days {proposal.eventDetails.businessSessions.map((s: any) => s.day).join(', ')}
                        {proposal.eventDetails.businessSessions[0]?.description ? ` (${proposal.eventDetails.businessSessions[0].description})` : ''}
                      </p>
                    </div>
                  )}
                  {proposal?.eventDetails?.awardsDinner && (
                    <div className="detail-item">
                      <label>Awards Dinner</label>
                      <p>{`Night ${proposal.eventDetails.awardsDinner.night}`}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.dineArounds && proposal.eventDetails.dineArounds.nights?.length > 0 && (
                    <div className="detail-item">
                      <label>Dine-arounds</label>
                      <p>Nights {proposal.eventDetails.dineArounds.nights.join(', ')}</p>
                    </div>
                  )}
                  {proposal?.eventDetails?.otherEvents && proposal.eventDetails.otherEvents.length > 0 && (
                    <div className="detail-item">
                      <label>Other Events</label>
                      <p>{proposal.eventDetails.otherEvents.map((e: any) => `${e.description} (Day ${e.day})`).join(', ')}</p>
                    </div>
                  )}
                </div>
              </section>

              {proposal?.programFlow?.programInclusions && (
                <section className="detail-section">
                  <h2>Program Inclusions</h2>
                  <div className="detail-grid">
                    {Object.entries(proposal.programFlow.programInclusions).map(([key, val]: any) => (
                      <div key={key} className="detail-item">
                        <label>{key}</label>
                        <p>{val ? 'Included' : '—'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="detail-section">
                <h2>Destination & Resort</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Destination</label>
                    <p>{proposal?.destination?.name || '—'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Resort</label>
                    <p>{proposal?.resort?.name || '—'}</p>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h2>Branding</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Primary Color</label>
                    <p>{proposal?.branding?.primaryColor || '—'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Secondary Color</label>
                    <p>{proposal?.branding?.secondaryColor || '—'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Theme</label>
                    <p>{proposal?.branding?.theme || '—'}</p>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h2>Analytics</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>View Count</label>
                    <p>{proposal?.viewCount || 0} views</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Viewed</label>
                    <p>{proposal?.lastViewedAt ? formatDate(proposal.lastViewedAt) : 'Never'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Created</label>
                    <p>{proposal?.createdAt ? formatDate(proposal.createdAt) : '—'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Updated</label>
                    <p>{proposal?.updatedAt ? formatDate(proposal.updatedAt) : '—'}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="proposal-sidebar">
              <div className="share-section">
                <h3>Share Proposal</h3>
                {proposal?.status !== 'draft' && proposal?.shareableLink ? (
                  <>
                    <div className="share-url">
                      <input 
                        type="text" 
                        value={shareUrl} 
                        readOnly 
                        className="url-input"
                      />
                      <button 
                        className="copy-btn"
                        onClick={copyShareLink}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <a 
                      href={shareUrl || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-block"
                    >
                      <ExternalLink size={18} />
                      View Public Proposal
                    </a>
                  </>
                ) : (
                  <p className="share-note">
                    Publish to generate a shareable client link.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HotelProposalView;


