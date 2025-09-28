import { useState, useEffect } from 'react';
import { dbHelpers, AppDB } from '../services/idb';
import { TMDBMovie } from '../api/apiClient';
import { useToast } from './use-toast';

type FavoriteMovie = AppDB['favorites']['value'];

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load favorites from IndexedDB on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favs = await dbHelpers.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites from storage",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (movie: TMDBMovie) => {
    try {
      const favoriteMovie: FavoriteMovie = {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path || '',
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        savedAt: Date.now(),
      };

      await dbHelpers.addFavorite(favoriteMovie);
      setFavorites(prev => [...prev, favoriteMovie]);
      
      // Track analytics
      await dbHelpers.trackEvent('favorite_added', { movieId: movie.id, title: movie.title });
      
      toast({
        title: "Added to Favorites",
        description: `${movie.title} has been added to your favorites`,
      });
    } catch (error) {
      console.error('Failed to add favorite:', error);
      toast({
        title: "Error",
        description: "Failed to add movie to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFavorite = async (movieId: number) => {
    try {
      await dbHelpers.removeFavorite(movieId);
      const movieTitle = favorites.find(f => f.id === movieId)?.title;
      setFavorites(prev => prev.filter(fav => fav.id !== movieId));
      
      // Track analytics
      await dbHelpers.trackEvent('favorite_removed', { movieId, title: movieTitle });
      
      toast({
        title: "Removed from Favorites",
        description: `${movieTitle} has been removed from your favorites`,
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove movie from favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (movieId: number): boolean => {
    return favorites.some(fav => fav.id === movieId);
  };

  const toggleFavorite = async (movie: TMDBMovie) => {
    if (isFavorite(movie.id)) {
      await removeFavorite(movie.id);
    } else {
      await addFavorite(movie);
    }
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites,
  };
}