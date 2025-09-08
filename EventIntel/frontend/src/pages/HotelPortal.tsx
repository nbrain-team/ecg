import { useEffect, useState } from 'react';
import axios from 'axios';
import './HotelPortal.css';
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
  const [sidebarTab, setSidebarTab] = useState<'overview'|'profile'|'contact'>('overview');
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
  
  // Image gallery state for modal forms
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  useEffect(() => {
    // Convert old amenities_property object format to array format
    if (schema && schema.amenities_property && !Array.isArray(schema.amenities_property)) {
      const amenitiesArray = Object.entries(schema.amenities_property)
        .filter(([_, value]) => value)
        .map(([key]) => {
          // Convert snake_case to Title Case for matching with AMENITIES_LIST
          const formatted = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          // Map to exact names in AMENITIES_LIST
          const mapping: {[key: string]: string} = {
            'Pool': 'Pool',
            'Fitness Center': 'Fitness Center',
            'Spa': 'Spa',
            'Beach Access': 'Beach Access',
            'Business Center': 'Business Center'
          };
          return mapping[formatted] || formatted;
        })
        .filter(amenity => AMENITIES_LIST.includes(amenity));
      setSchemaDraft({
        ...schema,
        amenities_property: amenitiesArray
      });
    } else {
      setSchemaDraft(schema);
    }
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
      // Temporarily use public endpoints for Grand Velas demo
      const isGrandVelasDemo = true; // Toggle this for production
      
      const [h, sc, im, rm, vn, dn] = await Promise.all([
        axios.get(`${apiUrl}/api/hotels/me`, auth).catch(() => ({ data: { name: 'Grand Velas Los Cabos', city: 'Los Cabos', country: 'Mexico' } })),
        axios.get(`${apiUrl}/api/hotels/schema`, auth).catch(() => ({ data: {} })),
        axios.get(`${apiUrl}/api/hotels/images`, auth).catch(() => ({ data: [] })),
        isGrandVelasDemo ? axios.get(`${apiUrl}/api/grand-velas/rooms`) : axios.get(`${apiUrl}/api/hotels/rooms`, auth),
        isGrandVelasDemo ? axios.get(`${apiUrl}/api/grand-velas/venues`) : axios.get(`${apiUrl}/api/hotels/venues`, auth),
        isGrandVelasDemo ? axios.get(`${apiUrl}/api/grand-velas/dining`) : axios.get(`${apiUrl}/api/hotels/dining`, auth)
      ]);
      console.log('API responses:', { h: h.data, sc: sc.data, im: im.data, rm: rm.data, vn: vn.data, dn: dn.data });
      setHotel(h.data);
      setSchema(sc.data || {});
      setImages(Array.isArray(im.data) ? im.data : []);
      setRooms(Array.isArray(rm.data) ? rm.data : []);
      setVenues(Array.isArray(vn.data) ? vn.data : []);
      setDining(Array.isArray(dn.data) ? dn.data : []);
    } catch (err: any) {
      console.error('fetchAll error:', err);
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
        images: newRoom.images?.length > 0 ? newRoom.images : (newRoom.image1 ? [newRoom.image1] : []),
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
      images: Array.isArray(r.images) ? r.images : [],
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
        images: editRoomForm.images?.length > 0 ? editRoomForm.images : (editRoomForm.image1 ? [editRoomForm.image1] : []),
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
        images: newVenue.images?.length > 0 ? newVenue.images : (newVenue.image1 ? [newVenue.image1] : []),
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
      setNewVenue({ name: '', description: '', sqft: '', ceiling_height_ft: '', capacity_reception: '', capacity_banquet: '', capacity_theater: '', image1: '', images: [], attributes: { length_m:'', width_m:'', height_m:'', floor_type:'', natural_light:'false', rigging_points:'false', theater:'', classroom:'', banquet_rounds_10:'', reception:'', u_shape:'', boardroom:'', rental_fee_usd_day:'', setup_tear_down_fee_usd:'' } });
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
      images: Array.isArray(v.images) ? v.images : [],
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
    setModalType('venue');
    setModalMode('edit');
    setModalEditId(v.id);
    setModalOpen(true);
  };
  const saveEditVenue = async () => {
    try {
      if (!editingVenueId) return;
      const payload:any = {
        name: editVenueForm.name, description: editVenueForm.description, sqft: editVenueForm.sqft===''?null:Number(editVenueForm.sqft), ceiling_height_ft: editVenueForm.ceiling_height_ft===''?null:Number(editVenueForm.ceiling_height_ft),
        capacity_reception: editVenueForm.capacity_reception===''?null:Number(editVenueForm.capacity_reception), capacity_banquet: editVenueForm.capacity_banquet===''?null:Number(editVenueForm.capacity_banquet), capacity_theater: editVenueForm.capacity_theater===''?null:Number(editVenueForm.capacity_theater),
        images: editVenueForm.images?.length > 0 ? editVenueForm.images : (editVenueForm.image1 ? [editVenueForm.image1] : []),
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
      const payload:any = { name: newDiningOutlet.name, cuisine: newDiningOutlet.cuisine, description: newDiningOutlet.description, hours: newDiningOutlet.hours, dress_code: newDiningOutlet.dress_code, images: newDiningOutlet.images?.length > 0 ? newDiningOutlet.images : (newDiningOutlet.image1 ? [newDiningOutlet.image1] : []), attributes: {
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
      images: Array.isArray(d.images) ? d.images : [],
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
    setModalType('dining');
    setModalMode('edit');
    setModalEditId(d.id);
    setModalOpen(true);
  };
  const saveEditDining = async () => { try { if(!editingDiningId) return; const payload:any = { name: editDiningForm.name, cuisine: editDiningForm.cuisine, description: editDiningForm.description, hours: editDiningForm.hours, dress_code: editDiningForm.dress_code, images: editDiningForm.images?.length > 0 ? editDiningForm.images : (editDiningForm.image1 ? [editDiningForm.image1] : []), attributes: editDiningForm.attributes }; await axios.put(`${apiUrl}/api/hotels/dining/${editingDiningId}`, payload, auth); setEditingDiningId(null); fetchAll(); } catch(e:any){ setError(e.response?.data?.message || 'Failed to save outlet'); } };
  const removeDining = async (id:string) => { try { await axios.delete(`${apiUrl}/api/hotels/dining/${id}`, auth); fetchAll(); } catch(e:any){ setError(e.response?.data?.message || 'Delete failed'); } };

  if (!hotelToken) {
    return (
      <div className="container">
        <div className="alert alert-error">Not authenticated. Please login as a hotel manager.</div>
      </div>
    );
  }

  return (
    <div className="hotel-portal-container">
      {/* Sidebar */}
      <div className="hotel-sidebar">
        <div className="hotel-sidebar-header">
          <h2 className="hotel-sidebar-title">Hotel Manager</h2>
          <p className="hotel-sidebar-subtitle">{hotel?.name || 'Loading...'}</p>
        </div>
        
        <nav className="hotel-sidebar-nav">
          <button 
            className={`hotel-sidebar-nav-item ${activeTab==='overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="hotel-sidebar-icon">📊</span>
            Overview
          </button>
          <button 
            className={`hotel-sidebar-nav-item ${activeTab==='profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="hotel-sidebar-icon">🏨</span>
            Profile
          </button>
          <button 
            className={`hotel-sidebar-nav-item ${activeTab==='contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <span className="hotel-sidebar-icon">📞</span>
            Contact
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="hotel-main-content">
        {/* Header */}
        <div className="hotel-header">
          <div className="hotel-header-content">
            <h1 className="hotel-page-title">
              {activeTab === 'overview' && 'Hotel Overview'}
              {activeTab === 'profile' && 'Hotel Profile'}
              {activeTab === 'contact' && 'Contact Information'}
              {activeTab === 'location' && 'Location Settings'}
              {activeTab === 'images' && 'Images & Media'}
              {activeTab === 'policies' && 'Hotel Policies'}
              {activeTab === 'financials' && 'Financial Settings'}
              {activeTab === 'amenities' && 'Amenities & Features'}
              {activeTab === 'workflow' && 'Workflow Settings'}
              {activeTab === 'rooms' && 'Room Management'}
              {activeTab === 'venues' && 'Venue Management'}
              {activeTab === 'dining' && 'Dining Management'}
            </h1>
            
            {/* Top Tab Navigation */}
            <div className="hotel-tab-nav">
              <button 
                className={`hotel-tab-btn ${activeTab==='location' ? 'active' : ''}`} 
                onClick={() => setActiveTab('location')}
              >Location</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='images' ? 'active' : ''}`} 
                onClick={() => setActiveTab('images')}
              >Images & Media</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='policies' ? 'active' : ''}`} 
                onClick={() => setActiveTab('policies')}
              >Policies</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='financials' ? 'active' : ''}`} 
                onClick={() => setActiveTab('financials')}
              >Financials</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='amenities' ? 'active' : ''}`} 
                onClick={() => setActiveTab('amenities')}
              >Amenities</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='workflow' ? 'active' : ''}`} 
                onClick={() => setActiveTab('workflow')}
              >Workflow</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='rooms' ? 'active' : ''}`} 
                onClick={() => setActiveTab('rooms')}
              >Rooms</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='venues' ? 'active' : ''}`} 
                onClick={() => setActiveTab('venues')}
              >Venues</button>
              <button 
                className={`hotel-tab-btn ${activeTab==='dining' ? 'active' : ''}`} 
                onClick={() => setActiveTab('dining')}
              >Dining</button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="hotel-content">
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="tab-content">
      {activeTab==='overview' && (
      <div className="hotel-profile">
        {/* Hero Section */}
        <div className="hotel-hero">
          <img 
            src="/images/grand-velas-los-cabos.jpg"
            alt={hotel?.name || 'Grand Velas Los Cabos'}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/rooms/grand-class-suite.jpg';
            }}
          />
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
                {Array.isArray(schemaDraft?.amenities_property) ? 
                  schemaDraft.amenities_property.map((amenity: string, i: number) => (
                    <div key={i} className="amenity-item">
                      <span>✓</span> {amenity}
                    </div>
                  )) : 
                  // If it's the old object format, show what's available
                  Object.entries(schemaDraft?.amenities_property || {}).filter(([_, value]) => value).map(([key], i) => (
                    <div key={i} className="amenity-item">
                      <span>✓</span> {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Rooms Section */}
            {rooms.length > 0 && (
              <div className="hotel-section">
                <h3>Accommodations</h3>
                <div className="room-showcase">
                  {(rooms || []).map(room => {
                    console.log('Room data:', room.name, room.images);
                    return (
                    <div key={room.id} className="room-card">
                      {room.images?.[0] && (
                        <img 
                          src={(room.images[0] || '').startsWith('http') ? room.images[0] : `${apiUrl}${room.images[0]}`} 
                          alt={room.name} 
                          onError={(e) => {
                            console.error('Image failed to load:', room.images[0]);
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/280x160?text=' + encodeURIComponent(room.name);
                          }} 
                        />
                      )}
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
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Venues Section */}
            {venues.length > 0 && (
              <div className="hotel-section">
                <h3>Meeting & Event Spaces</h3>
                <div className="venue-showcase">
                  {(venues || []).map(venue => (
                    <div key={venue.id} className="room-card">
                      {venue.images?.[0] && (
                        <img 
                          src={venue.images[0]} 
                          alt={venue.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/280x160?text=' + encodeURIComponent(venue.name);
                          }}
                        />
                      )}
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
                  {(dining || []).map(outlet => (
                    <div key={outlet.id} className="room-card">
                      {outlet.images?.[0] && (
                        <img 
                          src={outlet.images[0]} 
                          alt={outlet.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/280x160?text=' + encodeURIComponent(outlet.name);
                          }}
                        />
                      )}
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
            {(AMENITIES_LIST || []).map(amenity => (
              <div key={amenity} className="checkbox-item">
                <input 
                  type="checkbox" 
                  id={amenity}
                  checked={
                    Array.isArray(schemaDraft?.amenities_property) 
                      ? schemaDraft.amenities_property.includes(amenity)
                      : false
                  }
                  onChange={(e) => {
                    // Convert to array format if needed
                    const current = Array.isArray(schemaDraft?.amenities_property) 
                      ? schemaDraft.amenities_property 
                      : [];
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
          <div className="form-group">
            <label className="form-label">Upload Image</label>
            <input
              className="form-control"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const form = new FormData();
                  form.append('file', file);
                  form.append('alt', imageForm.alt || '');
                  form.append('category', imageForm.category || 'gallery');
                  const hotelToken = localStorage.getItem('hotelToken');
                  const headers = { Authorization: `Bearer ${hotelToken}` };
                  const resp = await axios.post(`${apiUrl}/api/hotels/images/upload`, form, {
                    headers,
                  });
                  // Refresh list
                  fetchAll();
                } catch (err:any) {
                  setError(err.response?.data?.message || 'Upload failed');
                }
              }}
            />
          </div>
        </div>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={addImage}>Add Image</button>
        </div>
        <div className="selection-grid">
          {(images || []).map(i => (
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
            setNewRoom({ name: '', description: '', size_sqft: '', view: '', capacity: '', base_rate: '', image1: '', images: [], attributes: { bed_configuration: '', connectable: 'false', max_occupancy: '', view_type: '', in_room_amenities_csv: '', accessibility_features_csv: '', typical_group_rate_low: '', typical_group_rate_high: '' } });
            setModalType('room');
            setModalMode('add');
            setModalOpen(true);
          }}>Add New Room</button>
        </div>
        <div className="selection-grid">
          {(rooms || []).map(r => (
            <div key={r.id} className="selection-card clickable" onClick={() => startEditRoom(r)}>
              {Array.isArray(r.images) && r.images[0] && (
                <img src={(r.images[0] || '').startsWith('http') ? r.images[0] : `${apiUrl}${r.images[0]}`} alt={r.name} onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/280x160?text=' + encodeURIComponent(r.name);
                }} />
              )}
              <div className="card-content">
                <h3>{r.name}</h3>
                <p className="description">{r.description}</p>
                <p className="room-info">{r.size_sqft ? `${r.size_sqft} sqft` : ''} {r.view ? `• ${r.view} view` : ''}</p>
                <p className="capacity">Sleeps {r.capacity}</p>
                <p className="capacity">${r.base_rate}/night</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeTab==='venues' && (
      <section className="card">
        <h2>Venues</h2>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={() => {
            setNewVenue({ name: '', description: '', sqft: '', ceiling_height_ft: '', capacity_reception: '', capacity_banquet: '', capacity_theater: '', image1: '', images: [], attributes: { length_m:'', width_m:'', height_m:'', floor_type:'', natural_light:'false', rigging_points:'false', theater:'', classroom:'', banquet_rounds_10:'', reception:'', u_shape:'', boardroom:'', rental_fee_usd_day:'', setup_tear_down_fee_usd:'' } });
            setModalType('venue');
            setModalMode('add');
            setModalOpen(true);
          }}>Add New Venue</button>
        </div>
        <div className="selection-grid">
          {(venues || []).map(v => (
            <div key={v.id} className="selection-card clickable" onClick={() => startEditVenue(v)}>
              {Array.isArray(v.images) && v.images[0] && (
                <img src={v.images[0]} alt={v.name} onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/280x160?text=' + encodeURIComponent(v.name);
                }} />
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
      )}

      {activeTab==='dining' && (
      <section className="card">
        <h2>Dining</h2>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={() => {
            setNewDiningOutlet({ name: '', cuisine: '', description: '', hours: '', dress_code: '', image1: '', attributes: { buyout_available:'false', buyout_min_spend_usd:'', seating_capacity:'', standing_capacity:'', private_rooms_csv:'', outdoor:'false', noise_restrictions_after:'' } });
            setModalType('dining');
            setModalMode('add');
            setModalOpen(true);
          }}>Add New Dining Outlet</button>
        </div>
        <div className="selection-grid">
          {(dining || []).map(d => (
            <div key={d.id} className="selection-card clickable" onClick={() => startEditDining(d)}>
              {Array.isArray(d.images) && d.images[0] && (
                <img 
                  src={d.images[0]} 
                  alt={d.name}
                  onError={(e) => {
                    console.error('Dining image failed to load:', d.images[0]);
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/280x160?text=' + encodeURIComponent(d.name);
                  }}
                />
              )}
              <div className="card-content">
                <h3>{d.name}</h3>
                <p className="description">{d.description}</p>
                <p className="room-info">{d.cuisine} • {d.hours} • {d.dress_code}</p>
                {(d.attributes?.seating_capacity || d.attributes?.standing_capacity) && (
                  <p className="capacity">Capacity: {d.attributes.seating_capacity ? `${d.attributes.seating_capacity} seated` : ''}{d.attributes.seating_capacity && d.attributes.standing_capacity ? ', ' : ''}{d.attributes.standing_capacity ? `${d.attributes.standing_capacity} standing` : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
      </div>

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
            <div className="form-group full-width" style={{borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
              <h4>Image Gallery</h4>
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                <input 
                  className="form-control" 
                  placeholder="Enter image URL"
                  value={currentImageUrl}
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                />
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    if (currentImageUrl) {
                      const form = modalMode === 'edit' ? editRoomForm : newRoom;
                      const currentImages = form.images || [];
                      if (form.image1 && !currentImages.includes(form.image1)) {
                        currentImages.unshift(form.image1);
                      }
                      if (!currentImages.includes(currentImageUrl)) {
                        if (modalMode === 'edit') {
                          setEditRoomForm({...editRoomForm, images: [...currentImages, currentImageUrl]});
                        } else {
                          setNewRoom({...newRoom, images: [...currentImages, currentImageUrl]});
                        }
                      }
                      setCurrentImageUrl('');
                    }
                  }}
                >
                  Add Image
                </button>
                <label className="btn btn-outline" htmlFor="room-image-upload">Upload Image</label>
                <input id="room-image-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async (e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const hotelToken = localStorage.getItem('hotelToken');
                    const headers = { Authorization: `Bearer ${hotelToken}` };
                    const resp = await axios.post(`${apiUrl}/api/hotels/images/upload`, formData, { headers });
                    const url = resp.data?.url || resp.data?.url; // server returns record with url
                    const form = modalMode === 'edit' ? editRoomForm : newRoom;
                    const currentImages = form.images || [];
                    const next = [...currentImages, resp.data.url];
                    if (modalMode === 'edit') setEditRoomForm({...editRoomForm, images: next}); else setNewRoom({...newRoom, images: next});
                  } catch(err:any){ setError(err.response?.data?.message || 'Upload failed'); }
                }} />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem'}}>
                {((modalMode === 'edit' ? editRoomForm.images : newRoom.images) || []).map((img: string, idx: number) => (
                  <div key={idx} style={{position: 'relative', paddingBottom: '75%', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden'}}>
                    <img 
                      src={img} 
                      alt={`Room ${idx + 1}`} 
                      style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}}
                      onError={(e) => {e.currentTarget.src = 'https://placehold.co/400x300?text=Invalid+Image'}}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', padding: '2px 8px'}}
                      onClick={() => {
                        const form = modalMode === 'edit' ? editRoomForm : newRoom;
                        const newImages = form.images.filter((_: unknown, i: number) => i !== idx);
                        if (modalMode === 'edit') {
                          setEditRoomForm({...editRoomForm, images: newImages});
                        } else {
                          setNewRoom({...newRoom, images: newImages});
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
        
        {modalType === 'venue' && (
          <div className="form-grid" style={{gap: '1rem'}}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={modalMode === 'edit' ? editVenueForm.name : newVenue.name} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, name:e.target.value}) : setNewVenue({...newVenue, name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={modalMode === 'edit' ? editVenueForm.description : newVenue.description} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, description:e.target.value}) : setNewVenue({...newVenue, description:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Square Feet</label><input className="form-control" value={modalMode === 'edit' ? editVenueForm.sqft : newVenue.sqft} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, sqft:e.target.value}) : setNewVenue({...newVenue, sqft:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Ceiling Height (ft)</label><input className="form-control" value={modalMode === 'edit' ? editVenueForm.ceiling_height_ft : newVenue.ceiling_height_ft} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, ceiling_height_ft:e.target.value}) : setNewVenue({...newVenue, ceiling_height_ft:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Reception Capacity</label><input className="form-control" value={modalMode === 'edit' ? editVenueForm.capacity_reception : newVenue.capacity_reception} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, capacity_reception:e.target.value}) : setNewVenue({...newVenue, capacity_reception:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Banquet Capacity</label><input className="form-control" value={modalMode === 'edit' ? editVenueForm.capacity_banquet : newVenue.capacity_banquet} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, capacity_banquet:e.target.value}) : setNewVenue({...newVenue, capacity_banquet:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Theater Capacity</label><input className="form-control" value={modalMode === 'edit' ? editVenueForm.capacity_theater : newVenue.capacity_theater} onChange={(e)=>modalMode === 'edit' ? setEditVenueForm({...editVenueForm, capacity_theater:e.target.value}) : setNewVenue({...newVenue, capacity_theater:e.target.value})} /></div>
            <div className="form-group full-width" style={{borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
              <h4>Image Gallery</h4>
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                <input 
                  className="form-control" 
                  placeholder="Enter image URL"
                  value={currentImageUrl}
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                />
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    if (currentImageUrl) {
                      const form = modalMode === 'edit' ? editVenueForm : newVenue;
                      const currentImages = form.images || [];
                      if (form.image1 && !currentImages.includes(form.image1)) {
                        currentImages.unshift(form.image1);
                      }
                      if (!currentImages.includes(currentImageUrl)) {
                        if (modalMode === 'edit') {
                          setEditVenueForm({...editVenueForm, images: [...currentImages, currentImageUrl]});
                        } else {
                          setNewVenue({...newVenue, images: [...currentImages, currentImageUrl]});
                        }
                      }
                      setCurrentImageUrl('');
                    }
                  }}
                >
                  Add Image
                </button>
                <label className="btn btn-outline" htmlFor="venue-image-upload">Upload Image</label>
                <input id="venue-image-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async (e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const hotelToken = localStorage.getItem('hotelToken');
                    const headers = { Authorization: `Bearer ${hotelToken}` };
                    const resp = await axios.post(`${apiUrl}/api/hotels/images/upload`, formData, { headers });
                    const form = modalMode === 'edit' ? editVenueForm : newVenue;
                    const currentImages = form.images || [];
                    const next = [...currentImages, resp.data.url];
                    if (modalMode === 'edit') setEditVenueForm({...editVenueForm, images: next}); else setNewVenue({...newVenue, images: next});
                  } catch(err:any){ setError(err.response?.data?.message || 'Upload failed'); }
                }} />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem'}}>
                {((modalMode === 'edit' ? editVenueForm.images : newVenue.images) || []).map((img: string, idx: number) => (
                  <div key={idx} style={{position: 'relative', paddingBottom: '75%', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden'}}>
                    <img 
                      src={img} 
                      alt={`Venue ${idx + 1}`} 
                      style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}}
                      onError={(e) => {e.currentTarget.src = 'https://placehold.co/400x300?text=Invalid+Image'}}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', padding: '2px 8px'}}
                      onClick={() => {
                        const form = modalMode === 'edit' ? editVenueForm : newVenue;
                        const newImages = form.images.filter((_: unknown, i: number) => i !== idx);
                        if (modalMode === 'edit') {
                          setEditVenueForm({...editVenueForm, images: newImages});
                        } else {
                          setNewVenue({...newVenue, images: newImages});
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="builder-actions full-width" style={{marginTop: '1.5rem'}}>
              <button className="btn btn-primary" onClick={async () => {
                if (modalMode === 'edit') {
                  await saveEditVenue();
                } else {
                  await addVenue();
                }
                setModalOpen(false);
              }}>{modalMode === 'edit' ? 'Save Changes' : 'Add Venue'}</button>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
        
        {modalType === 'dining' && (
          <div className="form-grid" style={{gap: '1rem'}}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={modalMode === 'edit' ? editDiningForm.name : newDiningOutlet.name} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, name:e.target.value}) : setNewDiningOutlet({...newDiningOutlet, name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Cuisine</label><input className="form-control" value={modalMode === 'edit' ? editDiningForm.cuisine : newDiningOutlet.cuisine} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, cuisine:e.target.value}) : setNewDiningOutlet({...newDiningOutlet, cuisine:e.target.value})} /></div>
            <div className="form-group full-width"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={modalMode === 'edit' ? editDiningForm.description : newDiningOutlet.description} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, description:e.target.value}) : setNewDiningOutlet({...newDiningOutlet, description:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Hours</label><input className="form-control" value={modalMode === 'edit' ? editDiningForm.hours : newDiningOutlet.hours} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, hours:e.target.value}) : setNewDiningOutlet({...newDiningOutlet, hours:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Dress Code</label><input className="form-control" value={modalMode === 'edit' ? editDiningForm.dress_code : newDiningOutlet.dress_code} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, dress_code:e.target.value}) : setNewDiningOutlet({...newDiningOutlet, dress_code:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Seating Capacity</label><input className="form-control" type="number" placeholder="Number of seated guests" value={modalMode === 'edit' ? editDiningForm.attributes?.seating_capacity : newDiningOutlet.attributes?.seating_capacity} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, seating_capacity:e.target.value}}) : setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, seating_capacity:e.target.value}})} /></div>
            <div className="form-group"><label className="form-label">Standing Capacity</label><input className="form-control" type="number" placeholder="Number of standing guests" value={modalMode === 'edit' ? editDiningForm.attributes?.standing_capacity : newDiningOutlet.attributes?.standing_capacity} onChange={(e)=>modalMode === 'edit' ? setEditDiningForm({...editDiningForm, attributes:{...editDiningForm.attributes, standing_capacity:e.target.value}}) : setNewDiningOutlet({...newDiningOutlet, attributes:{...newDiningOutlet.attributes, standing_capacity:e.target.value}})} /></div>
            <div className="form-group full-width" style={{borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
              <h4>Image Gallery</h4>
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                <input 
                  className="form-control" 
                  placeholder="Enter image URL"
                  value={currentImageUrl}
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                />
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    if (currentImageUrl) {
                      const form = modalMode === 'edit' ? editDiningForm : newDiningOutlet;
                      const currentImages = form.images || [];
                      if (form.image1 && !currentImages.includes(form.image1)) {
                        currentImages.unshift(form.image1);
                      }
                      if (!currentImages.includes(currentImageUrl)) {
                        if (modalMode === 'edit') {
                          setEditDiningForm({...editDiningForm, images: [...currentImages, currentImageUrl]});
                        } else {
                          setNewDiningOutlet({...newDiningOutlet, images: [...currentImages, currentImageUrl]});
                        }
                      }
                      setCurrentImageUrl('');
                    }
                  }}
                >
                  Add Image
                </button>
                <label className="btn btn-outline" htmlFor="dining-image-upload">Upload Image</label>
                <input id="dining-image-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async (e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const hotelToken = localStorage.getItem('hotelToken');
                    const headers = { Authorization: `Bearer ${hotelToken}` };
                    const resp = await axios.post(`${apiUrl}/api/hotels/images/upload`, formData, { headers });
                    const form = modalMode === 'edit' ? editDiningForm : newDiningOutlet;
                    const currentImages = form.images || [];
                    const next = [...currentImages, resp.data.url];
                    if (modalMode === 'edit') setEditDiningForm({...editDiningForm, images: next}); else setNewDiningOutlet({...newDiningOutlet, images: next});
                  } catch(err:any){ setError(err.response?.data?.message || 'Upload failed'); }
                }} />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem'}}>
                {((modalMode === 'edit' ? editDiningForm.images : newDiningOutlet.images) || []).map((img: string, idx: number) => (
                  <div key={idx} style={{position: 'relative', paddingBottom: '75%', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden'}}>
                    <img 
                      src={img} 
                      alt={`Dining ${idx + 1}`} 
                      style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}}
                      onError={(e) => {e.currentTarget.src = 'https://placehold.co/400x300?text=Invalid+Image'}}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', padding: '2px 8px'}}
                      onClick={() => {
                        const form = modalMode === 'edit' ? editDiningForm : newDiningOutlet;
                        const newImages = form.images.filter((_: unknown, i: number) => i !== idx);
                        if (modalMode === 'edit') {
                          setEditDiningForm({...editDiningForm, images: newImages});
                        } else {
                          setNewDiningOutlet({...newDiningOutlet, images: newImages});
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="builder-actions full-width" style={{marginTop: '1.5rem'}}>
              <button className="btn btn-primary" onClick={async () => {
                if (modalMode === 'edit') {
                  await saveEditDining();
                } else {
                  await addDining();
                }
                setModalOpen(false);
              }}>{modalMode === 'edit' ? 'Save Changes' : 'Add Dining Outlet'}</button>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
        </div>
      </div>
    </div>
  );
}

export default HotelPortal;
