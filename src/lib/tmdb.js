const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function searchMovies(query) {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
    );

    if (!response.ok) throw new Error('TMDB API request failed');

    const data = await response.json();

    return data.results.slice(0, 10).map(movie => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}