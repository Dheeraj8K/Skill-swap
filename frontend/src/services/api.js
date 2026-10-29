const envApi = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_BASE = envApi.endsWith('/api') || envApi.endsWith('/api/')
  ? envApi.replace(/\/+$/, '')
  : `${envApi.replace(/\/+$/, '')}/api`;

function getAuthHeader() {
  const token = localStorage.getItem("skillswap_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  googleAuth: (payload) => request("/auth/google", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),

  // Users
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ""}`);
  },
  getUserById: (id) => request(`/users/${id}`),
  updateProfile: (profileData) => request("/users/profile", { method: "PUT", body: JSON.stringify(profileData) }),
  toggleVideoAvailability: () => request("/users/toggle-video", { method: "POST" }),

  // Requests
  getRequests: (status) => request(`/requests${status ? `?status=${status}` : ""}`),
  createRequest: (reqData) => request("/requests", { method: "POST", body: JSON.stringify(reqData) }),
  updateRequestStatus: (id, status) => request(`/requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getRequestById: (id) => request(`/requests/${id}`),

  // Reviews
  getReviews: (userId) => request(`/reviews/${userId}`),
  createReview: (reviewData) => request("/reviews", { method: "POST", body: JSON.stringify(reviewData) }),

  // Messages
  getMessages: (otherUserId) => request(`/messages/${otherUserId}`),
  sendMessage: (to, text) => request("/messages", { method: "POST", body: JSON.stringify({ to, text }) })
};
