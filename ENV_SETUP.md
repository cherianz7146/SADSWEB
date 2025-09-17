## Environment Setup

### Backend (`backend/.env`)
Copy `.env.example` to `.env` and fill:
- PORT: 5000 (default)
- CORS_ORIGIN: `http://localhost:5173`
- JWT_SECRET: a strong secret
- GOOGLE_CLIENT_ID: OAuth2 Web Client ID from Google Cloud Console
- MONGODB_URI: your MongoDB connection string

Start backend:
```bash
cd backend
npm install
npm run dev
```

### Frontend (`frontend/.env`)
Optional when using Vite proxy. If backend is not on localhost:5000, set:
- VITE_BACKEND_URL: e.g. `http://127.0.0.1:5000`

Start frontend:
```bash
cd frontend
npm install
npm run dev
```

### Google OAuth Setup
1. Go to Google Cloud Console → Credentials → Create OAuth Client ID → Web Application.
2. Authorized JavaScript origins:
   - `http://localhost:5173`
3. Authorized redirect URIs: Not required for One Tap/Identity Services in this flow.
4. Copy the client ID to `GOOGLE_CLIENT_ID` in backend `.env`.

The frontend fetches the client ID from `/api/auth/google-client-id`, loads Google Identity, and exchanges the credential at `/api/auth/google`.








