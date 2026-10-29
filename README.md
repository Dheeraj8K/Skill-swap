# ⚡ SkillSwap — Modern Peer-to-Peer Knowledge Exchange & Video Mentorship Platform

A modern, production-grade full-stack web application designed for direct, reciprocal skill sharing. Instead of paying expensive course fees or subscription costs, members exchange their expertise 1-on-1: teach what you know, learn what you desire, and collaborate through built-in encrypted video rooms.

---

## 🌟 Key Features

### 1. Integrated Live HD Video Calling & Collaborative Studio
- **WebRTC & Socket.IO Signaling**: Direct peer-to-peer audio and video calls.
- **In-Call Controls**: Toggle Microphone, Camera, and Screen Sharing.
- **In-Call Real-Time Chat**: Send messages, links, and questions during the call.
- **In-Call Collaborative Notebook**: Synchronized code and markdown scratchpad for shared session notes.
- **Call Availability System**: Users can mark themselves *"Video Call Ready"* (`🟢 Online`) to receive instant calls.
- **Instant Room Generator**: Create and share one-click encrypted room links for ad-hoc troubleshooting and swaps.
- **Session Timer & Completion Flow**: Live session timer with post-call confetti celebration and review prompts.

### 2. Marketplace & Discovery
- **Comprehensive User Directory**: Search by person, category, or skill tags.
- **Filter by Video Availability**: Toggle to see mentors ready for a video call right now.
- **Category Taxonomy**: Development, Design, AI & Data, DevOps, Writing, Creative, Business.
- **Proficiency Tags**: View skill levels (Beginner, Intermediate, Advanced, Expert) for both offered skills and learning targets.

### 3. Bidirectional Swap Requests Engine
- **Structured Proposal Modal**: Choose which of your skills you'll teach in exchange for a target skill.
- **Session Duration & Slots**: Propose 30, 45, or 60-minute exchanges matched to the mentor's weekly calendar.
- **Status Lifecycle**: Manage `Pending`, `Accepted`, `Completed`, and `Declined` proposals.
- **One-Click Video Room Entry**: Launch straight into the session when a proposal is accepted.

### 4. Direct Messaging & Chat
- **Real-Time Communication**: Chat with potential exchange partners before or after proposals.
- **Call from Chat**: "Start Video Call" button right in the chat header.

### 5. Verified Reviews, Ratings & Reputation
- **5-Star Community Ratings**: Review mentors after session completion.
- **Skill Endorsement**: Rate specific skill instruction quality with written testimonials.
- **Achievements & Badges**: *"Top Rated Mentor"*, *"WebRTC Pioneer"*, *"Super Responsive"*, *"Verified Pro"*.

### 6. Profile & Availability Manager
- **Skills Editor**: Add, categorize, and remove skills you offer and skills you want to learn.
- **Weekly Time Slots**: Set preferred availability by day and time windows.
- **Profile Customization**: Update bio, professional headline, and location.

### 7. Zero-Setup Dual Persistence Layer
- **Seamless MongoDB Connection**: Automatically connects to local or cloud MongoDB instances.
- **Resilient Fallback Storage**: If MongoDB is not running, the platform seamlessly uses a persistent, pre-seeded JSON store (`backend/data/store.json`) with 6 realistic mentor profiles, past swaps, and reviews.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Start the Backend API & WebSocket Server
```bash
cd "backend"
npm install
npm start
```
*The backend will be running at [http://localhost:3000](http://localhost:3000).*

### 2. Start the Frontend Application
```bash
cd "frontend"
npm install
npm run dev
```
*Open your browser at [http://localhost:5173](http://localhost:5173).*

---

## 👥 Demo Accounts (Instant 1-Click Login)

The platform includes built-in demo profiles on the **Login** page and in the **User Dropdown** menu:

| Name | Role | Primary Skills | Password |
|---|---|---|---|
| **Sarah Johnson** | Senior React Engineer | React & Next.js, TypeScript, Tailwind | `password123` |
| **Mike Chen** | AI / ML Engineer | Python, PyTorch, LangChain, LLM Agents | `password123` |
| **Emma Davis** | Lead Product Designer | Figma, UX Research, Design Systems | `password123` |
| **James Wilson** | Cloud & DevOps Architect | AWS, Docker, Kubernetes, Terraform | `password123` |
| **Lisa Anderson** | Technical Writer | Documentation, Content Strategy, Storytelling | `password123` |
| **David Brown** | Audio Engineer | Logic Pro, Ableton, Audio Mixing, Guitar | `password123` |

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite 7
- **Routing**: React Router 7
- **Styling**: Modern Design System with responsive CSS variables & glassmorphism
- **Icons**: Lucide React
- **WebRTC & Real-time**: `socket.io-client`
- **Effects**: `canvas-confetti`

### Backend
- **Runtime**: Node.js & Express 5
- **Real-Time Layer**: Socket.IO WebRTC signaling, live chat & collaborative notes
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Database**: Mongoose (MongoDB) + Resilient JSON File/Memory Fallback Store
