const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const STORE_PATH = path.join(__dirname, 'data', 'store.json');

// Fresh, clean start without pre-seeded mock profiles
const SEED_DATA = {
  users: [],
  requests: [],
  reviews: [],
  messages: []
};

class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.requests) this.data.requests = [];
        if (!this.data.reviews) this.data.reviews = [];
        if (!this.data.messages) this.data.messages = [];
      } else {
        this.data = JSON.parse(JSON.stringify(SEED_DATA));
        this.save();
      }
    } catch (e) {
      console.warn("Using in-memory clean store:", e.message);
      this.data = JSON.parse(JSON.stringify(SEED_DATA));
    }
  }

  save() {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to write store to disk:", e.message);
    }
  }

  getUsers() {
    return this.data.users;
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const id = "usr_" + Date.now();
    const newUser = {
      id,
      rating: 5.0,
      reviewCount: 0,
      completedSwaps: 0,
      videoAvailable: true,
      avatar: userData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      skillsOffering: userData.skillsOffering || [],
      skillsLearning: userData.skillsLearning || [],
      availability: userData.availability || [
        { day: "Monday", slots: ["05:00 PM - 06:00 PM"] },
        { day: "Wednesday", slots: ["06:00 PM - 07:00 PM"] },
        { day: "Saturday", slots: ["11:00 AM - 12:00 PM"] }
      ],
      badges: ["Community Member"],
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.data.users.unshift(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  getRequests(userId = null) {
    if (!userId) return this.data.requests;
    return this.data.requests.filter(r => r.senderId === userId || r.receiverId === userId);
  }

  getRequestById(id) {
    return this.data.requests.find(r => r.id === id);
  }

  createRequest(reqData) {
    const newReq = {
      id: "req_" + Date.now(),
      status: "pending",
      roomId: "room_" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      ...reqData
    };
    this.data.requests.unshift(newReq);
    this.save();
    return newReq;
  }

  updateRequestStatus(id, status) {
    const req = this.data.requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      if (status === 'completed') {
        const s = this.getUserById(req.senderId);
        if (s) s.completedSwaps = (s.completedSwaps || 0) + 1;
        const r = this.getUserById(req.receiverId);
        if (r) r.completedSwaps = (r.completedSwaps || 0) + 1;
      }
      this.save();
      return req;
    }
    return null;
  }

  getReviews(recipientId) {
    return this.data.reviews.filter(r => r.recipientId === recipientId);
  }

  createReview(reviewData) {
    const newRev = {
      id: "rev_" + Date.now(),
      createdAt: "Just now",
      ...reviewData
    };
    this.data.reviews.unshift(newRev);

    // Update user rating
    const user = this.getUserById(reviewData.recipientId);
    if (user) {
      const userReviews = this.getReviews(reviewData.recipientId);
      const sum = userReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
      user.rating = Number((sum / userReviews.length).toFixed(1));
      user.reviewCount = userReviews.length;
    }

    this.save();
    return newRev;
  }

  getMessages(u1, u2) {
    return this.data.messages.filter(m => 
      (m.from === u1 && m.to === u2) || (m.from === u2 && m.to === u1)
    );
  }

  createMessage(msg) {
    const newMsg = {
      id: "msg_" + Date.now(),
      timestamp: new Date().toISOString(),
      ...msg
    };
    this.data.messages.push(newMsg);
    this.save();
    return newMsg;
  }
}

const store = new DataStore();

// Graceful MongoDB connection (Atlas Cloud URI or local)
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/skill_swap";
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 3000
}).then(() => {
  console.log("✅ MongoDB Connected Successfully");
}).catch(err => {
  console.log("ℹ️ MongoDB Server not running locally. Seamlessly utilizing High-Performance JSON/Memory Store.");
});

module.exports = store;
