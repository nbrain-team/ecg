import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PublicHotelProposalVisual() {
  const { shareId } = useParams();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const p = await axios.get(`${apiUrl}/api/proposals/share/${shareId}`);
        setProposal(p.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [apiUrl, shareId]);

  if (loading) return <div className="container">Loading...</div>;
  if (!proposal) return <div className="container">Proposal not found</div>;

  const event = proposal?.event_details || proposal?.eventDetails || {};
  const clientCompany = proposal?.client?.company || 'Hotel Client';
  const primary = proposal?.branding?.primaryColor || '#1e40af';

  // Hero image
  const heroUrl = (proposal?.resort?.images?.[0]) || proposal?.destination?.imageUrl || '/images/hotel-overview.webp';

  // Selected data
  const selectedRooms = Array.isArray(proposal?.selected_rooms || proposal?.selectedRooms) ? (proposal?.selected_rooms || proposal?.selectedRooms) : [];
  const selectedVenues = Array.isArray(proposal?.selected_spaces || proposal?.selectedSpaces) ? (proposal?.selected_spaces || proposal?.selectedSpaces) : [];
  const selectedDining = Array.isArray(proposal?.selected_dining || proposal?.selectedDining) ? (proposal?.selected_dining || proposal?.selectedDining) : [];

  // Derived strings
  const start = (event as any).startDate || (event as any).start_date;
  const end = (event as any).endDate || (event as any).end_date;
  const datesRange = (start || end) ? (String(start || '') + (end ? ' – ' + String(end) : '')) : '';
  const heroParts: string[] = [];
  if (start || end) heroParts.push(datesRange);
  if ((event as any).attendeeCount) heroParts.push(String((event as any).attendeeCount) + ' Attendees');

  const customizationItems: Array<{ label: string; value: string }> = [
    { label: 'Dates', value: datesRange },
    { label: 'Nights', value: (event as any).numberOfNights != null ? String((event as any).numberOfNights) : '' },
    { label: 'Attendees', value: (event as any).attendeeCount != null ? String((event as any).attendeeCount) : '' },
    { label: 'Attendee Confidence', value: (event as any).attendeeConfidence || '' },
    { label: 'Rooms Needed', value: (event as any).roomsNeeded != null ? String((event as any).roomsNeeded) : '' },
    { label: 'Day-of-Week Pattern', value: (event as any).daysPattern || '' },
    { label: 'Double Occupancy', value: (event as any).doubleOccupancy != null ? ((event as any).doubleOccupancy ? 'Yes' : 'No') : '' },
    { label: '% Double', value: (event as any).doublePct != null ? String((event as any).doublePct) + '%' : '' },
    { label: 'Room View', value: (event as any).roomView ? String((event as any).roomView).replace(/_/g,' ') : '' },
    { label: 'Ocean View %', value: (event as any).roomViewPct != null ? String((event as any).roomViewPct) + '%' : '' },
    { label: 'Suites', value: (event as any).suiteCount != null ? String((event as any).suiteCount) : '' },
    { label: 'Private Satellite Check-in', value: (event as any).privateSatelliteCheckIn != null ? ((event as any).privateSatelliteCheckIn ? 'Yes' : 'No') : '' },
    { label: 'Check-in Details', value: (event as any).satelliteCheckInDetails || '' },
    { label: 'Welcome Reception', value: (event as any).welcomeReception != null ? ((event as any).welcomeReception ? 'Yes' : 'No') : '' },
    { label: 'Welcome Reception Details', value: (event as any).welcomeReceptionDetails || '' },
    { label: 'Business Sessions', value: (Array.isArray((event as any).businessSessions) && (event as any).businessSessions.length) ? ('Days ' + (event as any).businessSessions.map((b:any)=>b.day).join(', ')) : '' },
    { label: 'Business Details', value: (Array.isArray((event as any).businessSessions) && (event as any).businessSessions.some((b:any)=>b.description)) ? (((event as any).businessSessions.find((b:any)=>b.description)?.description) || '') : '' },
    { label: 'Awards Dinner', value: (event as any).awardsDinner && (event as any).awardsDinner.night ? ('Night ' + String((event as any).awardsDinner.night)) : '' },
    { label: 'Dine-arounds', value: ((event as any).dineArounds && Array.isArray((event as any).dineArounds.nights) && (event as any).dineArounds.nights.length) ? (event as any).dineArounds.nights.join(', ') : '' },
    { label: 'Other Events', value: (Array.isArray((event as any).otherEvents) && (event as any).otherEvents.length) ? (event as any).otherEvents.map((e:any)=> (String(e.description) + ' (Day ' + (e.day === 0 ? 'TBD' : String(e.day)) + ')')).join('; ') : '' },
  ].filter(i => i.value);

  const gen = proposal?.generated_content || proposal?.generatedContent || {};

  return (
    <div className="container" style={{ padding: '1rem', overflow: 'visible' }}>
      {/* Header Hero */}
      <header style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginTop: 12, border: '1px solid #e5e7eb' }}>
        <div style={{ backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 260 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, color: 'white', padding: 16 }}>
          <h1 style={{ margin: 0 }}>{String(event?.name || 'Group Program')}</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            {clientCompany}
            {heroParts.length ? ` • ${heroParts.join(' • ')}` : ''}
          </p>
        </div>
      </header>

      {/* Program Customizations */}
      {customizationItems.length > 0 ? (
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
      ) : null}

      {/* Event Experience */}
      <section className="card" style={{ marginTop: 12 }}>
        <h2 className="section-title" style={{ margin: 0, marginBottom: 8, color: primary }}>Your Event Experience</h2>
        {/* Event schedule details */}
        <div style={{ marginTop: 12 }}>
          <h3 style={{ color: primary, marginBottom: 8, fontSize: 16 }}>Event Schedule</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#374151' }}>
            {(event as any)?.welcomeReception && (((event as any).welcomeReception.enabled === true) || ((event as any).welcomeReception?.night !== undefined)) && (
              <li>Welcome Reception{(event as any).welcomeReception.night ? (' on Night ' + String((event as any).welcomeReception.night)) : ''}</li>
            )}
            {Array.isArray((event as any)?.businessSessions) && (event as any).businessSessions.length > 0 && (
              <li>Business Sessions on day(s): {(event as any).businessSessions.map((b:any)=>b.day).join(', ')}{(event as any).businessSessions.some((b:any)=>b.description) ? ' • details provided' : ''}</li>
            )}
            {(event as any)?.awardsDinner && (event as any).awardsDinner.night && (
              <li>Awards Dinner on Night {(event as any).awardsDinner.night}</li>
            )}
            {(event as any)?.dineArounds && Array.isArray((event as any).dineArounds.nights) && (event as any).dineArounds.nights.length > 0 && (
              <li>Dine-arounds on night(s): {(event as any).dineArounds.nights.join(', ')}</li>
            )}
            {Array.isArray((event as any)?.otherEvents) && (event as any).otherEvents.length > 0 && (
              <li>Other Events: {(event as any).otherEvents.map((e:any)=> (String(e.description) + ' (Day ' + (e.day === 0 ? 'TBD' : String(e.day)) + ')')).join('; ')}</li>
            )}
          </ul>
        </div>
      </section>

      {/* Destination Overview */}
      {(gen.destinationOverview || proposal?.destination?.description) ? (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Destination Overview</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.destinationOverview || proposal?.destination?.description}</p>
        </section>
      ) : null}

      {/* Resort Highlight */}
      {(gen.resortHighlight || proposal?.resort?.description) ? (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Resort Highlight</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.resortHighlight || proposal?.resort?.description}</p>
        </section>
      ) : null}

      {/* Dining Description */}
      {gen.diningDescription ? (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Dining</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.diningDescription}</p>
        </section>
      ) : null}

      {/* Travel Info */}
      {gen.travelInfo ? (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Travel Information</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{gen.travelInfo}</p>
        </section>
      ) : null}

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
      {selectedRooms.length > 0 ? (
        <section className="card">
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Accommodations</h2>
          <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {selectedRooms.map((r: any, idx: number) => {
              const images: string[] = Array.isArray(r.images) ? r.images : [];
              const main = images[0];
              const thumbs = images.slice(1, 3);
              return (
                <div key={idx} className="selection-card">
                  {main ? (
                    <img src={main} alt={r.name || r.title || `Room ${idx+1}`} />
                  ) : null}
                  {thumbs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${thumbs.length}, 1fr)`, gap: 6, marginTop: 6 }}>
                      {thumbs.map((t, i) => (
                        <img key={i} src={t} alt={(r.name || 'Room') + ' thumb'} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      ))}
                    </div>
                  ) : null}
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
      ) : null}

      {/* Venues Gallery */}
      {selectedVenues.length > 0 ? (
        <section className="card">
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Meeting Venues & Event Spaces</h2>
          <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {selectedVenues.map((v: any, idx: number) => (
              <div key={idx} className="selection-card">
                {Array.isArray(v.images) && v.images[0] ? (
                  <img src={v.images[0]} alt={v.name || `Venue ${idx+1}`} />
                ) : null}
                <div className="card-content">
                  <h4>{v.name || 'Event Space'}</h4>
                  <p className="room-info">{v.attributes?.maximum_capacity ? `Up to ${v.attributes.maximum_capacity} guests` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Dining Gallery */}
      {selectedDining.length > 0 ? (
        <section className="card">
          <h2 className="section-title" style={{ margin: 0, marginBottom: 8 }}>Culinary Experiences</h2>
          <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {selectedDining.map((d: any, idx: number) => (
              <div key={idx} className="selection-card">
                {Array.isArray(d.images) && d.images[0] ? (
                  <img src={d.images[0]} alt={d.name || `Dining ${idx+1}`} />
                ) : null}
                <div className="card-content">
                  <h4>{d.name || 'Dining'}</h4>
                  <p className="description">{d.cuisine || d.description || 'World-class dining'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Footer CTA */}
      <section className="card" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 8 }}>Ready to Create Your Perfect Event?</h3>
        <p style={{ color: '#6b7280', marginBottom: 12 }}>Let's discuss how we can make your vision a reality</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <a className="btn btn-primary btn-sm" href={`mailto:${proposal?.client?.email || ''}?subject=Re: ${String(event?.name || 'Event Proposal')}`}>Contact Us</a>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Download Proposal</button>
        </div>
      </section>
    </div>
  );
}

export default PublicHotelProposalVisual;


