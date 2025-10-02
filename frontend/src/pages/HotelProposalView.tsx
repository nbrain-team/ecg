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
        navigate('/hotel/login');
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


