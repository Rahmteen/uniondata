# UnionData - Trump Word Map

A modern web application for visualizing and analyzing word usage patterns in Donald Trump's speeches. Built with React, TypeScript, and a full backend API.

## 🚀 Live Demo

- **Frontend**: [your-app.vercel.app](https://your-app.vercel.app)
- **Backend API**: [your-api.railway.app](https://your-api.railway.app)

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Chakra UI** - Component library
- **Rematch** - State management

### Backend
- **Express.js** + **TypeScript**
- **PostgreSQL** - Database (Supabase)
- **Natural** - NLP text processing

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── models/             # Rematch models
│   ├── store/              # Redux store
│   └── services/           # API client
├── backend/                # Backend source
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── db/             # Database
│   └── scripts/            # Data ingestion
└── vercel.json             # Vercel config
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database URL

# Run database schema
# (Execute backend/src/db/schema.sql in your database)

# Ingest speech data
npm run scrape
npm run ingest -- --file=./data/speeches.json

# Start backend server
npm run dev
```

## 🚢 Deployment

### Frontend → Vercel

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import your GitHub repo
   - Vercel auto-detects Vite config

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

4. **Deploy** - Vercel handles the rest!

### Backend → Railway

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **New Project** → "Deploy from GitHub repo"
   - Select your repo
   - Set **Root Directory**: `backend`

3. **Add Environment Variables** in Railway:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Generate Domain**: Settings → Networking → Generate Domain

5. **Update Vercel** with new backend URL:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

### Alternative: Backend → Render

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables
5. Deploy!

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/speeches` | List speeches |
| `GET /api/speeches/stats` | Speech statistics |
| `GET /api/speeches/:id` | Single speech |
| `GET /api/words/cloud` | Word cloud data |
| `GET /api/words/top` | Top words |
| `GET /api/words/stats` | Word statistics |
| `GET /api/words/date-range` | Available date range |

## Features

- 📊 **Interactive Word Cloud** - Visualize word frequency
- 📅 **Date Filtering** - Filter by time periods
- 🔍 **Search** - Find specific words
- 📱 **Responsive** - Works on mobile & desktop
- ⚡ **Auto-hiding UI** - Immersive fullscreen experience

## License

MIT
