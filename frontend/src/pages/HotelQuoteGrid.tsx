import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GridRow {
  date: string;
  day: number;
  roomNights: number;
  doublePct: number; // percentage of doubles on that night
  suites: number;
  events: string[];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function HotelQuoteGrid() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRow[]>([]);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const draftRaw = localStorage.getItem('hotel_quote_draft');
    if (!draftRaw) {
      navigate('/hotel/ai-quote');
      return;
    }
    const draft = JSON.parse(draftRaw || '{}');
    setMeta(draft);
    const nights: number = draft?.program?.nights || 3;
    const baseDate: string = draft?.program?.start_date || '2025-01-01';
    const attendeeCount: number = draft?.attendees?.count || 0;
    const doublePct: number = draft?.occupancy?.double_pct ?? 50;
    const suites: number = draft?.rooms?.suites?.count || 0;

    // naive room nights estimate: attendees / 2 for doubles, adjust for singles based on pct
    const estimatedRooms = Math.max(1, Math.round(attendeeCount * (1 - doublePct / 200)));

    const initial: GridRow[] = Array.from({ length: nights }).map((_, i) => ({
      date: addDays(baseDate, i),
      day: i + 1,
      roomNights: estimatedRooms,
      doublePct: doublePct,
      suites: suites,
      events: []
    }));

    // Mark events into rows
    const ev = draft?.events || {};
    if (ev.welcome_reception?.enabled) {
      const idx = 0; // first night
      if (initial[idx]) initial[idx].events.push('Welcome Reception');
    }
    if (Array.isArray(ev.business?.days)) {
      ev.business.days.forEach((d: number) => {
        const idx = Math.max(1, d) - 1;
        if (initial[idx]) initial[idx].events.push('Business Session');
      });
    }
    if (ev.awards_dinner?.enabled && ev.awards_dinner.night) {
      const idx = Math.max(1, ev.awards_dinner.night) - 1;
      if (initial[idx]) initial[idx].events.push('Awards Dinner');
    }
    if (Array.isArray(ev.dine_arounds?.nights)) {
      ev.dine_arounds.nights.forEach((n: number) => {
        const idx = Math.max(1, n) - 1;
        if (initial[idx]) initial[idx].events.push('Dine-around');
      });
    }
    (ev.custom || []).forEach((c: any) => {
      const idx = Math.max(1, c.day) - 1;
      if (initial[idx]) initial[idx].events.push(c.description || 'Custom Event');
    });

    setRows(initial);
  }, [navigate]);

  const totalRoomNights = useMemo(() => rows.reduce((acc, r) => acc + r.roomNights, 0), [rows]);

  const saveAndProceed = () => {
    const draftRaw = localStorage.getItem('hotel_quote_draft') || '{}';
    const draft = JSON.parse(draftRaw);
    draft.grid = { rows, totalRoomNights };
    localStorage.setItem('hotel_quote_draft', JSON.stringify(draft));
    // For now navigate back to portal; later could generate visual
    navigate('/hotel/portal');
  };

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h2>Editable Quote Grid</h2>
      {meta && (
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {meta?.program?.start_date && meta?.program?.end_date
            ? `${meta.program.start_date} to ${meta.program.end_date}`
            : meta?.program?.is_flexible
            ? `Flexible: ${meta.program.flex_start} to ${meta.program.flex_end}`
            : 'Dates not set'}
          {' '}• Nights: {meta?.program?.nights}
          {' '}• Attendees: {meta?.attendees?.count}
        </p>
      )}

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
        <button className="btn btn-outline" onClick={() => navigate('/hotel/ai-quote')}>Back to Chat</button>
        <button className="btn btn-primary" onClick={saveAndProceed} style={{ marginLeft: '0.5rem' }}>Save and Continue</button>
      </div>
    </div>
  );
}

export default HotelQuoteGrid;


