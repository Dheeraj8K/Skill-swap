import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseUsers from './pages/BrowseUsers';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Messages from './pages/Messages';
import VideoRoom from './pages/VideoRoom';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<BrowseUsers />} />
            <Route path="profile" element={<Profile />} />
            <Route path="requests" element={<Requests />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* Full-Screen Immersive Video Calling Room */}
          <Route path="room/:roomId" element={<VideoRoom />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
