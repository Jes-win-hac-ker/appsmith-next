import React, { useState } from 'react';
import { Heart, Trash2, Search } from 'lucide-react';
import { MovieGrid } from '../components/MovieGrid';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { SearchBar } from '../components/SearchBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFavorites } from '../hooks/useFavorites';
import { TMDBMovie } from '../api/apiClient';
import { dbHelpers } from '../services/idb';
import { useToast } from '../hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Favorites() {
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, isLoading, refreshFavorites } = useFavorites();
  const { toast } = useToast();

  // Convert favorites to TMDBMovie format for compatibility
  const favoriteMovies: TMDBMovie[] = favorites.map(fav => ({
    id: fav.id,
    title: fav.title,
    overview: fav.overview,
    poster_path: fav.poster_path,
    backdrop_path: null,
    release_date: fav.release_date,
    vote_average: fav.vote_average,
    vote_count: 0,
    popularity: 0,
    adult: false,
    genre_ids: [],
    original_language: 'en',
    original_title: fav.title,
    video: false,
  }));

  // Filter favorites based on search query
  const filteredFavorites = searchQuery.trim() 
    ? favoriteMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.overview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favoriteMovies;

  const handleMovieClick = async (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    
    // Track movie view from favorites
    await dbHelpers.trackEvent('movie_viewed', { 
      movieId: movie.id, 
      title: movie.title,
      from: 'favorites'
    });
  };

  const handleClearAll = async () => {
    if (favorites.length === 0) return;
    
    try {
      // Remove all favorites
      await Promise.all(favorites.map(fav => dbHelpers.removeFavorite(fav.id)));
      await refreshFavorites();
      
      // Track analytics
      await dbHelpers.trackEvent('favorites_cleared', { count: favorites.length });
      
      toast({
        title: "Favorites Cleared",
        description: `Removed ${favorites.length} movies from your favorites`,
      });
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      toast({
        title: "Error",
        description: "Failed to clear favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    // This is a local search, so we don't need to do anything special
    // The filtering happens in the render based on searchQuery state
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
            <Heart className="h-6 w-6 text-primary-foreground fill-current" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Favorites</h1>
            <p className="text-muted-foreground">
              Movies you've saved for later viewing
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} saved
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {favorites.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search your favorites..."
            className="mx-auto"
          />
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery.trim() && favorites.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredFavorites.length} of {favorites.length} favorites match "{searchQuery}"
            </span>
          </div>
          {filteredFavorites.length !== favorites.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      {favorites.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start exploring movies and click the heart icon to save your favorites here.
              </p>
            </div>
            
            <Button asChild>
              <a href="/">Discover Movies</a>
            </Button>
          </CardContent>
        </Card>
      ) : filteredFavorites.length === 0 ? (
        /* No Search Results */
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            No favorites match your search for "{searchQuery}". 
            Try a different search term or{' '}
            <button 
              onClick={() => setSearchQuery('')}
              className="text-primary hover:underline"
            >
              clear your search
            </button>.
          </AlertDescription>
        </Alert>
      ) : (
        /* Favorites Grid */
        <MovieGrid
          movies={filteredFavorites}
          onMovieClick={handleMovieClick}
        />
      )}

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}