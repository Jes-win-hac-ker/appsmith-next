import React from 'react';
import { Heart, Star, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TMDBMovie, tmdbAPI } from '../api/apiClient';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: TMDBMovie;
  onDetailsClick: (movie: TMDBMovie) => void;
  className?: string;
}

export function MovieCard({ movie, onDetailsClick, className }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isMovieFavorite = isFavorite(movie.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(movie);
  };

  const handleCardClick = () => {
    onDetailsClick(movie);
  };

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
  const posterUrl = tmdbAPI.getImageUrl(movie.poster_path, 'w500');

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300",
        "hover:scale-105 hover:shadow-card bg-card/80 backdrop-blur-sm",
        "border-border/50 hover:border-primary/20",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Favorite Button Overlay */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full",
              "bg-background/80 backdrop-blur-sm hover:bg-background/90",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isMovieFavorite && "opacity-100 text-destructive"
            )}
            onClick={handleFavoriteClick}
            aria-label={isMovieFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-all duration-200",
                isMovieFavorite && "fill-current"
              )} 
            />
          </Button>

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm"
            >
              <Star className="mr-1 h-3 w-3 fill-current text-yellow-500" />
              {movie.vote_average.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Movie Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {releaseYear}
          </div>
          
          {movie.overview && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {movie.overview}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}