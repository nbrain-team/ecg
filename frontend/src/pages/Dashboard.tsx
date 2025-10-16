import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, LogOut, Calendar, Users, MapPin } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

interface DashboardProps {
  onLogout: () => void;
}

interface Proposal {
  id: string;
  client: { name: string; company: string };
  eventDetails: { 
    name: string; 
    startDate: string; 
    endDate: string; 
    attendeeCount: number;
  };
  destination: { name: string };
  status: 'draft' | 'published' | 'viewed';
  createdAt: string;
  viewCount: number;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Check for saved draft
    const savedDraft = localStorage.getItem('proposalDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setHasDraft(true);
        setDraftInfo(draft);
      } catch (e) {
        console.error('Error loading draft info:', e);
      }
    }

    // Fetch proposals
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${apiUrl}/api/proposals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProposals(response.data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      await axios.delete(`${apiUrl}/api/proposals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProposals(proposals.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'badge-warning',
      published: 'badge-success',
      viewed: 'badge-primary'
    };
    return badges[status as keyof typeof badges] || 'badge';
  };

  const formatDate = (dateString: string) => {
    // Parse as UTC to avoid timezone issues
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>ECG Intelligence</h1>
              <span className="welcome-text">
                Welcome back, {user?.name || 'User'}
              </span>
            </div>
            <div className="header-right">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/proposal/chat')}
              >
                <Plus size={20} />
                Chat Assistant
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/proposal/new')}
              >
                <Plus size={20} />
                Form Builder
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{proposals.length}</h3>
              <p>Total Proposals</p>
            </div>
            <div className="stat-card">
              <h3>{proposals.filter(p => p.status === 'published').length}</h3>
              <p>Published</p>
            </div>
            <div className="stat-card">
              <h3>{proposals.filter(p => p.status === 'viewed').length}</h3>
              <p>Viewed</p>
            </div>
            <div className="stat-card">
              <h3>{proposals.reduce((sum, p) => sum + (p.viewCount || 0), 0)}</h3>
              <p>Total Views</p>
            </div>
          </div>

          <div className="proposals-section">
            <h2>Your Proposals</h2>
            
            {/* Draft Notification */}
            {hasDraft && draftInfo && (
              <div className="draft-notification">
                <div className="draft-info">
                  <h4>Continue where you left off</h4>
                  <p>You have an unsaved proposal draft from {new Date(draftInfo.savedAt).toLocaleDateString()}</p>
                  <p className="draft-details">
                    {draftInfo.formData?.eventName ? `Event: ${draftInfo.formData.eventName}` : 'Untitled Event'} • 
                    Step {draftInfo.currentStep} of 10
                  </p>
                </div>
                <div className="draft-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/proposal/new')}
                  >
                    Continue Editing
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      localStorage.removeItem('proposalDraft');
                      setHasDraft(false);
                      setDraftInfo(null);
                    }}
                  >
                    Discard Draft
                  </button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : proposals.length === 0 ? (
              <div className="empty-state">
                <h3>No proposals yet</h3>
                <p>Create your first proposal to get started</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/proposal/new')}
                >
                  <Plus size={20} />
                  Create Proposal
                </button>
              </div>
            ) : (
              <div className="proposals-grid">
                {proposals.map(proposal => (
                  <div key={proposal.id} className="proposal-card">
                    <div className="proposal-header">
                      <h3>{proposal.eventDetails.name}</h3>
                      <span className={`badge ${getStatusBadge(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>
                    
                    <div className="proposal-client">
                      <strong>{proposal.client.company}</strong>
                      <span>{proposal.client.name}</span>
                    </div>
                    
                    <div className="proposal-details">
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{proposal.destination.name}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>
                          {formatDate(proposal.eventDetails.startDate)} - 
                          {formatDate(proposal.eventDetails.endDate)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <Users size={16} />
                        <span>{proposal.eventDetails.attendeeCount} attendees</span>
                      </div>
                    </div>
                    
                    <div className="proposal-stats">
                      <span className="view-count">
                        <Eye size={16} />
                        {proposal.viewCount || 0} views
                      </span>
                      <span className="created-date">
                        Created {formatDate(proposal.createdAt)}
                      </span>
                    </div>
                    
                    <div className="proposal-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/proposal/${proposal.id}`)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/proposal/${proposal.id}/edit`)}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(proposal.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 