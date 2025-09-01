import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

interface Hotel {
  id: string;
  name: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  rating_standard?: string;
  rating_level?: string;
}

function HotelPortal() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [dining, setDining] = useState<any[]>([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('hotelToken');
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAll = async () => {
    try {
      setError('');
      const [h, im, rm, vn, dn] = await Promise.all([
        axios.get(`${apiUrl}/api/hotels/me`, auth),
        axios.get(`${apiUrl}/api/hotels/images`, auth),
        axios.get(`${apiUrl}/api/hotels/rooms`, auth),
        axios.get(`${apiUrl}/api/hotels/venues`, auth),
        axios.get(`${apiUrl}/api/hotels/dining`, auth)
      ]);
      setHotel(h.data);
      setImages(im.data);
      setRooms(rm.data);
      setVenues(vn.data);
      setDining(dn.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (!token) {
    return (
      <div className="container">
        <div className="alert alert-error">Not authenticated</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Hotel Portal</h1>
        {hotel && <p>{hotel.name} {hotel.rating_level ? `• ${hotel.rating_level}` : ''}</p>}
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        <h2>Images</h2>
        <div className="selection-grid">
          {images.map(i => (
            <div key={i.id} className="selection-card">
              <img src={i.url} alt={i.alt || ''} />
              <div className="card-content">
                <p className="description">{i.category || 'image'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Rooms</h2>
        <div className="selection-grid">
          {rooms.map(r => (
            <div key={r.id} className={`selection-card`}>
              {Array.isArray(r.images) && r.images[0] && (
                <img src={r.images[0]} alt={r.name} />
              )}
              <div className="card-content">
                <h3>{r.name}</h3>
                <p className="description">{r.description}</p>
                <p className="room-info">{r.size_sqft ? `${r.size_sqft} sqft` : ''} {r.view ? `• ${r.view} view` : ''}</p>
                <p className="capacity">Sleeps {r.capacity}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Venues</h2>
        <div className="selection-grid">
          {venues.map(v => (
            <div key={v.id} className="selection-card">
              {Array.isArray(v.images) && v.images[0] && (
                <img src={v.images[0]} alt={v.name} />
              )}
              <div className="card-content">
                <h3>{v.name}</h3>
                <p className="description">{v.description}</p>
                <p className="size">{v.sqft} sq ft • {v.ceiling_height_ft} ft ceiling</p>
                <p className="capacity">Reception {v.capacity_reception} • Banquet {v.capacity_banquet} • Theater {v.capacity_theater}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Dining</h2>
        <div className="selection-grid">
          {dining.map(d => (
            <div key={d.id} className="selection-card">
              {Array.isArray(d.images) && d.images[0] && (
                <img src={d.images[0]} alt={d.name} />
              )}
              <div className="card-content">
                <h3>{d.name}</h3>
                <p className="description">{d.description}</p>
                <p className="room-info">{d.cuisine} • {d.hours} • {d.dress_code}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HotelPortal;


