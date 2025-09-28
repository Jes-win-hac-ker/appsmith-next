import React, { useState, useEffect } from 'react';
import { X, Heart, Star, Calendar, Clock, Globe, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TMDBMovie, TMDBMovieDetails, tmdbAPI } from '../api/apiClient';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../hooks/use-toast';
import { cn } from '@/lib/utils';

interface MovieDetailModalProps {
  movie: TMDBMovie | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const isMovieFavorite = movie ? isFavorite(movie.id) : false;

  useEffect(() => {
    if (movie && isOpen) {
      loadMovieDetails(movie.id);
    }
  }, [movie, isOpen]);

  const loadMovieDetails = async (movieId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const details = await tmdbAPI.getMovieDetails(movieId);
      setMovieDetails(details);
    } catch (err) {
      console.error('Failed to load movie details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load movie details');
      toast({
        title: "Error",
        description: "Failed to load movie details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = () => {
    if (movie) {
      toggleFavorite(movie);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!movie) return null;

  const backdropUrl = tmdbAPI.getImageUrl(movie.backdrop_path, 'w780');
  const posterUrl = tmdbAPI.getImageUrl(movie.poster_path, 'w500');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-surface border-border/50">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <ScrollArea className="max-h-[90vh]">
          {/* Backdrop Header */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={backdropUrl}
              alt={`${movie.title} backdrop`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
            
            {/* Header Content */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className="w-32 md:w-40 rounded-lg shadow-lg border border-border/20"
                  />
                </div>
                
                {/* Title and Basic Info */}
                <div className="flex-1 min-w-0">
                  <DialogHeader className="text-left space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                      {movie.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {releaseYear}
                      </div>
                      
                      {movieDetails?.runtime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatRuntime(movieDetails.runtime)}
                        </div>
                      )}
                      
                      {movie.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          {movie.vote_average.toFixed(1)} / 10
                        </div>
                      )}
                    </div>
                    
                    {/* Genres */}
                    {movieDetails?.genres && (
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.genres.slice(0, 4).map((genre) => (
                          <Badge key={genre.id} variant="secondary">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </DialogHeader>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleFavoriteClick}
                variant={isMovieFavorite ? "destructive" : "outline"}
                className="flex items-center gap-2"
              >
                <Heart className={cn("h-4 w-4", isMovieFavorite && "fill-current")} />
                {isMovieFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
              
              {movieDetails?.homepage && (
                <Button asChild variant="outline">
                  <a href={movieDetails.homepage} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Official Site
                  </a>
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => loadMovieDetails(movie.id)} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Movie Details */}
            {movieDetails && !isLoading && (
              <div className="space-y-6">
                {/* Tagline */}
                {movieDetails.tagline && (
                  <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-4">
                    "{movieDetails.tagline}"
                  </blockquote>
                )}

                {/* Overview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.overview || "No overview available."}
                  </p>
                </div>

                <Separator />

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Details</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{movieDetails.status}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Language:</span>
                        <span className="uppercase">{movieDetails.original_language}</span>
                      </div>
                      
                      {movieDetails.budget > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget:</span>
                          <span>{formatCurrency(movieDetails.budget)}</span>
                        </div>
                      )}
                      
                      {movieDetails.revenue > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span>{formatCurrency(movieDetails.revenue)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Production Companies */}
                  {movieDetails.production_companies.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Production</h3>
                      <div className="space-y-2">
                        {movieDetails.production_companies.slice(0, 3).map((company) => (
                          <div key={company.id} className="text-sm text-muted-foreground">
                            {company.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}