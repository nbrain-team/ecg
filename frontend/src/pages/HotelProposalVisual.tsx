import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function HotelProposalVisual() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
        const resp = await axios.get(`${apiUrl}/api/proposals/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProposal(resp.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [apiUrl, id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!proposal) return <div className="container">Proposal not found</div>;

  // Simple visual for hotel area; reuse branding colors if present
  const primary = proposal?.branding?.primaryColor || '#1e40af';
  const secondary = proposal?.branding?.secondaryColor || '#06b6d4';

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Visual Proposal</h2>
        <button className="btn btn-outline" onClick={() => navigate(`/hotel/proposal/${id}`)}>Back</button>
      </div>
      <div style={{ marginTop: '1rem', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: primary, color: 'white', padding: '16px' }}>
          <h1 style={{ margin: 0 }}>{proposal?.event_details?.name || proposal?.eventDetails?.name || 'Group Program'}</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>{proposal?.client?.company || 'Hotel Client'}</p>
        </div>
        <div style={{ padding: 16 }}>
          <h3 style={{ color: primary, marginTop: 0 }}>Program Overview</h3>
          <p><strong>Dates:</strong> {proposal?.event_details?.startDate || proposal?.eventDetails?.startDate} to {proposal?.event_details?.endDate || proposal?.eventDetails?.endDate}</p>
          <p><strong>Attendees:</strong> {proposal?.event_details?.attendeeCount || proposal?.eventDetails?.attendeeCount}</p>
          <h3 style={{ color: primary }}>Grid Summary</h3>
          {proposal?.metadata?.grid ? (
            <div>
              <p><strong>Total Room Nights:</strong> {proposal.metadata.grid.totalRoomNights}</p>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Room Nights</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>% Double</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.metadata.grid.rows.map((r: any, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{r.date}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{r.roomNights}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{r.doublePct}%</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{(r.events || []).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No grid data saved yet.</p>
          )}
        </div>
        <div style={{ background: secondary, color: 'white', padding: 8, textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/hotel/proposal/${id}/grid`)}>Edit Grid</button>
        </div>
      </div>
    </div>
  );
}

export default HotelProposalVisual;


