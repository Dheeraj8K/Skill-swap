const express = require('express');
const router = express.Router();
const store = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// Get all users with query & filter options
router.get('/', optionalAuth, (req, res) => {
  try {
    const { q, category, skill, videoOnly } = req.query;
    let users = store.getUsers().map(u => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });

    // Exclude current user if logged in
    if (req.user) {
      users = users.filter(u => u.id !== req.user.id);
    }

    if (q) {
      const query = q.toLowerCase();
      users = users.filter(u => 
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(query) ||
        u.headline?.toLowerCase().includes(query) ||
        u.bio?.toLowerCase().includes(query) ||
        u.location?.toLowerCase().includes(query) ||
        u.skillsOffering?.some(s => s.name.toLowerCase().includes(query)) ||
        u.skillsLearning?.some(s => s.name.toLowerCase().includes(query))
      );
    }

    if (category && category !== 'All') {
      users = users.filter(u => 
        u.category === category ||
        u.skillsOffering?.some(s => s.category?.toLowerCase() === category.toLowerCase())
      );
    }

    if (skill) {
      const targetSkill = skill.toLowerCase();
      users = users.filter(u => 
        u.skillsOffering?.some(s => s.name.toLowerCase().includes(targetSkill))
      );
    }

    if (videoOnly === 'true') {
      users = users.filter(u => u.videoAvailable);
    }

    res.json({ users, total: users.length });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get user by ID with reviews
router.get('/:id', (req, res) => {
  try {
    const user = store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    const reviews = store.getReviews(req.params.id);

    res.json({
      user: safeUser,
      reviews
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

// Update Profile
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const updates = req.body;
    // Disallow overriding critical auth fields directly
    delete updates.id;
    delete updates.passwordHash;
    delete updates.email;

    const updated = store.updateUser(req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const safeUser = { ...updated };
    delete safeUser.passwordHash;

    res.json({
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Toggle Video Availability
router.post('/toggle-video', authMiddleware, (req, res) => {
  try {
    const user = store.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newStatus = !user.videoAvailable;
    const updated = store.updateUser(req.user.id, { videoAvailable: newStatus });

    res.json({
      videoAvailable: updated.videoAvailable,
      message: updated.videoAvailable ? 'You are now marked Available for Video Calls' : 'You are now marked Unavailable for Video Calls'
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not update video availability' });
  }
});

module.exports = router;
