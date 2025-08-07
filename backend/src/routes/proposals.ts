import { Router } from 'express';
import { Proposal } from '../../../shared/types';
import { generateProposalContent } from '../services/proposalGenerator';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage (in production, use database)
const proposals: Proposal[] = [];

// Get all proposals
router.get('/', (req, res) => {
  res.json(proposals);
});

// Get single proposal
router.get('/:id', (req, res) => {
  const proposal = proposals.find(p => p.id === req.params.id);
  if (!proposal) {
    return res.status(404).json({ message: 'Proposal not found' });
  }
  res.json(proposal);
});

// Get proposal by shareable link
router.get('/share/:shareId', (req, res) => {
  const proposal = proposals.find(p => p.shareableLink === req.params.shareId);
  if (!proposal) {
    return res.status(404).json({ message: 'Proposal not found' });
  }
  
  // Update view count
  proposal.viewCount = (proposal.viewCount || 0) + 1;
  proposal.lastViewedAt = new Date();
  
  res.json(proposal);
});

// Create new proposal
router.post('/', (req, res) => {
  try {
    const proposalData = req.body;
    
    // Generate AI content
    const generatedContent = generateProposalContent(proposalData);
    
    // Create proposal
    const newProposal: Proposal = {
      id: uuidv4(),
      userId: proposalData.userId || '1',
      client: proposalData.client,
      eventDetails: proposalData.eventDetails,
      destination: proposalData.destination,
      resort: proposalData.resort,
      selectedRooms: proposalData.selectedRooms || [],
      selectedSpaces: proposalData.selectedSpaces || [],
      selectedDining: proposalData.selectedDining || [],
      flightRoutes: proposalData.flightRoutes || [],
      branding: proposalData.branding || {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        theme: 'modern'
      },
      generatedContent,
      status: 'draft',
      shareableLink: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0
    };
    
    proposals.push(newProposal);
    
    res.status(201).json(newProposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Failed to create proposal' });
  }
});

// Update proposal
router.put('/:id', (req, res) => {
  const index = proposals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Proposal not found' });
  }
  
  const updatedProposal = {
    ...proposals[index],
    ...req.body,
    updatedAt: new Date()
  };
  
  // Regenerate content if needed
  if (req.body.regenerateContent) {
    updatedProposal.generatedContent = generateProposalContent(updatedProposal);
  }
  
  proposals[index] = updatedProposal;
  res.json(updatedProposal);
});

// Publish proposal
router.post('/:id/publish', (req, res) => {
  const proposal = proposals.find(p => p.id === req.params.id);
  if (!proposal) {
    return res.status(404).json({ message: 'Proposal not found' });
  }
  
  proposal.status = 'published';
  proposal.updatedAt = new Date();
  
  res.json({
    message: 'Proposal published successfully',
    shareableLink: `/view/${proposal.shareableLink}`
  });
});

// Delete proposal
router.delete('/:id', (req, res) => {
  const index = proposals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Proposal not found' });
  }
  
  proposals.splice(index, 1);
  res.json({ message: 'Proposal deleted successfully' });
});

export default router; 