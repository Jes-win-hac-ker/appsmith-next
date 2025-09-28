import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { MovieGrid } from '../components/MovieGrid';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TMDBMovie, tmdbAPI, APIError } from '../api/apiClient';
import { dbHelpers } from '../services/idb';
import { useToast } from '../hooks/use-toast';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const { toast } = useToast();

  // Load popular movies on mount
  useEffect(() => {
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
    try {
      setIsLoadingPopular(true);
      setError(null);
      
      const response = await tmdbAPI.getPopularMovies(1);
      setPopularMovies(response.results);
      
      // Track page view
      await dbHelpers.trackEvent('page_view', { page: 'home', popularMoviesCount: response.results.length });
    } catch (err) {
      console.error('Failed to load popular movies:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load popular movies';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: "Failed to load popular movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPopular(false);
    }
  };

  const handleSearch = async (query: string, page = 1, append = false) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      setMovies([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsSearchMode(true);

      const response = await tmdbAPI.searchMovies(query, page);
      
      if (append) {
        setMovies(prev => [...prev, ...response.results]);
      } else {
        setMovies(response.results);
        setCurrentPage(1);
      }
      
      setHasMore(page < response.total_pages);
      setCurrentPage(page);
      
      // Track search
      await dbHelpers.trackEvent('search_completed', { 
        query, 
        page, 
        resultsCount: response.results.length,
        totalResults: response.total_results 
      });
      
    } catch (err) {
      console.error('Search failed:', err);
      const apiError = err as APIError;
      const errorMessage = apiError.isNetworkError 
        ? 'Network error. Please check your connection and try again.'
        : apiError.message || 'Search failed. Please try again.';
      
      setError(errorMessage);
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (searchQuery.trim() && hasMore && !isLoading) {
      handleSearch(searchQuery, currentPage + 1, true);
    }
  };

  const handleMovieClick = async (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    
    // Track movie view
    await dbHelpers.trackEvent('movie_viewed', { 
      movieId: movie.id, 
      title: movie.title,
      from: isSearchMode ? 'search' : 'popular'
    });
  };

  const handleRetry = () => {
    if (isSearchMode && searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      loadPopularMovies();
    }
  };

  const displayMovies = isSearchMode ? movies : popularMovies;
  const showLoadMore = isSearchMode && hasMore && movies.length > 0;
  const showLoading = isSearchMode ? isLoading : isLoadingPopular;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 bg-gradient-hero rounded-2xl px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Discover Amazing Movies
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Search through thousands of movies, save your favorites, and explore new releases.
          </p>
          
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => handleSearch(query)}
            isLoading={showLoading}
            placeholder="Search for movies..."
            className="mx-auto"
          />
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content Section */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSearchMode ? (
              <>
                <h2 className="text-2xl font-bold">Search Results</h2>
                {movies.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {movies.length} movies found
                  </Badge>
                )}
              </>
            ) : (
              <>
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Popular Movies</h2>
                {popularMovies.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {popularMovies.length} movies
                  </Badge>
                )}
              </>
            )}
          </div>

          {isSearchMode && searchQuery && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setIsSearchMode(false);
                setMovies([]);
              }}
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Loading State */}
        {showLoading && displayMovies.length === 0 && (
          <div className="flex justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">
                {isSearchMode ? 'Searching movies...' : 'Loading popular movies...'}
              </p>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!showLoading && (
          <>
            <MovieGrid
              movies={displayMovies}
              onMovieClick={handleMovieClick}
            />

            {/* Load More Button */}
            {showLoadMore && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Movies'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* No API Key Warning */}
        {error?.includes('demo-key') && (
          <Card className="border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                API Key Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                To use this application, you need to configure your TMDB API key. 
                Create a <code className="px-1 py-0.5 rounded bg-muted text-xs">.env</code> file 
                in the project root with:
              </p>
              <code className="block p-3 bg-muted rounded text-xs">
                VITE_TMDB_API_KEY=your_api_key_here
              </code>
              <p className="text-sm text-muted-foreground mt-4">
                Get your free API key from{' '}
                <a 
                  href="https://www.themoviedb.org/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  The Movie Database
                </a>
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}