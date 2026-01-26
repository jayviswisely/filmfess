# FilmFess 🎬

Anonymous confessions paired with movies. Inspired by The Unsent Project and SendTheSong.

## Features

- 📝 Share anonymous confessions with movie pairings
- 🔍 Search by recipient name (fuzzy matching)
- 🎥 Search by movie title
- 🎨 Beautiful, emotional UI

## Tech Stack

- **Frontend:** React + Vite
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **API:** TMDB (The Movie Database)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/jayviswisely/filmfess.git
cd filmfess
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` with your API keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

4. Set up Supabase database (see `database/schema.sql`)

5. Run the development server:
```bash
npm run dev
```

## Database Setup

Run the SQL in `database/schema.sql` in your Supabase SQL Editor.

## License

MIT

## Acknowledgments

Inspired by [The Unsent Project](https://theunsentproject.com/)