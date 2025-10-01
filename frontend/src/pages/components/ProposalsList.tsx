import { useEffect, useState } from 'react';
import axios from 'axios';

interface ProposalRow {
  id: string;
  name: string;
  createdAt?: string;
  shareId?: string;
}

function ProposalsList() {
  const apiUrl = (import.meta as any).env?.VITE_API_URL || '';
  const [rows, setRows] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const hotelToken = localStorage.getItem('hotelToken');
        const headers = { Authorization: `Bearer ${hotelToken}` };
        // If there's an API endpoint for hotel proposals, use it; fallback to proposals list
        const resp = await axios.get(`${apiUrl}/api/proposals`, { headers }).catch(() => ({ data: [] }));
        const list = Array.isArray(resp.data) ? resp.data : [];
        setRows(list.map((p:any) => ({ id: p.id, name: p.eventDetails?.name || p.name || `Proposal ${p.id}`, createdAt: p.createdAt, shareId: p.shareId || p.share_id })));
      } catch (e:any) {
        setError(e.response?.data?.message || 'Failed to load proposals');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  if (!rows.length) return <div>No proposals yet.</div>;

  return (
    <div className="selection-grid">
      {rows.map(p => (
        <div key={p.id} className="selection-card">
          <div className="card-content">
            <h4>{p.name}</h4>
            <p className="description">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</p>
            <div className="card-actions">
              {p.shareId && (
                <a className="btn btn-primary" href={`/proposal/share/${p.shareId}`} target="_blank" rel="noreferrer">View</a>
              )}
              <a className="btn btn-outline" href={`/proposal/${p.id}`}>Open</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProposalsList;



