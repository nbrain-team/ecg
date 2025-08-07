import { Router } from 'express';
import {
  destinations,
  resorts,
  roomTypes,
  eventSpaces,
  diningOptions,
  flightRoutes,
  getResortsForDestination,
  getRoomsForResort,
  getSpacesForResort,
  getDiningForResort,
  getFlightsForDestination,
  getDestinationById,
  getResortById
} from '../services/mockData';

const router = Router();

// Get all destinations
router.get('/', (req, res) => {
  res.json(destinations);
});

// Get single destination
router.get('/:id', (req, res) => {
  const destination = getDestinationById(req.params.id);
  if (!destination) {
    return res.status(404).json({ message: 'Destination not found' });
  }
  res.json(destination);
});

// Get resorts for a destination
router.get('/:id/resorts', (req, res) => {
  const resortList = getResortsForDestination(req.params.id);
  res.json(resortList);
});

// Get flights for a destination
router.get('/:id/flights', (req, res) => {
  const flights = getFlightsForDestination(req.params.id);
  res.json(flights);
});

// Get all resorts
router.get('/resorts/all', (req, res) => {
  res.json(resorts);
});

// Get single resort
router.get('/resorts/:id', (req, res) => {
  const resort = getResortById(req.params.id);
  if (!resort) {
    return res.status(404).json({ message: 'Resort not found' });
  }
  res.json(resort);
});

// Get rooms for a resort
router.get('/resorts/:id/rooms', (req, res) => {
  const rooms = getRoomsForResort(req.params.id);
  res.json(rooms);
});

// Get event spaces for a resort
router.get('/resorts/:id/spaces', (req, res) => {
  const spaces = getSpacesForResort(req.params.id);
  res.json(spaces);
});

// Get dining options for a resort
router.get('/resorts/:id/dining', (req, res) => {
  const dining = getDiningForResort(req.params.id);
  res.json(dining);
});

// Get all room types
router.get('/rooms/all', (req, res) => {
  res.json(roomTypes);
});

// Get all event spaces
router.get('/spaces/all', (req, res) => {
  res.json(eventSpaces);
});

// Get all dining options
router.get('/dining/all', (req, res) => {
  res.json(diningOptions);
});

// Get all flight routes
router.get('/flights/all', (req, res) => {
  res.json(flightRoutes);
});

export default router; 