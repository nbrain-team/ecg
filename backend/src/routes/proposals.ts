import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all proposals for authenticated user
router.get('/', requireAuth(['admin', 'viewer', 'hotel']), async (req, res) => {
  try {
    const authReq = req as any;
    let userId = authReq.userId;
    
    // For hotel users, find the corresponding user entry
    if (authReq.user?.role === 'hotel') {
      const { rows: userRows } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [authReq.user.email]
      );
      
      if (userRows.length > 0) {
        userId = userRows[0].id;
      } else {
        // No proposals yet for this hotel user
        return res.json([]);
      }
    }
    
    const { rows } = await pool.query(
      'SELECT * FROM proposals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Failed to fetch proposals' });
  }
});

// Get proposal by ID
router.get('/:id', requireAuth(['admin', 'viewer', 'hotel']), async (req, res) => {
  try {
    const authReq = req as any;
    let userId = authReq.userId;
    
    // For hotel users, find the corresponding user entry
    if (authReq.user?.role === 'hotel') {
      const { rows: userRows } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [authReq.user.email]
      );
      
      if (userRows.length > 0) {
        userId = userRows[0].id;
      } else {
        return res.status(404).json({ message: 'Proposal not found' });
      }
    }
    
    const { rows } = await pool.query(
      'SELECT * FROM proposals WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Failed to fetch proposal' });
  }
});

// Get proposal by shareable link (public endpoint)
router.get('/share/:shareId', async (req, res) => {
  try {
    // Update view count and last viewed timestamp
    const { rows } = await pool.query(
      `UPDATE proposals 
       SET view_count = COALESCE(view_count, 0) + 1,
           last_viewed_at = CURRENT_TIMESTAMP
       WHERE shareable_link = $1
       RETURNING *`,
      [req.params.shareId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Failed to fetch proposal' });
  }
});

// Create new proposal
router.post('/', requireAuth(['admin', 'viewer', 'hotel']), async (req, res) => {
  try {
    const authReq = req as any;
    let userId = authReq.userId;
    
    // For hotel users, we need to create or find a corresponding user entry
    if (authReq.user?.role === 'hotel') {
      // Check if we already have a user entry for this hotel user
      const { rows: existingUser } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [authReq.user.email]
      );
      
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        // Create a new user entry for the hotel user
        const { rows: newUser } = await pool.query(
          `INSERT INTO users (email, password, name, role) 
           VALUES ($1, 'hotel-user', $2, 'hotel') 
           RETURNING id`,
          [authReq.user.email, authReq.user.email.split('@')[0]]
        );
        userId = newUser[0].id;
      }
    }
    
    const {
      client,
      eventDetails,
      destination,
      resort,
      selectedRooms,
      selectedSpaces,
      selectedDining,
      flightRoutes,
      programFlow,
      branding,
      generatedContent,
      metadata
    } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO proposals (
        user_id, client, event_details, destination, resort,
        selected_rooms, selected_spaces, selected_dining,
        flight_routes, program_flow, branding, metadata, generated_content,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        userId,
        JSON.stringify(client),
        JSON.stringify(eventDetails),
        JSON.stringify(destination),
        JSON.stringify(resort),
        JSON.stringify(selectedRooms),
        JSON.stringify(selectedSpaces),
        JSON.stringify(selectedDining),
        JSON.stringify(flightRoutes),
        JSON.stringify(programFlow),
        JSON.stringify(branding),
        JSON.stringify(metadata),
        JSON.stringify(generatedContent),
        'draft'
      ]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Failed to create proposal' });
  }
});

// Update proposal
router.put('/:id', requireAuth(['admin', 'viewer', 'hotel']), async (req, res) => {
  try {
    const authReq = req as any;
    let userId = authReq.userId;
    // Map hotel role to corresponding users.id (email-based), creating if needed
    if (authReq.user?.role === 'hotel') {
      const { rows: existingUser } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [authReq.user.email]
      );
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const { rows: newUser } = await pool.query(
          `INSERT INTO users (email, password, name, role)
           VALUES ($1, 'hotel-user', $2, 'hotel')
           RETURNING id`,
          [authReq.user.email, authReq.user.email.split('@')[0]]
        );
        userId = newUser[0].id;
      }
    }
    
    // First check if the proposal belongs to the user and load existing row
    const { rows: existing } = await pool.query(
      'SELECT * FROM proposals WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    const {
      client,
      eventDetails,
      destination,
      resort,
      selectedRooms,
      selectedSpaces,
      selectedDining,
      flightRoutes,
      programFlow,
      branding,
      generatedContent,
      metadata
    } = req.body;

    const current = existing[0];
    const nextClient = client ?? current.client;
    const nextEventDetails = eventDetails ?? current.event_details;
    const nextDestination = destination ?? current.destination;
    const nextResort = resort ?? current.resort;
    const nextSelectedRooms = selectedRooms ?? current.selected_rooms;
    const nextSelectedSpaces = selectedSpaces ?? current.selected_spaces;
    const nextSelectedDining = selectedDining ?? current.selected_dining;
    const nextFlightRoutes = flightRoutes ?? current.flight_routes;
    const nextProgramFlow = programFlow ?? current.program_flow;
    const nextBranding = branding ?? current.branding;
    const nextGeneratedContent = generatedContent ?? current.generated_content;
    const nextMetadata = metadata ?? current.metadata;
    
    const { rows } = await pool.query(
      `UPDATE proposals SET
        client = $3,
        event_details = $4,
        destination = $5,
        resort = $6,
        selected_rooms = $7,
        selected_spaces = $8,
        selected_dining = $9,
        flight_routes = $10,
        program_flow = $11,
        branding = $12,
        generated_content = $13,
        metadata = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
      [
        req.params.id,
        userId,
        JSON.stringify(nextClient),
        JSON.stringify(nextEventDetails),
        JSON.stringify(nextDestination),
        JSON.stringify(nextResort),
        JSON.stringify(nextSelectedRooms),
        JSON.stringify(nextSelectedSpaces),
        JSON.stringify(nextSelectedDining),
        JSON.stringify(nextFlightRoutes),
        JSON.stringify(nextProgramFlow),
        JSON.stringify(nextBranding),
        JSON.stringify(nextGeneratedContent),
        JSON.stringify(nextMetadata)
      ]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ message: 'Failed to update proposal' });
  }
});

// Publish proposal
router.post('/:id/publish', requireAuth(['admin', 'viewer', 'hotel']), async (req, res) => {
  try {
    const authReq = req as any;
    let userId = authReq.userId;
    if (authReq.user?.role === 'hotel') {
      const { rows: existingUser } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [authReq.user.email]
      );
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const { rows: newUser } = await pool.query(
          `INSERT INTO users (email, password, name, role)
           VALUES ($1, 'hotel-user', $2, 'hotel')
           RETURNING id`,
          [authReq.user.email, authReq.user.email.split('@')[0]]
        );
        userId = newUser[0].id;
      }
    }
    
    const { rows } = await pool.query(
      `UPDATE proposals 
       SET status = 'published', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING shareable_link`,
      [req.params.id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json({
      message: 'Proposal published successfully',
      shareableLink: `/proposal/share/${rows[0].shareable_link}`
    });
  } catch (error) {
    console.error('Error publishing proposal:', error);
    res.status(500).json({ message: 'Failed to publish proposal' });
  }
});

// Delete proposal
router.delete('/:id', requireAuth(['admin', 'viewer', 'hotel']), async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    const { rowCount } = await pool.query(
      'DELETE FROM proposals WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ message: 'Failed to delete proposal' });
  }
});

export default router;