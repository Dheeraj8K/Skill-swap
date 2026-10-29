const express = require('express');
const router = express.Router();
const store = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get chat history with another user
router.get('/:otherUserId', authMiddleware, (req, res) => {
  try {
    const messages = store.getMessages(req.user.id, req.params.otherUserId);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Send a message
router.post('/', authMiddleware, (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ error: 'Recipient and text are required' });
    }

    const newMessage = store.createMessage({
      from: req.user.id,
      to,
      text: text.trim()
    });

    res.status(201).json({
      message: 'Message sent',
      chatMessage: newMessage
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
