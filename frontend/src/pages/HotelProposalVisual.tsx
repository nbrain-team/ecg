import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function HotelProposalVisual() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [dining, setDining] = useState<any[]>([]);
  const apiUrl = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Load proposal
        const p = await axios.get(`${apiUrl}/api/proposals/${id}`, { headers });
        setProposal(p.data);

        // Load hotel datasets for richer visual fallbacks
        try {
          const [h, rm, vn, dn] = await Promise.all([
            axios.get(`${apiUrl}/api/hotels/me`, { headers }),
            axios.get(`${apiUrl}/api/hotels/rooms`, { headers }),
            axios.get(`${apiUrl}/api/hotels/venues`, { headers }),
            axios.get(`${apiUrl}/api/hotels/dining`, { headers })
          ]);
          setHotel(h.data || null);
          setRooms(Array.isArray(rm.data) ? rm.data : []);
          setVenues(Array.isArray(vn.data) ? vn.data : []);
          setDining(Array.isArray(dn.data) ? dn.data : []);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [apiUrl, id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!proposal) return <div className="container">Proposal not found</div>;

  const event = proposal?.event_details || proposal?.eventDetails || {};
  const clientCompany = proposal?.client?.company || 'Hotel Client';
  const primary = proposal?.branding?.primaryColor || '#1e40af';
  const secondary = proposal?.branding?.secondaryColor || '#06b6d4';

  // Helper to make API-relative URLs absolute
  const toAbsolute = (u?: string) => (u && !u.startsWith('http') ? `${apiUrl}${u}` : u || '');

  // Header hero background
  const heroUrl = toAbsolute(hotel?.images_media?.primary_image?.url) || '/images/hotel-overview.webp';

  // Use selected lists if available, else fallback to hotel datasets
  const selectedRooms = (Array.isArray(proposal?.selected_rooms || proposal?.selectedRooms) && (proposal?.selected_rooms || proposal?.selectedRooms).length
    ? (proposal?.selected_rooms || proposal?.selectedRooms)
    : rooms.slice(0, 4))
    .map((r: any) => ({
      ...r,
      images: Array.isArray(r.images) ? r.images.map((u: string) => toAbsolute(u)) : []
    }));
  const selectedVenues = (Array.isArray(proposal?.selected_spaces || proposal?.selectedSpaces) && (proposal?.selected_spaces || proposal?.selectedSpaces).length
    ? (proposal?.selected_spaces || proposal?.selectedSpaces)
    : venues.slice(0, 6))
    .map((v: any) => ({ ...v, images: Array.isArray(v.images) ? v.images.map((u: string) => toAbsolute(u)) : [] }));
  const selectedDining = (Array.isArray(proposal?.selected_dining || proposal?.selectedDining) && (proposal?.selected_dining || proposal?.selectedDining).length
    ? (proposal?.selected_dining || proposal?.selectedDining)
    : dining.slice(0, 8))
    .map((d: any) => ({ ...d, images: Array.isArray(d.images) ? d.images.map((u: string) => toAbsolute(u)) : [] }));

  // Build program customizations grid items (label/value)
  const start = (event as any).startDate || (event as any).start_date;
  const end = (event as any).endDate || (event as any).end_date;
  const customizationItems: Array<{ label: string; value: string }> = [
    { label: 'Dates', value: start || end ? `${start || ''}${end ? ` – ${end}` : ''}` : '' },
    { label: 'Nights', value: String((event as any).numberOfNights || (proposal?.metadata?.grid?.rows?.length || '')) },
    { label: 'Attendees', value: (event as any).attendeeCount != null ? String((event as any).attendeeCount) : '' },
    { label: 'Attendee Confidence', value: (event as any).attendeeConfidence || '' },
    { label: 'Rooms Needed', value: (event as any).roomsNeeded != null ? String((event as any).roomsNeeded) : '' },
    { label: 'Day-of-Week Pattern', value: (event as any).daysPattern || '' },
    { label: 'Double Occupancy', value: (event as any).doubleOccupancy != null ? ((event as any).doubleOccupancy ? 'Yes' : 'No') : '' },
    { label: '% Double', value: (event as any).doublePct != null ? `${(event as any).doublePct}%` : '' },
    { label: 'Room View', value: (event as any).roomView ? String((event as any).roomView).replaceAll('_',' ') : '' },
    { label: 'Ocean View %', value: (event as any).roomViewPct != null ? `${(event as any).roomViewPct}%` : '' },
    { label: 'Suites', value: (event as any).suiteCount != null ? String((event as any).suiteCount) : '' },
    { label: 'Private Satellite Check-in', value: (event as any).privateSatelliteCheckIn != null ? ((event as any).privateSatelliteCheckIn ? 'Yes' : 'No') : '' },
    { label: 'Check-in Details', value: (event as any).satelliteCheckInDetails || '' },
    { label: 'Welcome Reception', value: (event as any).welcomeReception != null ? ((event as any).welcomeReception ? 'Yes' : 'No') : '' },
    { label: 'Welcome Reception Details', value: (event as any).welcomeReceptionDetails || '' },
    { label: 'Business Sessions', value: Array.isArray((event as any).businessSessions) && (event as any).businessSessions.length ? `Days ${(event as any).businessSessions.map((b:any)=>b.day).join(', ')}` : '' },
    { label: 'Business Details', value: Array.isArray((event as any).businessSessions) && (event as any).businessSessions.some((b:any)=>b.description) ? (event as any).businessSessions.find((b:any)=>b.description)?.description || '' : '' },
    { label: 'Awards Dinner', value: (event as any).awardsDinner?.night ? `Night ${(event as any).awardsDinner.night}` : '' },
    { label: 'Dine-arounds', value: (event as any).dineArounds?.nights?.length ? (event as any).dineArounds.nights.join(', ') : '' },
    { label: 'Other Events', value: Array.isArray((event as any).otherEvents) && (event as any).otherEvents.length ? (event as any).otherEvents.map((e:any)=>`${e.description} (Day ${e.day})`).join('; ') : '' },
  ].filter(i => i.value);

  const gen = proposal?.generated_content || proposal?.generatedContent || {};

  // Build hero subtitle parts safely (avoid nested template strings)
  const heroParts: string[] = [];
  if (start || end) {
    heroParts.push(`${start || ''}${end ? ' – ' + end : ''}`);
  }
  if ((event as any).attendeeCount) {
    heroParts.push(`${(event as any).attendeeCount} Attendees`);
  }

  return (
    <div className="container" style={{ padding: '1rem', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Visual Proposal</h2>
        <div className="header-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/hotel/proposal/${id}`)}>Back</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/hotel/proposal/${id}/grid`)}>Edit Grid</button>
        </div>
      </div>

      {/* Header Hero */}
      <header style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginTop: 12, border: '1px solid #e5e7eb' }}>
        <div style={{ backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 260 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, color: 'white', padding: 16 }}>
          <h1 style={{ margin: 0 }}>{event?.name || 'Group Program'}</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            {clientCompany}
            {heroParts.length ? ` • ${heroParts.join(' • ')}` : ''}
          </p>
        </div>
      </header>

      {/* Program Customizations */}
      {customizationItems.length > 0 && (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8, color: primary }}>Program Customizations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            {customizationItems.map((it, idx) => (
              <div key={idx} style={{ display: 'grid', gap: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{it.label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#111' }}>{it.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Program Overview */}
      <section className="card" style={{ marginTop: 12 }}>
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8, color: primary }}>Your Event Experience</h2>
        <p className="section-subtitle" style={{ color: '#6b7280' }}>
          {event?.startDate || event?.start_date || 'TBD'}
          {event?.endDate || event?.end_date ? ` – ${event?.endDate || event?.end_date}` : ''}
          {event?.attendeeCount ? ` • ${event.attendeeCount} Attendees` : ''}
        </p>
        {proposal?.metadata?.grid && (
          <div className="summary-grid" style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div><div className="summary-value" style={{ fontSize: 20, fontWeight: 600 }}>{proposal.metadata.grid.totalRoomNights}</div><div className="summary-label" style={{ color: '#6b7280' }}>Room Nights</div></div>
            {Array.isArray(proposal.metadata.grid.rows) && proposal.metadata.grid.rows.length > 0 && (
              <div><div className="summary-value" style={{ fontSize: 20, fontWeight: 600 }}>{proposal.metadata.grid.rows.length}</div><div className="summary-label" style={{ color: '#6b7280' }}>Days</div></div>
            )}
          </div>
        )}
        {/* Program Details derived from chat */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 12 }}>
          <div><div style={{ color: '#6b7280' }}>Double Occupancy</div><div style={{ fontWeight: 600 }}>{event?.doubleOccupancy ? 'Yes' : 'No'}</div></div>
          {typeof event?.doublePct === 'number' && (
            <div><div style={{ color: '#6b7280' }}>% Double</div><div style={{ fontWeight: 600 }}>{event.doublePct}%</div></div>
          )}
          {typeof event?.roomsNeeded === 'number' && (
            <div><div style={{ color: '#6b7280' }}>Peak Rooms Needed</div><div style={{ fontWeight: 600 }}>{event.roomsNeeded}</div></div>
          )}
          {event?.roomView && (
            <div><div style={{ color: '#6b7280' }}>Preferred Room View</div><div style={{ fontWeight: 600 }}>{String(event.roomView).replaceAll('_',' ')}</div></div>
          )}
          {typeof event?.suiteCount === 'number' && (
            <div><div style={{ color: '#6b7280' }}>Suites Requested</div><div style={{ fontWeight: 600 }}>{event.suiteCount}</div></div>
          )}
          {event?.daysPattern && (
            <div><div style={{ color: '#6b7280' }}>Days Pattern</div><div style={{ fontWeight: 600 }}>{event.daysPattern}</div></div>
          )}
          {event?.privateSatelliteCheckIn !== undefined && (
            <div><div style={{ color: '#6b7280' }}>Private Satellite Check-in</div><div style={{ fontWeight: 600 }}>{event.privateSatelliteCheckIn ? 'Yes' : 'No'}</div></div>
          )}
          {event?.satelliteCheckInDetails && (
            <div><div style={{ color: '#6b7280' }}>Check-in Details</div><div style={{ fontWeight: 600 }}>{event.satelliteCheckInDetails}</div></div>
          )}
        </div>
        {/* Event schedule details */}
        <div style={{ marginTop: 12 }}>
          <h3 style={{ color: primary, marginBottom: 8, fontSize: 16 }}>Event Schedule</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#374151' }}>
            {event?.welcomeReception && (event.welcomeReception.enabled === true || event.welcomeReception?.night !== undefined) && (
              <li>Welcome Reception{event.welcomeReception.night ? ` on Night ${event.welcomeReception.night}` : ''}</li>
            )}
            {Array.isArray(event?.businessSessions) && event.businessSessions.length > 0 && (
              <li>Business Sessions on day(s): {event.businessSessions.map((b:any)=>b.day).join(', ')}{event.businessSessions.some((b:any)=>b.description) ? ' • details provided' : ''}</li>
            )}
            {event?.awardsDinner && event.awardsDinner.night && (
              <li>Awards Dinner on Night {event.awardsDinner.night}</li>
            )}
            {event?.dineArounds && Array.isArray(event.dineArounds.nights) && event.dineArounds.nights.length > 0 && (
              <li>Dine-arounds on night(s): {event.dineArounds.nights.join(', ')}</li>
            )}
            {Array.isArray(event?.otherEvents) && event.otherEvents.length > 0 && (
              <li>Other Events: {event.otherEvents.map((e:any)=>`${e.description} (Day ${e.day})`).join('; ')}</li>
            )}
          </ul>
        </div>
      </section>

      {/* Destination Overview */}
      {(gen.destinationOverview || proposal?.destination?.description) && (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Destination Overview</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.destinationOverview || proposal?.destination?.description}</p>
        </section>
      })}

      {/* Resort Highlight */}
      {(gen.resortHighlight || proposal?.resort?.description) && (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Resort Highlight</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.resortHighlight || proposal?.resort?.description}</p>
        </section>
      })}

      {/* Dining Description */}
      {gen.diningDescription && (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Dining</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.diningDescription}</p>
        </section>
      )}

      {/* Travel Info */}
      {gen.travelInfo && (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Travel Information</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.travelInfo}</p>
        </section>
      )}

      {/* Contact Details */}
      <section className="card">
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Contact Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <div><div style={{ color: '#6b7280' }}>Company</div><div style={{ fontWeight: 600 }}>{proposal?.client?.company || '—'}</div></div>
          <div><div style={{ color: '#6b7280' }}>Contact</div><div style={{ fontWeight: 600 }}>{proposal?.client?.name || '—'}</div></div>
          <div><div style={{ color: '#6b7280' }}>Email</div><div style={{ fontWeight: 600 }}>{proposal?.client?.email || '—'}</div></div>
          <div><div style={{ color: '#6b7280' }}>Phone</div><div style={{ fontWeight: 600 }}>{proposal?.client?.phone || '—'}</div></div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="card">
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Accommodations</h2>
        <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(selectedRooms || []).map((r: any, idx: number) => {
            const images: string[] = Array.isArray(r.images) ? r.images : [];
            const main = images[0];
            const thumbs = images.slice(1, 3);
            return (
              <div key={idx} className="selection-card">
                {main && (
                  <img src={main} alt={r.name || r.title || `Room ${idx+1}`} />
                )}
                {thumbs.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${thumbs.length}, 1fr)`, gap: 6, marginTop: 6 }}>
                    {thumbs.map((t, i) => (
                      <img key={i} src={t} alt={(r.name || 'Room') + ' thumb'} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    ))}
                  </div>
                )}
                <div className="card-content">
                  <h4>{r.name || r.title || 'Suite'}</h4>
                  <p className="description">{r.description || 'Luxury suite with premium amenities.'}</p>
                  <p className="room-info">
                    {r.attributes?.size_label || r.size_sqft ? `${r.attributes?.size_label || `${r.size_sqft} sq ft`}` : ''}
                    {r.attributes?.occupancy ? ` • ${r.attributes.occupancy}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Notable Features */}
      <section className="card">
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Notable Features</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#374151' }}>
          <li>AAA Five Diamond and Forbes 5-Star all-inclusive</li>
          <li>Convention Center with 26,152 sq ft total; 10,600 sq ft ballroom</li>
          <li>3 infinity pools • Direct beach access</li>
          <li>7 dining options including Michelin-starred Cocina de Autor</li>
          <li>Award-winning SE Spa with 16 treatment rooms</li>
          <li>35 minutes from Los Cabos International Airport (SJD)</li>
        </ul>
      </section>

      {/* Function Spaces (simple mapping or fallback) */}
      <section className="card">
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Function Spaces</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Function</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Space Options</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Capacity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Welcome Reception</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Main Pool</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>450+ reception</td>
              </tr>
              <tr>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Business Session</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Ambassador Ballroom</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>685 classroom / 924 theatre</td>
              </tr>
              <tr>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Awards Dinner</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Grand Velas Ballroom</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>774 rounds / 1,042 reception</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Venues Gallery */}
      <section className="card">
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Meeting Venues & Event Spaces</h2>
        <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {(selectedVenues || []).map((v: any, idx: number) => (
            <div key={idx} className="selection-card">
              {Array.isArray(v.images) && v.images[0] && (
                <img src={v.images[0]} alt={v.name || `Venue ${idx+1}`} />
              )}
              <div className="card-content">
                <h4>{v.name || 'Event Space'}</h4>
                <p className="room-info">{v.attributes?.maximum_capacity ? `Up to ${v.attributes.maximum_capacity} guests` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dining Gallery */}
      <section className="card">
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Culinary Experiences</h2>
        <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {(selectedDining || []).map((d: any, idx: number) => (
            <div key={idx} className="selection-card">
              {Array.isArray(d.images) && d.images[0] && (
                <img src={d.images[0]} alt={d.name || `Dining ${idx+1}`} />
              )}
              <div className="card-content">
                <h4>{d.name || 'Dining'}</h4>
                <p className="description">{d.cuisine || d.description || 'World-class dining'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="card" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 8 }}>Ready to Create Your Perfect Event?</h3>
        <p style={{ color: '#6b7280', marginBottom: 12 }}>Let's discuss how we can make your vision a reality</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-sm">Schedule Consultation</button>
          <button className="btn btn-outline btn-sm">Download Proposal</button>
        </div>
      </section>
    </div>
  );
}

export default HotelProposalVisual;


