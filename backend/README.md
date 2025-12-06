# UnionData Backend

Backend API for Trump Word Map analysis.

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up PostgreSQL

Create a database:
```sql
CREATE DATABASE uniondata;
```

### 3. Configure environment

Create a `.env` file:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/uniondata
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Initialize database schema

```bash
psql -d uniondata -f src/db/schema.sql
```

### 5. Ingest sample data (optional)

```bash
npm run ingest -- --sample
```

## Running the server

Development mode:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### Speeches

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/speeches` | GET | List speeches (paginated) |
| `/api/speeches/:id` | GET | Get single speech with stats |
| `/api/speeches/types` | GET | Get speech type categories |
| `/api/speeches/stats` | GET | Get overall statistics |

### Words

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/words/cloud` | GET | Word cloud data |
| `/api/words/top` | GET | Top N words |
| `/api/words/search?word=X` | GET | Search specific word |
| `/api/words/timeline?words=X,Y` | GET | Word frequency over time |
| `/api/words/stats` | GET | Overall word statistics |

## Data Ingestion

### JSON Format

Prepare your speech data in JSON format:

```json
[
  {
    "title": "Speech Title",
    "date": "2020-01-15",
    "location": "City, State",
    "speech_type": "rally",
    "transcript": "Full speech text...",
    "source": "Source Name",
    "source_url": "https://..."
  }
]
```

### Ingest from file

```bash
npm run ingest -- --file=./data/speeches.json
```

### Ingest from directory

```bash
npm run ingest -- --dir=./data/speeches/
```

## Data Sources

Recommended sources for Trump speech transcripts:
- [Miller Center](https://millercenter.org/the-presidency/presidential-speeches) - Presidential speeches
- [The American Presidency Project](https://www.presidency.ucsb.edu/) - Comprehensive archive
- [Rev.com](https://www.rev.com/blog/transcript-tag/donald-trump-transcripts) - Rally and event transcripts
- [Factbase](https://factbase.app/) - Searchable transcript database

