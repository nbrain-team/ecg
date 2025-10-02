import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const apiUrl = (import.meta as any).env?.VITE_API_URL || '';

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

  const saveAndProceed = async () => {
    const draftRaw = localStorage.getItem('hotel_quote_draft') || '{}';
    const draft = JSON.parse(draftRaw);
    draft.grid = { rows, totalRoomNights };
    localStorage.setItem('hotel_quote_draft', JSON.stringify(draft));

    try {
      const hotelToken = localStorage.getItem('hotelToken');
      const headers = { Authorization: `Bearer ${hotelToken}` };

      // Attempt to enrich resort/destination from hotel profile
      let resortId = 'hotel-portal';
      let destinationId = 'on-site';
      try {
        const me = await axios.get(`${apiUrl}/api/hotels/me`, { headers });
        resortId = me.data?.id || resortId;
        const city = me.data?.city || '';
        destinationId = (city || 'on-site').toLowerCase().replace(/\s+/g, '-');
      } catch (_) {}

      // Build start/end dates
      let startDate = draft?.program?.start_date;
      let endDate = draft?.program?.end_date;
      if (!startDate) startDate = draft?.program?.flex_start || new Date().toISOString().slice(0, 10);
      if (!endDate) {
        const start = new Date(startDate);
        const nights = Number(draft?.program?.nights || rows.length || 3);
        const end = new Date(start);
        end.setDate(start.getDate() + Math.max(0, nights - 1));
        endDate = end.toISOString().slice(0, 10);
      }

      const attendeeCount = Number(draft?.attendees?.count || 0);
      const maxRooms = rows.reduce((m, r) => Math.max(m, r.roomNights), 0);

      // Prepare payload similar to ChatbotProposal
      const payload = {
        client: {
          name: 'Hotel Coordinator',
          company: draft?.company || '',
          email: ''
        },
        eventDetails: {
          name: `Group Program - ${destinationId}`,
          purpose: 'corporate',
          startDate,
          endDate,
          attendeeCount,
          roomsNeeded: maxRooms,
          preferredDates: `${startDate} to ${endDate}`,
          datesFlexible: !!draft?.program?.is_flexible,
          numberOfNights: draft?.program?.nights || rows.length,
          daysPattern: draft?.program?.dow_pattern || 'Any',
          doubleOccupancy: !!draft?.occupancy?.is_double_majority,
          privateSatelliteCheckIn: !!draft?.arrival?.satellite_checkin?.enabled,
          businessSessions: (draft?.events?.business?.days || []).map((d:number)=>({ day: d })),
          awardsDinner: draft?.events?.awards_dinner?.enabled ? { night: draft?.events?.awards_dinner?.night } : undefined,
          otherEvents: draft?.events?.custom || []
        },
        destinationId,
        resortId,
        roomTypeIds: [],
        eventSpaceIds: [],
        diningIds: [],
        spaceSetups: {
          theater: (draft?.events?.business?.days || []).length > 0,
          reception: !!draft?.events?.welcome_reception?.enabled,
          banquet: !!draft?.events?.awards_dinner?.enabled
        },
        programInclusions: {
          welcomeReception: !!draft?.events?.welcome_reception?.enabled,
          businessMeeting: (draft?.events?.business?.days || []).length > 0,
          awardDinner: !!draft?.events?.awards_dinner?.enabled,
          dineArounds: (draft?.events?.dine_arounds?.nights || []).length > 0
        },
        branding: {
          theme: 'modern'
        },
        // Attach grid summary for backend pricing if needed
        metadata: { grid: { rows, totalRoomNights } }
      } as any;

      // If we already created a proposal from chat, update it; otherwise create a new one
      const existingId = localStorage.getItem('lastHotelProposalId');
      if (existingId) {
        await axios.put(`${apiUrl}/api/proposals/${existingId}`, payload, { headers });
        navigate(`/hotel/proposal/${existingId}`);
        return;
      }

      const resp = await axios.post(`${apiUrl}/api/proposals`, payload, { headers });
      const data = resp.data || {};
      if (data.id) {
        localStorage.setItem('lastHotelProposalId', data.id);
        navigate(`/hotel/proposal/${data.id}`);
      } else {
        navigate('/hotel/portal');
      }
    } catch (error) {
      // On failure, keep draft and return to portal
      const existingId = localStorage.getItem('lastHotelProposalId');
      if (existingId) {
        navigate(`/hotel/proposal/${existingId}`);
      } else {
        navigate('/hotel/portal');
      }
    }
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


