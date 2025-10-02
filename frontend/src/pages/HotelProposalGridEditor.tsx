import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface GridRow {
  date: string;
  day: number;
  roomNights: number;
  doublePct: number;
  suites: number;
  events: string[];
}

function HotelProposalGridEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRow[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
        const resp = await axios.get(`${apiUrl}/api/proposals/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const r = resp.data || {};
        const metaRows = r?.metadata?.grid?.rows;
        if (Array.isArray(metaRows) && metaRows.length > 0) {
          setRows(metaRows);
        } else {
          // Try to build from the draft if available (fallback)
          const draftRaw = localStorage.getItem('hotel_quote_draft');
          if (draftRaw) {
            const draft = JSON.parse(draftRaw);
            const nights: number = draft?.program?.nights || 3;
            const baseDate: string = draft?.program?.start_date || '2025-01-01';
            const attendeeCount: number = draft?.attendees?.count || 0;
            const doublePct: number = draft?.occupancy?.double_pct ?? 50;
            const suites: number = draft?.rooms?.suites?.count || 0;
            const estimatedRooms = Math.max(1, Math.round(attendeeCount * (1 - doublePct / 200)));
            const initial: GridRow[] = Array.from({ length: nights }).map((_, i) => ({
              date: new Date(new Date(baseDate).getTime() + i * 86400000).toISOString().split('T')[0],
              day: i + 1,
              roomNights: estimatedRooms,
              doublePct,
              suites,
              events: []
            }));
            setRows(initial);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiUrl, id]);

  const totalRoomNights = useMemo(() => rows.reduce((acc, r) => acc + r.roomNights, 0), [rows]);

  const saveGrid = async () => {
    const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const payload = { metadata: { grid: { rows, totalRoomNights } } } as any;
    await axios.put(`${apiUrl}/api/proposals/${id}`, payload, { headers });
    navigate(`/hotel/proposal/${id}`);
  };

  if (loading) return <div className="container">Loading grid...</div>;

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h2>Edit Grid</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Day</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Room Nights</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>% Double</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Suites</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Events</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{r.date}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>Day {r.day}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                  <input
                    className="form-control"
                    type="number"
                    value={r.roomNights}
                    onChange={(e) => {
                      const value = Math.max(0, parseInt(e.target.value || '0', 10));
                      setRows(prev => prev.map((row, i) => (i === idx ? { ...row, roomNights: value } : row)));
                    }}
                    style={{ width: 120 }}
                  />
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                  <input
                    className="form-control"
                    type="number"
                    value={r.doublePct}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, parseInt(e.target.value || '0', 10)));
                      setRows(prev => prev.map((row, i) => (i === idx ? { ...row, doublePct: value } : row)));
                    }}
                    style={{ width: 120 }}
                  />
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                  <input
                    className="form-control"
                    type="number"
                    value={r.suites}
                    onChange={(e) => {
                      const value = Math.max(0, parseInt(e.target.value || '0', 10));
                      setRows(prev => prev.map((row, i) => (i === idx ? { ...row, suites: value } : row)));
                    }}
                    style={{ width: 120 }}
                  />
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                  <input
                    className="form-control"
                    type="text"
                    value={r.events.join(', ')}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setRows(prev => prev.map((row, i) => (i === idx ? { ...row, events: arr } : row)));
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px', fontWeight: 600 }}>Total: {totalRoomNights}</td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="builder-actions" style={{ marginTop: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate(`/hotel/proposal/${id}`)}>Cancel</button>
        <button className="btn btn-primary" onClick={saveGrid} style={{ marginLeft: '0.5rem' }}>Save Grid</button>
      </div>
    </div>
  );
}

export default HotelProposalGridEditor;


