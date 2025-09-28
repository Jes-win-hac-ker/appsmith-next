import React from 'react';
import { MovieCard } from './MovieCard';
import { TMDBMovie } from '../api/apiClient';
import { cn } from '@/lib/utils';

interface MovieGridProps {
  movies: TMDBMovie[];
  onMovieClick: (movie: TMDBMovie) => void;
  className?: string;
}

export function MovieGrid({ movies, onMovieClick, className }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No movies found
        </h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search terms or browse popular movies to discover something new.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className
      )}
    >
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onDetailsClick={onMovieClick}
        />
      ))}
    </div>
  );
}