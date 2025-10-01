import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import './ProposalView.css';

function ProposalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check environment variables.');
      }
      const token = localStorage.getItem('token');
      
      console.log('Fetching proposal with ID:', id);
      console.log('API URL:', apiUrl);
      console.log('Token exists:', !!token);
      
      const response = await axios.get(`${apiUrl}/api/proposals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Proposal fetched successfully:', response.data);
      setProposal(response.data);
    } catch (error: any) {
      console.error('Error fetching proposal:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show more detailed error in the UI
      if (error.response?.status === 404) {
        console.error('Proposal not found with ID:', id);
      } else if (error.response?.status === 401) {
        console.error('Authentication failed - redirecting to login');
        navigate('/login');
      } else {
        console.error('Unexpected error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check environment variables.');
      }
      const token = localStorage.getItem('token');
      
      await axios.post(`${apiUrl}/api/proposals/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh proposal data
      fetchProposal();
    } catch (error) {
      console.error('Error publishing proposal:', error);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/proposal/share/${proposal.shareableLink}`;
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
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/proposal/share/${proposal.shareableLink}`;

  return (
    <div className="proposal-view">
      <header className="view-header">
        <div className="container">
          <div className="header-content">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <div className="header-actions">
              <button 
                className="btn btn-outline"
                onClick={() => navigate(`/proposal/${id}/edit`)}
              >
                <Edit size={20} />
                Edit
              </button>
              {proposal.status === 'draft' && (
                <button 
                  className="btn btn-primary"
                  onClick={handlePublish}
                >
                  Publish Proposal
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="view-main">
        <div className="container">
          <div className="proposal-header">
            <h1>{proposal.eventDetails.name}</h1>
            <span className={`status-badge ${proposal.status}`}>
              {proposal.status}
            </span>
          </div>

          <div className="proposal-grid">
            <div className="proposal-details">
              <section className="detail-section">
                <h2>Client Information</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Company</label>
                    <p>{proposal.client.company}</p>
                  </div>
                  <div className="detail-item">
                    <label>Contact</label>
                    <p>{proposal.client.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{proposal.client.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{proposal.client.phone || 'N/A'}</p>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h2>Event Details</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Event Type</label>
                    <p>{proposal.eventDetails.purpose}</p>
                  </div>
                  <div className="detail-item">
                    <label>Attendees</label>
                    <p>{proposal.eventDetails.attendeeCount}</p>
                  </div>
                  {proposal.eventDetails.roomsNeeded && (
                    <div className="detail-item">
                      <label>Rooms Needed</label>
                      <p>{proposal.eventDetails.roomsNeeded}</p>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Start Date</label>
                    <p>{formatDate(proposal.eventDetails.startDate)}</p>
                  </div>
                  <div className="detail-item">
                    <label>End Date</label>
                    <p>{formatDate(proposal.eventDetails.endDate)}</p>
                  </div>
                  {proposal.eventDetails.programLengthDays && (
                    <div className="detail-item">
                      <label>Program Length</label>
                      <p>{proposal.eventDetails.programLengthDays} days</p>
                    </div>
                  )}
                  {(proposal.eventDetails.hotelRating || proposal.eventDetails.ratingStandard) && (
                    <div className="detail-item">
                      <label>Hotel Rating</label>
                      <p>
                        {proposal.eventDetails.hotelRating || 'N/A'}
                        {proposal.eventDetails.ratingStandard ? ` (${proposal.eventDetails.ratingStandard === 'aaa' ? 'AAA' : 'Forbes'})` : ''}
                      </p>
                    </div>
                  )}
                  {proposal.eventDetails.roomPreferences && (
                    <div className="detail-item">
                      <label>Room Preferences</label>
                      <p>
                        {proposal.eventDetails.roomPreferences.kingRooms} King, {proposal.eventDetails.roomPreferences.doubleRooms} Double/Queen
                        {proposal.eventDetails.roomPreferences.suitesNotes ? ` — ${proposal.eventDetails.roomPreferences.suitesNotes}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h2>Location & Venue</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Destination</label>
                    <p>{proposal.destination.name}, {proposal.destination.country}</p>
                  </div>
                  <div className="detail-item">
                    <label>Resort</label>
                    <p>{proposal.resort.name}</p>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h2>Analytics</h2>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>View Count</label>
                    <p>{proposal.viewCount || 0} views</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Viewed</label>
                    <p>{proposal.lastViewedAt ? formatDate(proposal.lastViewedAt) : 'Never'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Created</label>
                    <p>{formatDate(proposal.createdAt)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Updated</label>
                    <p>{formatDate(proposal.updatedAt)}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="proposal-sidebar">
              <div className="share-section">
                <h3>Share Proposal</h3>
                {proposal.status === 'published' || proposal.status === 'viewed' ? (
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
                      href={shareUrl} 
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
                    Publish this proposal to generate a shareable link for your client.
                  </p>
                )}
              </div>

              {proposal.branding?.logoUrl && (
                <div className="branding-preview">
                  <h3>Client Logo</h3>
                  <img src={proposal.branding.logoUrl} alt="Client Logo" />
                </div>
              )}

              <div className="branding-colors">
                <h3>Brand Colors</h3>
                <div className="color-preview">
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: proposal.branding?.primaryColor || '#1e40af' }}
                  />
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: proposal.branding?.secondaryColor || '#06b6d4' }}
                  />
                </div>
                <p className="theme-name">Theme: {proposal.branding?.theme || 'modern'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProposalView; 