const express = require('express');
const router = express.Router();
const store = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get requests for the logged in user
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status } = req.query;
    let requests = store.getRequests(req.user.id);

    if (status && status !== 'all') {
      requests = requests.filter(r => r.status === status);
    }

    res.json({ requests });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Failed to retrieve swap requests' });
  }
});

// Create a new swap request
router.post('/', authMiddleware, (req, res) => {
  try {
    const { receiverId, skillOffering, skillRequesting, duration, scheduledDate, message } = req.body;

    if (!receiverId || !skillOffering || !skillRequesting) {
      return res.status(400).json({ error: 'Receiver ID, offered skill, and requested skill are required' });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send a swap request to yourself' });
    }

    const receiver = store.getUserById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Target user does not exist' });
    }

    const roomId = `swap_${req.user.id.slice(-4)}_${receiverId.slice(-4)}_${Math.random().toString(36).substring(2, 6)}`;

    const newRequest = store.createRequest({
      senderId: req.user.id,
      receiverId,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      receiverName: `${receiver.firstName} ${receiver.lastName}`,
      senderAvatar: req.user.avatar,
      receiverAvatar: receiver.avatar,
      skillOffering,
      skillRequesting,
      duration: duration || '45 mins',
      scheduledDate: scheduledDate || 'Flexible / To be agreed',
      message: message || `Hi ${receiver.firstName}, I'd love to swap skills with you!`,
      status: 'pending',
      roomId
    });

    res.status(201).json({
      message: 'LearnLoop swap request sent successfully!',
      request: newRequest
    });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: 'Failed to send swap request' });
  }
});

// Update request status (accept, decline, complete)
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'accepted', 'declined', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const request = store.getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only sender or receiver can update status
    if (request.senderId !== req.user.id && request.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this request' });
    }

    const updated = store.updateRequestStatus(id, status);

    res.json({
      message: `Request status updated to ${status}`,
      request: updated
    });
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// Get single request by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const request = store.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

module.exports = router;
