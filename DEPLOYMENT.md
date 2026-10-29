# 🚀 SkillSwap Deployment Guide

This guide explains how to deploy SkillSwap to production in a few minutes.

---

## 1. Quick Deploy Architecture

- **Frontend (Vite + React)**: Deploy on **Vercel**, **Netlify**, or **Render Static Site**.
- **Backend (Express + Socket.IO)**: Deploy on **Render Web Service**, **Railway**, or **Fly.io** (which support WebSockets).
- **Database**: **MongoDB Atlas** (Free tier) or the persistent fallback store.

---

## 2. Deploying the Backend (e.g., Render / Railway)

1. Connect your repository to [Render.com](https://render.com) or [Railway.app](https://railway.app).
2. Choose **Web Service** with the root directory set to `backend`.
3. Set the build and start commands:
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Set the Environment Variables:
   * `PORT`: `3000` (or leave default on Render/Railway)
   * `JWT_SECRET`: `your_secure_random_jwt_secret_key`
   * `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/skill_swap?retryWrites=true&w=majority` *(optional, falls back to high-performance store if omitted)*
5. Once deployed, copy your backend URL (e.g., `https://skillswap-api.onrender.com`).

---

## 3. Deploying the Frontend (e.g., Vercel / Netlify / Render)

1. In [Vercel](https://vercel.com) or [Netlify](https://netlify.com), import your repository with root directory `frontend`.
2. Set the build configuration:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Add Environment Variables:
   * `VITE_API_URL`: `https://skillswap-api.onrender.com/api`
   * `VITE_SOCKET_URL`: `https://skillswap-api.onrender.com`
   * `VITE_GOOGLE_CLIENT_ID`: `292998625214-d2mu53ghrfljp210k30ce51i693o4lfq.apps.googleusercontent.com`
4. Deploy!

---

## 4. Google Cloud Console for Production URL

Once your frontend is deployed to your live domain (e.g., `https://skillswap.vercel.app`):
1. Open [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your Web Client ID (`Web client 2`).
3. Add your production domain under **Authorized JavaScript origins**:
   * `https://skillswap.vercel.app`
4. Add your production domain under **Authorized redirect URIs**:
   * `https://skillswap.vercel.app`
5. Click **Save**.
