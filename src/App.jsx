import { useState, useEffect } from 'react';
import { Search, Film, Heart, Send, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { searchMovies as searchTMDB } from './lib/tmdb';

function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchMode, setSearchMode] = useState('recipient');
  const [searchQuery, setSearchQuery] = useState('');
  const [confessions, setConfessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New confession form state
  const [newConfession, setNewConfession] = useState({
    message: '',
    recipient: '',
    movieSearch: '',
    selectedMovie: null
  });
  const [movieResults, setMovieResults] = useState([]);
  const [isSearchingMovies, setIsSearchingMovies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch confessions
  useEffect(() => {
    fetchConfessions();
  }, [searchQuery, searchMode]);

  const fetchConfessions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchQuery) {
        if (searchMode === 'recipient') {
          query = query.ilike('recipient_lower', `%${searchQuery.toLowerCase()}%`);
        } else if (searchMode === 'movie') {
          query = query.ilike('movie_title', `%${searchQuery}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching confessions:', error);
        setConfessions([]);
      } else {
        setConfessions(data || []);
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
      setConfessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search movies with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newConfession.movieSearch && !newConfession.selectedMovie) {
        setIsSearchingMovies(true);
        const results = await searchTMDB(newConfession.movieSearch);
        setMovieResults(results);
        setIsSearchingMovies(false);
      } else {
        setMovieResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newConfession.movieSearch, newConfession.selectedMovie]);

  const selectMovie = (movie) => {
    setNewConfession({
      ...newConfession,
      selectedMovie: movie,
      movieSearch: movie.title
    });
    setMovieResults([]);
  };

  const handleSubmitConfession = async (e) => {
    e.preventDefault();
    
    if (!newConfession.message.trim() || !newConfession.recipient.trim() || !newConfession.selectedMovie) {
      alert('Please fill in all fields');
      return;
    }

    if (newConfession.message.length > 1000) {
      alert('Message is too long (max 1000 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('confessions')
        .insert([{
          message: newConfession.message.trim(),
          recipient: newConfession.recipient.trim(),
          recipient_lower: newConfession.recipient.trim().toLowerCase(),
          movie_id: newConfession.selectedMovie.id,
          movie_title: newConfession.selectedMovie.title,
          movie_poster_path: newConfession.selectedMovie.posterPath,
        }])
        .select()
        .single();

      if (error) throw error;

      // Success - reset form and switch to browse
      setNewConfession({ message: '', recipient: '', movieSearch: '', selectedMovie: null });
      setActiveTab('browse');
      fetchConfessions();
      alert('Your confession has been shared anonymously ✨');
    } catch (error) {
      console.error('Error submitting confession:', error);
      alert('Failed to submit confession. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EC]">
      {/* Header */}
      <header className="border-b border-[#B48E6F]/20 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-8 h-8 text-[#B48E6F]" />
            <h1 className="text-4xl font-bold text-[#2E2E2E]">FilmFess</h1>
          </div>
          <p className="text-[#6B7280] text-base max-w-2xl">
            Anonymous confessions paired with the movies that capture how we feel. 
            Share your untold stories through cinema.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'browse'
                ? 'bg-[#B48E6F] text-white shadow-sm'
                : 'bg-white text-[#6B7280] hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Browse Confessions
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-[#B48E6F] text-white shadow-sm'
                : 'bg-white text-[#6B7280] hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Share Yours
          </button>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Search Section */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    setSearchMode('recipient');
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    searchMode === 'recipient'
                      ? 'bg-[#B48E6F] text-white'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }`}
                >
                  Search by Name
                </button>
                <button
                  onClick={() => {
                    setSearchMode('movie');
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    searchMode === 'movie'
                      ? 'bg-[#B48E6F] text-white'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }`}
                >
                  Search by Movie
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchMode === 'recipient' ? 'Search for a name...' : 'Search for a movie...'}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#2E2E2E] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#B48E6F] focus:border-transparent"
                />
              </div>
              
              {searchQuery && !isLoading && (
                <p className="mt-3 text-sm text-[#6B7280]">
                  Found {confessions.length} confession{confessions.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Confessions Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#B48E6F] animate-spin" />
              </div>
            ) : (
              <div className="grid gap-6">
                {confessions.length > 0 ? (
                  confessions.map((confession) => (
                    <div
                      key={confession.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-6">
                        {/* Movie Poster */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-48 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                            {confession.movie_poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${confession.movie_poster_path}`}
                                alt={confession.movie_title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-12 h-12 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-[#B48E6F] mb-1">
                                To {confession.recipient}
                              </h3>
                              <p className="text-sm text-[#6B7280]">{confession.movie_title}</p>
                            </div>
                            <Heart className="w-5 h-5 text-gray-300 group-hover:text-[#B48E6F] transition-colors" />
                          </div>
                          
                          <p className="text-[#2E2E2E] leading-relaxed mb-4">
                            {confession.message}
                          </p>
                          
                          <p className="text-xs text-[#6B7280]">
                            {new Date(confession.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-[#6B7280] text-lg">No confessions yet</p>
                    <p className="text-[#6B7280]/70 text-sm mt-2">
                      {searchQuery ? 'Try a different search term' : 'Be the first to share your story'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">Share Your Story</h2>
              <p className="text-[#6B7280] mb-6">
                Your confession will be posted anonymously. Choose a movie that captures your feelings.
              </p>

              <form onSubmit={handleSubmitConfession} className="space-y-6">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] mb-2">
                    To
                  </label>
                  <input
                    type="text"
                    value={newConfession.recipient}
                    onChange={(e) => setNewConfession({ ...newConfession, recipient: e.target.value })}
                    placeholder="Their name..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#2E2E2E] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#B48E6F] focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={newConfession.message}
                    onChange={(e) => setNewConfession({ ...newConfession, message: e.target.value })}
                    placeholder="What do you want to say?..."
                    rows={6}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#2E2E2E] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#B48E6F] focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    {newConfession.message.length}/1000 characters
                  </p>
                </div>

                {/* Movie Search */}
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] mb-2">
                    Choose a Movie
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newConfession.movieSearch}
                      onChange={(e) => {
                        setNewConfession({ ...newConfession, movieSearch: e.target.value, selectedMovie: null });
                      }}
                      placeholder="Search for a movie..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#2E2E2E] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#B48E6F] focus:border-transparent"
                    />
                    
                    {isSearchingMovies && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
                      </div>
                    )}
                    
                    {movieResults.length > 0 && !newConfession.selectedMovie && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg z-10 max-h-80 overflow-y-auto">
                        {movieResults.map((movie) => (
                          <button
                            key={movie.id}
                            type="button"
                            onClick={() => selectMovie(movie)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                          >
                            {movie.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center">
                                <Film className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-[#2E2E2E] font-medium">{movie.title}</p>
                              <p className="text-[#6B7280] text-sm">
                                {movie.releaseDate?.split('-')[0] || 'N/A'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {newConfession.selectedMovie && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-[#B48E6F]/10 border border-[#B48E6F]/20 rounded-lg">
                      {newConfession.selectedMovie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${newConfession.selectedMovie.posterPath}`}
                          alt={newConfession.selectedMovie.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <Film className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-[#2E2E2E] font-medium">{newConfession.selectedMovie.title}</p>
                        <p className="text-[#B48E6F] text-sm">Selected</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#B48E6F] hover:bg-[#A07D5F] disabled:bg-[#B48E6F]/50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Share Anonymously
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;