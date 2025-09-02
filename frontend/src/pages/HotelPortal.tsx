import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Modal from '../components/Modal';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Predefined amenities list
const AMENITIES_LIST = [
  'Pool (Indoor)', 'Pool (Outdoor)', 'Fitness Center', 'Spa', 'Beach Access', 
  'Golf Course', 'Tennis Courts', 'Business Center', 'Concierge', 'Room Service',
  'Restaurant', 'Bar/Lounge', 'Free WiFi', 'Parking', 'Valet Parking',
  'Pet Friendly', 'Airport Shuttle', 'Laundry Service', 'Dry Cleaning',
  'Meeting Rooms', 'Ballroom', 'Wedding Services', 'Kids Club', 'Babysitting',
  'Wheelchair Accessible', 'Non-Smoking Rooms', 'Air Conditioning', 'Heating',
  'Safe', 'Mini Bar', 'Coffee Maker', 'Hair Dryer', 'Iron/Board', 'Balcony'
];

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
  const hotelToken = localStorage.getItem('hotelToken');
  const auth = { headers: { Authorization: `Bearer ${hotelToken}` } };
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [dining, setDining] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [schema, setSchema] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'overview'|'profile'|'contact'|'location'|'images'|'policies'|'financials'|'amenities'|'workflow'|'rooms'|'venues'|'dining'>('overview');
  const [saving, setSaving] = useState(false);
  const [schemaDraft, setSchemaDraft] = useState<any>({});
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'room'|'venue'|'dining'|'amenities'|null>(null);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [modalEditId, setModalEditId] = useState<string|null>(null);

  // Images form state
  const [imageForm, setImageForm] = useState<{url:string;alt:string;category:string}>({ url: '', alt: '', category: '' });
  // Rooms forms state
  const [newRoom, setNewRoom] = useState<any>({ name: '', description: '', size_sqft: '', view: '', capacity: '', base_rate: '', image1: '', attributes: { bed_configuration: '', connectable: 'false', max_occupancy: '', view_type: '', in_room_amenities_csv: '', accessibility_features_csv: '', typical_group_rate_low: '', typical_group_rate_high: '' } });
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomForm, setEditRoomForm] = useState<any>({ name: '', description: '', size_sqft: '', view: '', capacity: '', base_rate: '', image1: '', attributes: { bed_configuration: '', connectable: 'false', max_occupancy: '', view_type: '', in_room_amenities_csv: '', accessibility_features_csv: '', typical_group_rate_low: '', typical_group_rate_high: '' } });
  // Venues forms
  const [newVenue, setNewVenue] = useState<any>({ name: '', description: '', sqft: '', ceiling_height_ft: '', capacity_reception: '', capacity_banquet: '', capacity_theater: '', image1: '', attributes: { length_m: '', width_m: '', height_m: '', floor_type: '', natural_light: 'false', rigging_points: 'false', theater: '', classroom: '', banquet_rounds_10: '', reception: '', u_shape: '', boardroom: '', rental_fee_usd_day: '', setup_tear_down_fee_usd: '' } });
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editVenueForm, setEditVenueForm] = useState<any>({ name: '', description: '', sqft: '', ceiling_height_ft: '', capacity_reception: '', capacity_banquet: '', capacity_theater: '', image1: '', attributes: { length_m: '', width_m: '', height_m: '', floor_type: '', natural_light: 'false', rigging_points: 'false', theater: '', classroom: '', banquet_rounds_10: '', reception: '', u_shape: '', boardroom: '', rental_fee_usd_day: '', setup_tear_down_fee_usd: '' } });
  // Dining forms
  const [newDiningOutlet, setNewDiningOutlet] = useState<any>({ name: '', cuisine: '', description: '', hours: '', dress_code: '', image1: '', attributes: { buyout_available: 'false', buyout_min_spend_usd: '', seating_capacity: '', standing_capacity: '', private_rooms_csv: '', outdoor: 'false', noise_restrictions_after: '' } });
  const [editingDiningId, setEditingDiningId] = useState<string | null>(null);
  const [editDiningForm, setEditDiningForm] = useState<any>({ name: '', cuisine: '', description: '', hours: '', dress_code: '', image1: '', attributes: { buyout_available: 'false', buyout_min_spend_usd: '', seating_capacity: '', standing_capacity: '', private_rooms_csv: '', outdoor: 'false', noise_restrictions_after: '' } });

  useEffect(() => {
    setSchemaDraft(schema);
  }, [schema]);

  const saveSchema = async () => {
    setSaving(true);
    try {
      const updates: any = {};
      Object.keys(schemaDraft || {}).forEach((k) => { updates[k] = schemaDraft[k]; });
      await axios.put(`${apiUrl}/api/hotels/sections`, { updates }, auth);
      setSchema(schemaDraft);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (sectionKey: string) => {
    setSaving(true);
    try {
      const updates: any = { [sectionKey]: schemaDraft?.[sectionKey] ?? {} };
      await axios.put(`${apiUrl}/api/hotels/sections`, { updates }, auth);
      setSchema((prev:any)=>({ ...prev, [sectionKey]: schemaDraft?.[sectionKey] }));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };



  // Helper to update deeply nested schemaDraft paths safely
  const updateDraft = (path: (string | number)[], value: any) => {
    setSchemaDraft((previousDraft: any) => {
      const nextDraft: any = { ...previousDraft };
      let cursor: any = nextDraft;
      for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      const lastKey = path[path.length - 1];
      cursor[lastKey] = value;
      return nextDraft;
    });
  };

  const fetchAll = async () => {
    try {
      setError('');
      const [h, sc, im, rm, vn, dn] = await Promise.all([
        axios.get(`${apiUrl}/api/hotels/me`, auth),
        axios.get(`${apiUrl}/api/hotels/schema`, auth),
        axios.get(`${apiUrl}/api/hotels/images`, auth),
        axios.get(`${apiUrl}/api/hotels/rooms`, auth),
        axios.get(`${apiUrl}/api/hotels/venues`, auth),
        axios.get(`${apiUrl}/api/hotels/dining`, auth)
      ]);
      setHotel(h.data);
      setSchema(sc.data || {});
      setImages(im.data);
      setRooms(rm.data);
      setVenues(vn.data);
      setDining(dn.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Helpers: save single section
  

  // Images CRUD
  const addImage = async () => {
    try {
      await axios.post(`${apiUrl}/api/hotels/images`, { url: imageForm.url, alt: imageForm.alt, category: imageForm.category }, auth);
      setImageForm({ url: '', alt: '', category: '' });
      fetchAll();
    } catch (e:any) { setError(e.response?.data?.message || 'Failed to add image'); }
  };
  const deleteImage = async (id: string) => {
    try { await axios.delete(`${apiUrl}/api/hotels/images/${id}`, auth); fetchAll(); } catch (e:any) { setError(e.response?.data?.message || 'Delete failed'); }
  };

  // Rooms CRUD
  const addRoom = async () => {
    try {
      const payload:any = {
        name: newRoom.name,
        description: newRoom.description,
        size_sqft: Number(newRoom.size_sqft||0),
        view: newRoom.view,
        capacity: Number(newRoom.capacity||0),
        base_rate: Number(newRoom.base_rate||0),
        images: newRoom.image1 ? [newRoom.image1] : [],
        attributes: {
          bed_configuration: newRoom.attributes?.bed_configuration || '',
          connectable: newRoom.attributes?.connectable === 'true',
          max_occupancy: newRoom.attributes?.max_occupancy || '',
          view_type: newRoom.attributes?.view_type || '',
          in_room_amenities: newRoom.attributes?.in_room_amenities_csv ? newRoom.attributes.in_room_amenities_csv.split(',').map((s:string) => s.trim()).filter(Boolean) : [],
          accessibility_features: newRoom.attributes?.accessibility_features_csv ? newRoom.attributes.accessibility_features_csv.split(',').map((s:string) => s.trim()).filter(Boolean) : [],
          typical_group_rate_usd: {
            low: newRoom.attributes?.typical_group_rate_low ? Number(newRoom.attributes.typical_group_rate_low) : null,
            high: newRoom.attributes?.typical_group_rate_high ? Number(newRoom.attributes.typical_group_rate_high) : null
          }
        }
      };
      await axios.post(`${apiUrl}/api/hotels/rooms`, payload, auth);
      setNewRoom({ name: '', description: '', size_sqft: '', view: '', capacity: '', base_rate: '', image1: '', attributes: { bed_configuration: '', connectable: 'false', max_occupancy: '', view_type: '', in_room_amenities_csv: '', accessibility_features_csv: '', typical_group_rate_low: '', typical_group_rate_high: '' } });
      fetchAll();
    } catch (e:any) { setError(e.response?.data?.message || 'Failed to add room'); }
  };
  const startEditRoom = (r:any) => {
    setEditingRoomId(r.id);
    setEditRoomForm({ 
      name: r.name||'', 
      description: r.description||'', 
      size_sqft: r.size_sqft||'', 
      view: r.view||'', 
      capacity: r.capacity||'', 
      base_rate: r.base_rate||'', 
      image1: Array.isArray(r.images)&&r.images[0]?r.images[0]:'',
      attributes: {
        bed_configuration: r.attributes?.bed_configuration || '',
        connectable: String(r.attributes?.connectable || 'false'),
        max_occupancy: r.attributes?.max_occupancy || '',
        view_type: r.attributes?.view_type || '',
        in_room_amenities_csv: Array.isArray(r.attributes?.in_room_amenities) ? r.attributes.in_room_amenities.join(', ') : (r.attributes?.in_room_amenities_csv || ''),
        accessibility_features_csv: Array.isArray(r.attributes?.accessibility_features) ? r.attributes.accessibility_features.join(', ') : (r.attributes?.accessibility_features_csv || ''),
        typical_group_rate_low: r.attributes?.typical_group_rate_usd?.low || r.attributes?.typical_group_rate_low || '',
        typical_group_rate_high: r.attributes?.typical_group_rate_usd?.high || r.attributes?.typical_group_rate_high || ''
      }
    });
    setModalType('room');
    setModalMode('edit');
    setModalEditId(r.id);
    setModalOpen(true);
  };
  const saveEditRoom = async () => {
    try {
      if (!editingRoomId) return;
      const payload:any = {
        name: editRoomForm.name,
        description: editRoomForm.description,
        size_sqft: editRoomForm.size_sqft === '' ? null : Number(editRoomForm.size_sqft),
        view: editRoomForm.view,
        capacity: editRoomForm.capacity === '' ? null : Number(editRoomForm.capacity),
        base_rate: editRoomForm.base_rate === '' ? null : Number(editRoomForm.base_rate),
        images: editRoomForm.image1 ? [editRoomForm.image1] : [],
        attributes: {
          bed_configuration: editRoomForm.attributes?.bed_configuration || '',
          connectable: editRoomForm.attributes?.connectable === 'true',
          max_occupancy: editRoomForm.attributes?.max_occupancy || '',
          view_type: editRoomForm.attributes?.view_type || '',
          in_room_amenities: editRoomForm.attributes?.in_room_amenities_csv ? editRoomForm.attributes.in_room_amenities_csv.split(',').map((s:string) => s.trim()).filter(Boolean) : [],
          accessibility_features: editRoomForm.attributes?.accessibility_features_csv ? editRoomForm.attributes.accessibility_features_csv.split(',').map((s:string) => s.trim()).filter(Boolean) : [],
          typical_group_rate_usd: {
            low: editRoomForm.attributes?.typical_group_rate_low ? Number(editRoomForm.attributes.typical_group_rate_low) : null,
            high: editRoomForm.attributes?.typical_group_rate_high ? Number(editRoomForm.attributes.typical_group_rate_high) : null
          }
        }
      };
      await axios.put(`${apiUrl}/api/hotels/rooms/${editingRoomId}`, payload, auth);
      setEditingRoomId(null);
      fetchAll();
    } catch (e:any) { setError(e.response?.data?.message || 'Failed to save room'); }
  };
  const removeRoom = async (id:string) => { try { await axios.delete(`${apiUrl}/api/hotels/rooms/${id}`, auth); fetchAll(); } catch(e:any){ setError(e.response?.data?.message || 'Delete failed'); } };

  // Venues CRUD
  const addVenue = async () => {
    try {
      const payload:any = {
        name: newVenue.name, description: newVenue.description, sqft: Number(newVenue.sqft||0), ceiling_height_ft: Number(newVenue.ceiling_height_ft||0),
        capacity_reception: Number(newVenue.capacity_reception||0), capacity_banquet: Number(newVenue.capacity_banquet||0), capacity_theater: Number(newVenue.capacity_theater||0),
        images: newVenue.image1 ? [newVenue.image1] : [],
        attributes: {
          length_m: newVenue.attributes?.length_m || '',
          width_m: newVenue.attributes?.width_m || '',
          height_m: newVenue.attributes?.height_m || '',
          floor_type: newVenue.attributes?.floor_type || '',
          natural_light: newVenue.attributes?.natural_light === 'true',
          rigging_points: newVenue.attributes?.rigging_points === 'true',
          theater: newVenue.attributes?.theater || '',
          classroom: newVenue.attributes?.classroom || '',
          banquet_rounds_10: newVenue.attributes?.banquet_rounds_10 || '',
          reception: newVenue.attributes?.reception || '',
          u_shape: newVenue.attributes?.u_shape || '',
          boardroom: newVenue.attributes?.boardroom || '',
          rental_fee_usd_day: newVenue.attributes?.rental_fee_usd_day || '',
          setup_tear_down_fee_usd: newVenue.attributes?.setup_tear_down_fee_usd || ''
        }
      };
      await axios.post(`${apiUrl}/api/hotels/venues`, payload, auth);
      setNewVenue({ name: '', description: '', sqft: '', ceiling_height_ft: '', capacity_reception: '', capacity_banquet: '', capacity_theater: '', image1: '', attributes: { length_m:'', width_m:'', height_m:'', floor_type:'', natural_light:'false', rigging_points:'false', theater:'', classroom:'', banquet_rounds_10:'', reception:'', u_shape:'', boardroom:'', rental_fee_usd_day:'', setup_tear_down_fee_usd:'' } });
      fetchAll();
    } catch (e:any) { setError(e.response?.data?.message || 'Failed to add venue'); }
  };
  const startEditVenue = (v:any) => {
    setEditingVenueId(v.id);
    setEditVenueForm({ 
      name: v.name||'', 
      description: v.description||'', 
      sqft: v.sqft||'', 
      ceiling_height_ft: v.ceiling_height_ft||'', 
      capacity_reception: v.capacity_reception||'', 
      capacity_banquet: v.capacity_banquet||'', 
      capacity_theater: v.capacity_theater||'', 
      image1: Array.isArray(v.images)&&v.images[0]?v.images[0]:'',
      attributes: {
        length_m: v.attributes?.length_m || '',
        width_m: v.attributes?.width_m || '',
        height_m: v.attributes?.height_m || '',
        floor_type: v.attributes?.floor_type || '',
        natural_light: v.attributes?.natural_light || 'false',
        rigging_points: v.attributes?.rigging_points || 'false',
        theater: v.attributes?.theater || '',
        classroom: v.attributes?.classroom || '',
        banquet_rounds_10: v.attributes?.banquet_rounds_10 || '',
        reception: v.attributes?.reception || '',
        u_shape: v.attributes?.u_shape || '',
        boardroom: v.attributes?.boardroom || '',
        rental_fee_usd_day: v.attributes?.rental_fee_usd_day || '',
        setup_tear_down_fee_usd: v.attributes?.setup_tear_down_fee_usd || ''
      }
    });
  };
  const saveEditVenue = async () => {
    try {
      if (!editingVenueId) return;
      const payload:any = {
        name: editVenueForm.name, description: editVenueForm.description, sqft: editVenueForm.sqft===''?null:Number(editVenueForm.sqft), ceiling_height_ft: editVenueForm.ceiling_height_ft===''?null:Number(editVenueForm.ceiling_height_ft),
        capacity_reception: editVenueForm.capacity_reception===''?null:Number(editVenueForm.capacity_reception), capacity_banquet: editVenueForm.capacity_banquet===''?null:Number(editVenueForm.capacity_banquet), capacity_theater: editVenueForm.capacity_theater===''?null:Number(editVenueForm.capacity_theater),
        images: editVenueForm.image1 ? [editVenueForm.image1] : [],
        attributes: editVenueForm.attributes
      };
      await axios.put(`${apiUrl}/api/hotels/venues/${editingVenueId}`, payload, auth);
      setEditingVenueId(null);
      fetchAll();
    } catch (e:any) { setError(e.response?.data?.message || 'Failed to save venue'); }
  };
  const removeVenue = async (id:string) => { try { await axios.delete(`${apiUrl}/api/hotels/venues/${id}`, auth); fetchAll(); } catch(e:any){ setError(e.response?.data?.message || 'Delete failed'); } };

  // Dining CRUD
  const addDining = async () => {
    try {
      const payload:any = { name: newDiningOutlet.name, cuisine: newDiningOutlet.cuisine, description: newDiningOutlet.description, hours: newDiningOutlet.hours, dress_code: newDiningOutlet.dress_code, images: newDiningOutlet.image1?[newDiningOutlet.image1]:[], attributes: {
        buyout_available: newDiningOutlet.attributes?.buyout_available === 'true',
        buyout_min_spend_usd: newDiningOutlet.attributes?.buyout_min_spend_usd || '',
        seating_capacity: newDiningOutlet.attributes?.seating_capacity || '',
        standing_capacity: newDiningOutlet.attributes?.standing_capacity || '',
        private_rooms_csv: newDiningOutlet.attributes?.private_rooms_csv || '',
        outdoor: newDiningOutlet.attributes?.outdoor === 'true',
        noise_restrictions_after: newDiningOutlet.attributes?.noise_restrictions_after || ''
      } };
      await axios.post(`${apiUrl}/api/hotels/dining`, payload, auth);
      setNewDiningOutlet({ name: '', cuisine: '', description: '', hours: '', dress_code: '', image1: '', attributes: { buyout_available:'false', buyout_min_spend_usd:'', seating_capacity:'', standing_capacity:'', private_rooms_csv:'', outdoor:'false', noise_restrictions_after:'' } });
      fetchAll();
    } catch (e:any) { setError(e.response?.data?.message || 'Failed to add outlet'); }
  };
  const startEditDining = (d:any) => { 
    setEditingDiningId(d.id); 
    setEditDiningForm({ 
      name: d.name||'', 
      cuisine: d.cuisine||'', 
      description: d.description||'', 
      hours: d.hours||'', 
      dress_code: d.dress_code||'', 
      image1: Array.isArray(d.images)&&d.images[0]?d.images[0]:'',
      attributes: {
        buyout_available: d.attributes?.buyout_available || 'false',
        buyout_min_spend_usd: d.attributes?.buyout_min_spend_usd || '',
        seating_capacity: d.attributes?.seating_capacity || '',
        standing_capacity: d.attributes?.standing_capacity || '',
        private_rooms_csv: d.attributes?.private_rooms_csv || '',
        outdoor: d.attributes?.outdoor || 'false',
        noise_restrictions_after: d.attributes?.noise_restrictions_after || ''
      }
    }); 
  };
  const saveEditDining = async () => { try { if(!editingDiningId) return; const payload:any = { name: editDiningForm.name, cuisine: editDiningForm.cuisine, description: editDiningForm.description, hours: editDiningForm.hours, dress_code: editDiningForm.dress_code, images: editDiningForm.image1?[editDiningForm.image1]:[], attributes: editDiningForm.attributes }; await axios.put(`${apiUrl}/api/hotels/dining/${editingDiningId}`, payload, auth); setEditingDiningId(null); fetchAll(); } catch(e:any){ setError(e.response?.data?.message || 'Failed to save outlet'); } };
  const removeDining = async (id:string) => { try { await axios.delete(`${apiUrl}/api/hotels/dining/${id}`, auth); fetchAll(); } catch(e:any){ setError(e.response?.data?.message || 'Delete failed'); } };

  if (!hotelToken) {
    return (
      <div className="container">
        <div className="alert alert-error">Not authenticated. Please login as a hotel manager.</div>
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

      <div className="tabbar">
        <button className={`btn btn-sm ${activeTab==='overview'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('overview')}>Overview</button>
        <button className={`btn btn-sm ${activeTab==='profile'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('profile')}>Profile</button>
        <button className={`btn btn-sm ${activeTab==='contact'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('contact')}>Contact</button>
        <button className={`btn btn-sm ${activeTab==='location'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('location')}>Location</button>
        <button className={`btn btn-sm ${activeTab==='images'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('images')}>Images & Media</button>
        <button className={`btn btn-sm ${activeTab==='policies'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('policies')}>Policies</button>
        <button className={`btn btn-sm ${activeTab==='financials'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('financials')}>Financials</button>
        <button className={`btn btn-sm ${activeTab==='amenities'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('amenities')}>Amenities</button>
        <button className={`btn btn-sm ${activeTab==='workflow'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('workflow')}>Workflow</button>
        <button className={`btn btn-sm ${activeTab==='rooms'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('rooms')}>Rooms</button>
        <button className={`btn btn-sm ${activeTab==='venues'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('venues')}>Venues</button>
        <button className={`btn btn-sm ${activeTab==='dining'?'btn-primary':'btn-outline'}`} onClick={()=>setActiveTab('dining')}>Dining</button>
      </div>

      {activeTab==='overview' && (
      <div className="hotel-profile">
        {/* Hero Section */}
        {images.length > 0 && (
          <div className="hotel-hero">
            <img src={images[0].url} alt={hotel?.name || 'Hotel'} />
            <div className="hotel-hero-content">
              <h1>{hotel?.name || 'Grand Velas Los Cabos'}</h1>
              <div className="hotel-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
                <span>{hotel?.rating_level || 'Luxury Resort'}</span>
              </div>
              <p>{hotel?.address}, {hotel?.city}, {hotel?.country}</p>
            </div>
          </div>
        )}
        
        <div className="hotel-info-grid">
          <div>
            {/* About Section */}
            <div className="hotel-section">
              <h3>About {hotel?.name}</h3>
              <p>{schemaDraft?.identity?.description_long || hotel?.description || 'Experience unparalleled luxury at this beachfront resort offering world-class amenities and exceptional service.'}</p>
            </div>
            
            {/* Amenities Section */}
            <div className="hotel-section">
              <h3>Amenities & Features</h3>
              <div className="amenity-grid">
                {(schemaDraft?.amenities_property || []).map((amenity: string, i: number) => (
                  <div key={i} className="amenity-item">
                    <span>✓</span> {amenity}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rooms Section */}
            {rooms.length > 0 && (
              <div className="hotel-section">
                <h3>Accommodations</h3>
                <div className="room-showcase">
                  {rooms.map(room => (
                    <div key={room.id} className="room-card">
                      {room.images?.[0] && <img src={room.images[0]} alt={room.name} />}
                      <div className="room-card-content">
                        <h4>{room.name}</h4>
                        <p>{room.description}</p>
                        <p className="room-info">
                          {room.size_sqft && `${room.size_sqft} sq ft`}
                          {room.view && ` • ${room.view} view`}
                          {room.capacity && ` • Sleeps ${room.capacity}`}
                        </p>
                        {room.base_rate && <p><strong>From ${room.base_rate}/night</strong></p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Venues Section */}
            {venues.length > 0 && (
              <div className="hotel-section">
                <h3>Meeting & Event Spaces</h3>
                <div className="venue-showcase">
                  {venues.map(venue => (
                    <div key={venue.id} className="room-card">
                      {venue.images?.[0] && <img src={venue.images[0]} alt={venue.name} />}
                      <div className="room-card-content">
                        <h4>{venue.name}</h4>
                        <p>{venue.description}</p>
                        <p className="room-info">
                          {venue.sqft && `${venue.sqft} sq ft`}
                          {venue.capacity_reception && ` • Reception: ${venue.capacity_reception}`}
                          {venue.capacity_banquet && ` • Banquet: ${venue.capacity_banquet}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Dining Section */}
            {dining.length > 0 && (
              <div className="hotel-section">
                <h3>Dining Options</h3>
                <div className="dining-showcase">
                  {dining.map(outlet => (
                    <div key={outlet.id} className="room-card">
                      {outlet.images?.[0] && <img src={outlet.images[0]} alt={outlet.name} />}
                      <div className="room-card-content">
                        <h4>{outlet.name}</h4>
                        <p>{outlet.cuisine}</p>
                        <p>{outlet.description}</p>
                        <p className="room-info">{outlet.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Contact Info */}
            <div className="hotel-section">
              <h3>Contact Information</h3>
              <p><strong>Phone:</strong> {schemaDraft?.contact?.primary_contact?.phone || '+52 322 226 8000'}</p>
              <p><strong>Email:</strong> {schemaDraft?.contact?.primary_contact?.email || 'info@grandvelas.com'}</p>
              <p><strong>Website:</strong> <a href={hotel?.website || '#'} target="_blank" rel="noopener noreferrer">{hotel?.website}</a></p>
            </div>
            
            {/* Location */}
            <div className="hotel-section">
              <h3>Location</h3>
              <p>{hotel?.address}</p>
              <p>{hotel?.city}, {hotel?.country}</p>
              {schemaDraft?.location?.transport?.distance_to_airports_km && (
                <p><strong>Airport:</strong> {Object.entries(schemaDraft.location.transport.distance_to_airports_km)[0] && `${Object.entries(schemaDraft.location.transport.distance_to_airports_km)[0][0]} - ${Object.entries(schemaDraft.location.transport.distance_to_airports_km)[0][1]}km`}</p>
              )}
            </div>
            
            {/* Policies */}
            <div className="hotel-section">
              <h3>Policies</h3>
              <p><strong>Check-in:</strong> {schemaDraft?.policies?.check_in_time || '3:00 PM'}</p>
              <p><strong>Check-out:</strong> {schemaDraft?.policies?.check_out_time || '11:00 AM'}</p>
              <p><strong>Pets:</strong> {schemaDraft?.policies?.pets_allowed ? 'Allowed' : 'Not Allowed'}</p>
              <p><strong>Smoking:</strong> {schemaDraft?.policies?.smoking || 'Non-smoking property'}</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab==='profile' && (
        <section className="card">
          <h2>Profile</h2>
          <h3>Identity</h3>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Legal Name</label><input className="form-control" value={schemaDraft?.identity?.legal_name||''} onChange={(e)=>updateDraft(['identity','legal_name'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Brand Name</label><input className="form-control" value={schemaDraft?.identity?.brand_name||''} onChange={(e)=>updateDraft(['identity','brand_name'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Chain</label><input className="form-control" value={schemaDraft?.identity?.chain||''} onChange={(e)=>updateDraft(['identity','chain'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Opening Date</label><input type="date" className="form-control" value={schemaDraft?.identity?.opening_date||''} onChange={(e)=>updateDraft(['identity','opening_date'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Renovation Date</label><input type="date" className="form-control" value={schemaDraft?.identity?.last_renovation_date||''} onChange={(e)=>updateDraft(['identity','last_renovation_date'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Star Rating</label><input type="number" step="0.1" className="form-control" value={schemaDraft?.identity?.star_rating??''} onChange={(e)=>updateDraft(['identity','star_rating'], Number(e.target.value||0))} /></div>
            <div className="form-group full-width"><label className="form-label">Short Description</label><input className="form-control" value={schemaDraft?.identity?.description_short||''} onChange={(e)=>updateDraft(['identity','description_short'], e.target.value)} /></div>
            <div className="form-group full-width"><label className="form-label">Long Description</label><textarea className="form-control" value={schemaDraft?.identity?.description_long||''} onChange={(e)=>updateDraft(['identity','description_long'], e.target.value)} /></div>
          </div>
          <h3>Metadata</h3>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={schemaDraft?.metadata?.status||'active'} onChange={(e)=>updateDraft(['metadata','status'], e.target.value)}><option>active</option><option>draft</option><option>suspended</option></select></div>
            <div className="form-group"><label className="form-label">Visibility</label><select className="form-control" value={schemaDraft?.metadata?.visibility||'public'} onChange={(e)=>updateDraft(['metadata','visibility'], e.target.value)}><option>public</option><option>private</option></select></div>
            <div className="form-group"><label className="form-label">Languages (comma)</label><input className="form-control" value={(schemaDraft?.metadata?.languages_supported||[]).join(', ')} onChange={(e)=>updateDraft(['metadata','languages_supported'], e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} /></div>
            <div className="form-group"><label className="form-label">Timezone</label><input className="form-control" value={schemaDraft?.metadata?.timezone||''} onChange={(e)=>updateDraft(['metadata','timezone'], e.target.value)} /></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('identity')} disabled={saving}>{saving?'Saving...':'Save Identity'}</button>
            <button className="btn btn-outline" onClick={()=>saveSection('metadata')} disabled={saving}>Save Metadata</button>
          </div>
        </section>
      )}

      {activeTab==='contact' && (
        <section className="card">
          <h2>Contact</h2>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Primary Name</label><input className="form-control" value={schemaDraft?.contact?.primary_contact?.name||''} onChange={(e)=>updateDraft(['contact','primary_contact','name'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={schemaDraft?.contact?.primary_contact?.title||''} onChange={(e)=>updateDraft(['contact','primary_contact','title'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={schemaDraft?.contact?.primary_contact?.email||''} onChange={(e)=>updateDraft(['contact','primary_contact','email'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={schemaDraft?.contact?.primary_contact?.phone||''} onChange={(e)=>updateDraft(['contact','primary_contact','phone'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Preferred Contact</label><select className="form-control" value={schemaDraft?.contact?.primary_contact?.preferred_contact_method||'email'} onChange={(e)=>updateDraft(['contact','primary_contact','preferred_contact_method'], e.target.value)}><option>email</option><option>phone</option></select></div>
            <div className="form-group full-width"><label className="form-label">RFP Inbox Email</label><input className="form-control" value={schemaDraft?.contact?.rfp_inbox_email||''} onChange={(e)=>updateDraft(['contact','rfp_inbox_email'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Website URL</label><input className="form-control" value={schemaDraft?.contact?.website_url||''} onChange={(e)=>updateDraft(['contact','website_url'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Booking Portal URL</label><input className="form-control" value={schemaDraft?.contact?.booking_portal_url||''} onChange={(e)=>updateDraft(['contact','booking_portal_url'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Virtual Tour URL</label><input className="form-control" value={schemaDraft?.contact?.virtual_tour_url||''} onChange={(e)=>updateDraft(['contact','virtual_tour_url'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Instagram</label><input className="form-control" value={schemaDraft?.contact?.social?.instagram||''} onChange={(e)=>updateDraft(['contact','social','instagram'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-control" value={schemaDraft?.contact?.social?.linkedin||''} onChange={(e)=>updateDraft(['contact','social','linkedin'], e.target.value)} /></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('contact')} disabled={saving}>{saving?'Saving...':'Save Contact'}</button>
          </div>
        </section>
      )}

      {activeTab==='location' && (
        <section className="card">
          <h2>Location</h2>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Address Line 1</label><input className="form-control" value={schemaDraft?.location?.address?.line1||''} onChange={(e)=>updateDraft(['location','address','line1'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Line 2</label><input className="form-control" value={schemaDraft?.location?.address?.line2||''} onChange={(e)=>updateDraft(['location','address','line2'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">City</label><input className="form-control" value={schemaDraft?.location?.address?.city||''} onChange={(e)=>updateDraft(['location','address','city'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">State/Region</label><input className="form-control" value={schemaDraft?.location?.address?.state_region||''} onChange={(e)=>updateDraft(['location','address','state_region'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Postal Code</label><input className="form-control" value={schemaDraft?.location?.address?.postal_code||''} onChange={(e)=>updateDraft(['location','address','postal_code'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Country</label><input className="form-control" value={schemaDraft?.location?.address?.country||''} onChange={(e)=>updateDraft(['location','address','country'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Latitude</label><input type="number" className="form-control" value={schemaDraft?.location?.latitude??''} onChange={(e)=>updateDraft(['location','latitude'], Number(e.target.value||0))} /></div>
            <div className="form-group"><label className="form-label">Longitude</label><input type="number" className="form-control" value={schemaDraft?.location?.longitude??''} onChange={(e)=>updateDraft(['location','longitude'], Number(e.target.value||0))} /></div>
            <div className="form-group full-width"><label className="form-label">Neighborhood</label><input className="form-control" value={schemaDraft?.location?.neighborhood||''} onChange={(e)=>updateDraft(['location','neighborhood'], e.target.value)} /></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('location')} disabled={saving}>{saving?'Saving...':'Save Location'}</button>
          </div>
        </section>
      )}

      {activeTab==='policies' && (
        <section className="card">
          <h2>Policies</h2>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Check-in Time</label><input className="form-control" value={schemaDraft?.policies?.check_in_time||''} onChange={(e)=>setSchemaDraft((p:any)=>({...p, policies:{...(p?.policies||{}), check_in_time:e.target.value}}))} /></div>
            <div className="form-group"><label className="form-label">Check-out Time</label><input className="form-control" value={schemaDraft?.policies?.check_out_time||''} onChange={(e)=>setSchemaDraft((p:any)=>({...p, policies:{...(p?.policies||{}), check_out_time:e.target.value}}))} /></div>
            <div className="form-group"><label className="form-label">Smoking</label><input className="form-control" value={schemaDraft?.policies?.smoking||''} onChange={(e)=>setSchemaDraft((p:any)=>({...p, policies:{...(p?.policies||{}), smoking:e.target.value}}))} /></div>
            <div className="form-group"><label className="form-label">Pets Allowed</label><select className="form-control" value={String(!!schemaDraft?.policies?.pets_allowed)} onChange={(e)=>setSchemaDraft((p:any)=>({...p, policies:{...(p?.policies||{}), pets_allowed:e.target.value==='true'}}))}><option value="true">true</option><option value="false">false</option></select></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('policies')} disabled={saving}>{saving?'Saving...':'Save Policies'}</button>
          </div>
        </section>
      )}

      {activeTab==='financials' && (
        <section className="card">
          <h2>Financials & Group Contracting</h2>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Currency</label><input className="form-control" value={schemaDraft?.financials_group_contracting?.currency||''} onChange={(e)=>updateDraft(['financials_group_contracting','currency'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Rate Types (comma)</label><input className="form-control" value={(schemaDraft?.financials_group_contracting?.rate_types_supported||[]).join(', ')} onChange={(e)=>updateDraft(['financials_group_contracting','rate_types_supported'], e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} /></div>
            <div className="form-group"><label className="form-label">Group Rate Min</label><input type="number" className="form-control" value={schemaDraft?.financials_group_contracting?.group_rate_range_usd_per_night?.min??''} onChange={(e)=>updateDraft(['financials_group_contracting','group_rate_range_usd_per_night','min'], Number(e.target.value||0))} /></div>
            <div className="form-group"><label className="form-label">Group Rate Max</label><input type="number" className="form-control" value={schemaDraft?.financials_group_contracting?.group_rate_range_usd_per_night?.max??''} onChange={(e)=>updateDraft(['financials_group_contracting','group_rate_range_usd_per_night','max'], Number(e.target.value||0))} /></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('financials_group_contracting')} disabled={saving}>{saving?'Saving...':'Save Financials'}</button>
          </div>
        </section>
      )}

      {activeTab==='amenities' && (
        <section className="card">
          <h2>Amenities</h2>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Outdoor Pool</label><select className="form-control" value={String(!!schemaDraft?.amenities_property?.pool?.outdoor)} onChange={(e)=>updateDraft(['amenities_property','pool','outdoor'], e.target.value==='true')}><option value="true">true</option><option value="false">false</option></select></div>
            <div className="form-group"><label className="form-label">Heated Pool</label><select className="form-control" value={String(!!schemaDraft?.amenities_property?.pool?.heated)} onChange={(e)=>updateDraft(['amenities_property','pool','heated'], e.target.value==='true')}><option value="true">true</option><option value="false">false</option></select></div>
            <div className="form-group"><label className="form-label">Fitness Hours</label><input className="form-control" value={schemaDraft?.amenities_property?.fitness_center?.hours||''} onChange={(e)=>updateDraft(['amenities_property','fitness_center','hours'], e.target.value)} /></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('amenities_property')} disabled={saving}>{saving?'Saving...':'Save Amenities'}</button>
          </div>
        </section>
      )}

      {activeTab==='workflow' && (
        <section className="card">
          <h2>Workflow</h2>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Lead Time Min Days (Large Events)</label><input type="number" className="form-control" value={schemaDraft?.workflow?.lead_time_min_days_for_large_events??''} onChange={(e)=>updateDraft(['workflow','lead_time_min_days_for_large_events'], Number(e.target.value||0))} /></div>
            <div className="form-group"><label className="form-label">RFP SLA Hours</label><input type="number" className="form-control" value={schemaDraft?.workflow?.rfp_response_sla_hours??''} onChange={(e)=>updateDraft(['workflow','rfp_response_sla_hours'], Number(e.target.value||0))} /></div>
            <div className="form-group"><label className="form-label">Proposal Template URL</label><input className="form-control" value={schemaDraft?.workflow?.proposal_template_url||''} onChange={(e)=>updateDraft(['workflow','proposal_template_url'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Contract Template URL</label><input className="form-control" value={schemaDraft?.workflow?.contract_template_url||''} onChange={(e)=>updateDraft(['workflow','contract_template_url'], e.target.value)} /></div>
            <div className="form-group"><label className="form-label">E-signature Supported</label><select className="form-control" value={String(!!schemaDraft?.workflow?.e_signature_supported)} onChange={(e)=>updateDraft(['workflow','e_signature_supported'], e.target.value==='true')}><option value="true">true</option><option value="false">false</option></select></div>
            <div className="form-group"><label className="form-label">Analytics Opt-in</label><select className="form-control" value={String(!!schemaDraft?.workflow?.analytics_opt_in)} onChange={(e)=>updateDraft(['workflow','analytics_opt_in'], e.target.value==='true')}><option value="true">true</option><option value="false">false</option></select></div>
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('workflow')} disabled={saving}>{saving?'Saving...':'Save Workflow'}</button>
          </div>
        </section>
      )}
      
      {activeTab==='amenities' && (
        <section className="card">
          <h2>Amenities & Features</h2>
          <p style={{marginBottom: '1rem', fontSize: '0.875rem', color: '#666'}}>Select all amenities available at your property</p>
          <div className="checkbox-list">
            {AMENITIES_LIST.map(amenity => (
              <div key={amenity} className="checkbox-item">
                <input 
                  type="checkbox" 
                  id={amenity}
                  checked={(schemaDraft?.amenities_property || []).includes(amenity)}
                  onChange={(e) => {
                    const current = schemaDraft?.amenities_property || [];
                    if (e.target.checked) {
                      updateDraft(['amenities_property'], [...current, amenity]);
                    } else {
                      updateDraft(['amenities_property'], current.filter((a: string) => a !== amenity));
                    }
                  }}
                />
                <label htmlFor={amenity}>{amenity}</label>
              </div>
            ))}
          </div>
          <div className="builder-actions mt-2">
            <button className="btn btn-primary" onClick={()=>saveSection('amenities_property')} disabled={saving}>
              {saving?'Saving...':'Save Amenities'}
            </button>
          </div>
        </section>
      )}

      {activeTab==='images' && (
      <section className="card">
        <h2>Images & Media</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">New Image URL</label>
            <input className="form-control" value={imageForm.url} onChange={(e)=>setImageForm({...imageForm, url:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Alt Text</label>
            <input className="form-control" value={imageForm.alt} onChange={(e)=>setImageForm({...imageForm, alt:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-control" value={imageForm.category} onChange={(e)=>setImageForm({...imageForm, category:e.target.value})} />
          </div>
        </div>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={addImage}>Add Image</button>
        </div>
        <div className="selection-grid">
          {images.map(i => (
            <div key={i.id} className="selection-card">
              <img src={i.url} alt={i.alt || ''} />
              <div className="card-content">
                <p className="description">{i.category || 'image'}</p>
                <div className="builder-actions">
                  <button className="btn btn-outline" onClick={()=>deleteImage(i.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeTab==='rooms' && (
      <section className="card">
        <h2>Rooms</h2>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={() => {
            setNewRoom({ name: '', description: '', size_sqft: '', view: '', capacity: '', base_rate: '', image1: '', attributes: { bed_configuration: '', connectable: 'false', max_occupancy: '', view_type: '', in_room_amenities_csv: '', accessibility_features_csv: '', typical_group_rate_low: '', typical_group_rate_high: '' } });
            setModalType('room');
            setModalMode('add');
            setModalOpen(true);
          }}>Add New Room</button>
        </div>
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
                <p className="capacity">${r.base_rate}/night</p>
                <div className="builder-actions">
                  <button className="btn btn-outline" onClick={()=>startEditRoom(r)}>Edit</button>
                  <button className="btn btn-outline" onClick={()=>removeRoom(r.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeTab==='venues' && (
      <section className="card">
        <h2>Venues</h2>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={newVenue.name} onChange={(e)=>setNewVenue({...newVenue, name:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={newVenue.description} onChange={(e)=>setNewVenue({...newVenue, description:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Sq Ft</label><input className="form-control" value={newVenue.sqft} onChange={(e)=>setNewVenue({...newVenue, sqft:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Ceiling Height (ft)</label><input className="form-control" value={newVenue.ceiling_height_ft} onChange={(e)=>setNewVenue({...newVenue, ceiling_height_ft:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Reception Capacity</label><input className="form-control" value={newVenue.capacity_reception} onChange={(e)=>setNewVenue({...newVenue, capacity_reception:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Banquet Capacity</label><input className="form-control" value={newVenue.capacity_banquet} onChange={(e)=>setNewVenue({...newVenue, capacity_banquet:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Theater Capacity</label><input className="form-control" value={newVenue.capacity_theater} onChange={(e)=>setNewVenue({...newVenue, capacity_theater:e.target.value})} /></div>
          <div className="form-group full-width"><label className="form-label">Image URL</label><input className="form-control" value={newVenue.image1} onChange={(e)=>setNewVenue({...newVenue, image1:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Length (m)</label><input className="form-control" value={newVenue.attributes.length_m} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, length_m:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Width (m)</label><input className="form-control" value={newVenue.attributes.width_m} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, width_m:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Height (m)</label><input className="form-control" value={newVenue.attributes.height_m} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, height_m:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Floor Type</label><input className="form-control" value={newVenue.attributes.floor_type} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, floor_type:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Natural Light</label><select className="form-control" value={newVenue.attributes.natural_light} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, natural_light:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
          <div className="form-group"><label className="form-label">Rigging Points</label><select className="form-control" value={newVenue.attributes.rigging_points} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, rigging_points:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
          <div className="form-group"><label className="form-label">Theater Layout</label><input className="form-control" value={newVenue.attributes.theater} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, theater:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Classroom Layout</label><input className="form-control" value={newVenue.attributes.classroom} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, classroom:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Banquet Rounds 10</label><input className="form-control" value={newVenue.attributes.banquet_rounds_10} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, banquet_rounds_10:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Reception Layout</label><input className="form-control" value={newVenue.attributes.reception} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, reception:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">U-Shape Layout</label><input className="form-control" value={newVenue.attributes.u_shape} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, u_shape:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Boardroom Layout</label><input className="form-control" value={newVenue.attributes.boardroom} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, boardroom:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Rental Fee (USD/Day)</label><input className="form-control" value={newVenue.attributes.rental_fee_usd_day} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, rental_fee_usd_day:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Setup/Teardown Fee</label><input className="form-control" value={newVenue.attributes.setup_tear_down_fee_usd} onChange={(e)=>setNewVenue({...newVenue, attributes:{...newVenue.attributes, setup_tear_down_fee_usd:e.target.value}})} /></div>
        </div>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={addVenue}>Add Venue</button>
        </div>
        <div className="selection-grid">
          {venues.map(v => (
            <div key={v.id} className="selection-card">
              {Array.isArray(v.images) && v.images[0] && (
                <img src={v.images[0]} alt={v.name} />
              )}
              <div className="card-content">
                {editingVenueId===v.id ? (
                  <>
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={editVenueForm.name} onChange={(e)=>setEditVenueForm({...editVenueForm, name:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={editVenueForm.description} onChange={(e)=>setEditVenueForm({...editVenueForm, description:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Sq Ft</label><input className="form-control" value={editVenueForm.sqft} onChange={(e)=>setEditVenueForm({...editVenueForm, sqft:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Ceiling Height (ft)</label><input className="form-control" value={editVenueForm.ceiling_height_ft} onChange={(e)=>setEditVenueForm({...editVenueForm, ceiling_height_ft:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Reception Capacity</label><input className="form-control" value={editVenueForm.capacity_reception} onChange={(e)=>setEditVenueForm({...editVenueForm, capacity_reception:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Banquet Capacity</label><input className="form-control" value={editVenueForm.capacity_banquet} onChange={(e)=>setEditVenueForm({...editVenueForm, capacity_banquet:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Theater Capacity</label><input className="form-control" value={editVenueForm.capacity_theater} onChange={(e)=>setEditVenueForm({...editVenueForm, capacity_theater:e.target.value})} /></div>
                      <div className="form-group full-width"><label className="form-label">Image URL</label><input className="form-control" value={editVenueForm.image1} onChange={(e)=>setEditVenueForm({...editVenueForm, image1:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Length (m)</label><input className="form-control" value={editVenueForm.attributes.length_m} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, length_m:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Width (m)</label><input className="form-control" value={editVenueForm.attributes.width_m} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, width_m:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Height (m)</label><input className="form-control" value={editVenueForm.attributes.height_m} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, height_m:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Floor Type</label><input className="form-control" value={editVenueForm.attributes.floor_type} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, floor_type:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Natural Light</label><select className="form-control" value={editVenueForm.attributes.natural_light} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, natural_light:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
                      <div className="form-group"><label className="form-label">Rigging Points</label><select className="form-control" value={editVenueForm.attributes.rigging_points} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, rigging_points:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
                      <div className="form-group"><label className="form-label">Theater Layout</label><input className="form-control" value={editVenueForm.attributes.theater} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, theater:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Classroom Layout</label><input className="form-control" value={editVenueForm.attributes.classroom} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, classroom:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Banquet Rounds 10</label><input className="form-control" value={editVenueForm.attributes.banquet_rounds_10} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, banquet_rounds_10:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Reception Layout</label><input className="form-control" value={editVenueForm.attributes.reception} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, reception:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">U-Shape Layout</label><input className="form-control" value={editVenueForm.attributes.u_shape} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, u_shape:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Boardroom Layout</label><input className="form-control" value={editVenueForm.attributes.boardroom} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, boardroom:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Rental Fee (USD/Day)</label><input className="form-control" value={editVenueForm.attributes.rental_fee_usd_day} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, rental_fee_usd_day:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Setup/Teardown Fee</label><input className="form-control" value={editVenueForm.attributes.setup_tear_down_fee_usd} onChange={(e)=>setEditVenueForm({...editVenueForm, attributes:{...editVenueForm.attributes, setup_tear_down_fee_usd:e.target.value}})} /></div>
                    </div>
                    <div className="builder-actions">
                      <button className="btn btn-primary" onClick={saveEditVenue}>Save</button>
                      <button className="btn btn-outline" onClick={()=>setEditingVenueId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{v.name}</h3>
                    <p className="description">{v.description}</p>
                    <p className="size">{v.sqft} sq ft • {v.ceiling_height_ft} ft ceiling</p>
                    <p className="capacity">Reception {v.capacity_reception} • Banquet {v.capacity_banquet} • Theater {v.capacity_theater}</p>
                    <div className="builder-actions">
                      <button className="btn btn-outline" onClick={()=>startEditVenue(v)}>Edit</button>
                      <button className="btn btn-outline" onClick={()=>removeVenue(v.id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeTab==='dining' && (
      <section className="card">
        <h2>Dining</h2>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={newDiningOutlet.name} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, name:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Cuisine</label><input className="form-control" value={newDiningOutlet.cuisine} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, cuisine:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Hours</label><input className="form-control" value={newDiningOutlet.hours} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, hours:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Dress Code</label><input className="form-control" value={newDiningOutlet.dress_code} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, dress_code:e.target.value})} /></div>
          <div className="form-group full-width"><label className="form-label">Image URL</label><input className="form-control" value={newDiningOutlet.image1} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, image1:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Buyout Available</label><select className="form-control" value={newDiningOutlet.attributes.buyout_available} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, buyout_available:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
          <div className="form-group"><label className="form-label">Buyout Min Spend (USD)</label><input className="form-control" value={newDiningOutlet.attributes.buyout_min_spend_usd} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, buyout_min_spend_usd:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Seating Capacity</label><input className="form-control" value={newDiningOutlet.attributes.seating_capacity} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, seating_capacity:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Standing Capacity</label><input className="form-control" value={newDiningOutlet.attributes.standing_capacity} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, standing_capacity:e.target.value}})} /></div>
          <div className="form-group full-width"><label className="form-label">Private Rooms (comma)</label><input className="form-control" value={newDiningOutlet.attributes.private_rooms_csv} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, private_rooms_csv:e.target.value}})} /></div>
          <div className="form-group"><label className="form-label">Outdoor</label><select className="form-control" value={newDiningOutlet.attributes.outdoor} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, outdoor:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
          <div className="form-group"><label className="form-label">Noise Restrictions After</label><input className="form-control" value={newDiningOutlet.attributes.noise_restrictions_after} onChange={(e)=>setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, noise_restrictions_after:e.target.value}})} /></div>
        </div>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={addDining}>Add Dining Outlet</button>
        </div>
        <div className="selection-grid">
          {dining.map(d => (
            <div key={d.id} className="selection-card">
              {Array.isArray(d.images) && d.images[0] && (
                <img src={d.images[0]} alt={d.name} />
              )}
              <div className="card-content">
                {editingDiningId===d.id ? (
                  <>
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={editDiningForm.name} onChange={(e)=>setEditDiningForm({...editDiningForm, name:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Cuisine</label><input className="form-control" value={editDiningForm.cuisine} onChange={(e)=>setEditDiningForm({...editDiningForm, cuisine:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Hours</label><input className="form-control" value={editDiningForm.hours} onChange={(e)=>setEditDiningForm({...editDiningForm, hours:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Dress Code</label><input className="form-control" value={editDiningForm.dress_code} onChange={(e)=>setEditDiningForm({...editDiningForm, dress_code:e.target.value})} /></div>
                      <div className="form-group full-width"><label className="form-label">Image URL</label><input className="form-control" value={editDiningForm.image1} onChange={(e)=>setEditDiningForm({...editDiningForm, image1:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Buyout Available</label><select className="form-control" value={editDiningForm.attributes.buyout_available} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, buyout_available:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
                      <div className="form-group"><label className="form-label">Buyout Min Spend (USD)</label><input className="form-control" value={editDiningForm.attributes.buyout_min_spend_usd} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, buyout_min_spend_usd:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Seating Capacity</label><input className="form-control" value={editDiningForm.attributes.seating_capacity} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, seating_capacity:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Standing Capacity</label><input className="form-control" value={editDiningForm.attributes.standing_capacity} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, standing_capacity:e.target.value}})} /></div>
                      <div className="form-group full-width"><label className="form-label">Private Rooms (comma)</label><input className="form-control" value={editDiningForm.attributes.private_rooms_csv} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, private_rooms_csv:e.target.value}})} /></div>
                      <div className="form-group"><label className="form-label">Outdoor</label><select className="form-control" value={editDiningForm.attributes.outdoor} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, outdoor:e.target.value}})}><option value="false">false</option><option value="true">true</option></select></div>
                      <div className="form-group"><label className="form-label">Noise Restrictions After</label><input className="form-control" value={editDiningForm.attributes.noise_restrictions_after} onChange={(e)=>setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, noise_restrictions_after:e.target.value}})} /></div>
                    </div>
                    <div className="builder-actions">
                      <button className="btn btn-primary" onClick={saveEditDining}>Save</button>
                      <button className="btn btn-outline" onClick={()=>setEditingDiningId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{d.name}</h3>
                    <p className="description">{d.description}</p>
                    <p className="room-info">{d.cuisine} • {d.hours} • {d.dress_code}</p>
                    <div className="builder-actions">
                      <button className="btn btn-outline" onClick={()=>startEditDining(d)}>Edit</button>
                      <button className="btn btn-outline" onClick={()=>removeDining(d.id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Modal for editing */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setModalType(null);
          setModalMode('add');
          setModalEditId(null);
          setEditingRoomId(null);
          setEditingVenueId(null);
          setEditingDiningId(null);
        }}
        title={`${modalMode === 'edit' ? 'Edit' : 'Add'} ${modalType === 'room' ? 'Room' : modalType === 'venue' ? 'Venue' : modalType === 'dining' ? 'Dining Outlet' : ''}`}
      >
        {modalType === 'room' && (
          <div className="form-grid" style={{gap: '1rem'}}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.name : newRoom.name} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, name:e.target.value}) : setNewRoom({...newRoom, name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={modalMode === 'edit' ? editRoomForm.description : newRoom.description} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, description:e.target.value}) : setNewRoom({...newRoom, description:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Size (sqft)</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.size_sqft : newRoom.size_sqft} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, size_sqft:e.target.value}) : setNewRoom({...newRoom, size_sqft:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">View</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.view : newRoom.view} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, view:e.target.value}) : setNewRoom({...newRoom, view:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Capacity</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.capacity : newRoom.capacity} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, capacity:e.target.value}) : setNewRoom({...newRoom, capacity:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Base Rate (USD)</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.base_rate : newRoom.base_rate} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, base_rate:e.target.value}) : setNewRoom({...newRoom, base_rate:e.target.value})} /></div>
            <div className="form-group full-width"><label className="form-label">Image URL</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.image1 : newRoom.image1} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, image1:e.target.value}) : setNewRoom({...newRoom, image1:e.target.value})} /></div>
            <div className="form-group full-width" style={{borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}><h4>Additional Details</h4></div>
            <div className="form-group"><label className="form-label">Bed Configuration</label><input className="form-control" placeholder="e.g., King, Two Queens" value={modalMode === 'edit' ? editRoomForm.attributes.bed_configuration : newRoom.attributes.bed_configuration} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, bed_configuration:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, bed_configuration:e.target.value}})} /></div>
            <div className="form-group"><label className="form-label">Connectable</label><select className="form-control" value={modalMode === 'edit' ? editRoomForm.attributes.connectable : newRoom.attributes.connectable} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, connectable:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, connectable:e.target.value}})}><option value="false">No</option><option value="true">Yes</option></select></div>
            <div className="form-group"><label className="form-label">Max Occupancy</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.attributes.max_occupancy : newRoom.attributes.max_occupancy} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, max_occupancy:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, max_occupancy:e.target.value}})} /></div>
            <div className="form-group"><label className="form-label">View Type</label><input className="form-control" placeholder="e.g., Ocean, Garden, City" value={modalMode === 'edit' ? editRoomForm.attributes.view_type : newRoom.attributes.view_type} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, view_type:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, view_type:e.target.value}})} /></div>
            <div className="form-group full-width"><label className="form-label">In-Room Amenities</label><textarea className="form-control" rows={2} placeholder="Comma-separated list" value={modalMode === 'edit' ? editRoomForm.attributes.in_room_amenities_csv : newRoom.attributes.in_room_amenities_csv} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, in_room_amenities_csv:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, in_room_amenities_csv:e.target.value}})} /></div>
            <div className="form-group full-width"><label className="form-label">Accessibility Features</label><textarea className="form-control" rows={2} placeholder="Comma-separated list" value={modalMode === 'edit' ? editRoomForm.attributes.accessibility_features_csv : newRoom.attributes.accessibility_features_csv} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, accessibility_features_csv:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, accessibility_features_csv:e.target.value}})} /></div>
            <div className="form-group"><label className="form-label">Group Rate Low (USD)</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.attributes.typical_group_rate_low : newRoom.attributes.typical_group_rate_low} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, typical_group_rate_low:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, typical_group_rate_low:e.target.value}})} /></div>
            <div className="form-group"><label className="form-label">Group Rate High (USD)</label><input className="form-control" value={modalMode === 'edit' ? editRoomForm.attributes.typical_group_rate_high : newRoom.attributes.typical_group_rate_high} onChange={(e)=>modalMode === 'edit' ? setEditRoomForm({...editRoomForm, attributes:{...editRoomForm.attributes, typical_group_rate_high:e.target.value}}) : setNewRoom({...newRoom, attributes:{...newRoom.attributes, typical_group_rate_high:e.target.value}})} /></div>
            <div className="builder-actions full-width" style={{marginTop: '1.5rem'}}>
              <button className="btn btn-primary" onClick={async () => {
                if (modalMode === 'edit') {
                  await saveEditRoom();
                } else {
                  await addRoom();
                }
                setModalOpen(false);
              }}>{modalMode === 'edit' ? 'Save Changes' : 'Add Room'}</button>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default HotelPortal;


