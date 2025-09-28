import { dbHelpers } from '../services/idb';

export interface APIError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  isNearLimit: boolean;
}

class APIClient {
  private baseURL: string;
  private apiKey: string;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Parse rate limit headers
      this.parseRateLimitHeaders(response);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.fetchWithRetry(url, options, retries - 1);
        }
      }

      // Handle server errors with exponential backoff
      if (response.status >= 500 && retries > 0) {
        const waitTime = Math.pow(2, 3 - retries) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.fetchWithRetry(url, options, retries - 1);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (retries > 0 && this.isNetworkError(error)) {
        const waitTime = Math.pow(2, 3 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.fetchWithRetry(url, options, retries - 1);
      }

      throw error;
    }
  }

  private parseRateLimitHeaders(response: Response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining && reset) {
      this.rateLimitInfo = {
        remaining: parseInt(remaining),
        resetTime: parseInt(reset) * 1000,
        isNearLimit: parseInt(remaining) < 10,
      };
    }
  }

  private isNetworkError(error: any): boolean {
    return (
      error instanceof TypeError ||
      error.message === 'Failed to fetch' ||
      error.message === 'Network request failed'
    );
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Add API key to params
    const urlParams = new URLSearchParams({
      api_key: this.apiKey,
      ...params,
    });

    const url = `${this.baseURL}${endpoint}?${urlParams}`;
    const cacheKey = `GET:${endpoint}:${urlParams.toString()}`;

    // Try cache first for GET requests
    const cached = await dbHelpers.getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.status_message || `HTTP ${response.status}`,
          status: response.status,
          isNetworkError: false,
        } as APIError;
      }

      const data = await response.json();
      
      // Cache successful GET responses
      await dbHelpers.cacheAPIResponse(cacheKey, data, 10);
      
      // Track API usage
      await dbHelpers.trackEvent('api_call', {
        endpoint,
        status: response.status,
        cached: false,
      });

      return data;
    } catch (error) {
      // Track errors
      await dbHelpers.trackEvent('api_error', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (this.isNetworkError(error)) {
        throw {
          message: 'Network error. Please check your connection.',
          isNetworkError: true,
        } as APIError;
      }

      throw error;
    }
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

// TMDB API Client
export const tmdbClient = new APIClient(
  'https://api.themoviedb.org/3',
  import.meta.env.VITE_TMDB_API_KEY || 'demo-key'
);

// API response types for TMDB
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  video: boolean;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ english_name: string; iso_639_1: string; name: string }>;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  homepage: string;
  imdb_id: string;
}

// Helper functions for TMDB API
export const tmdbAPI = {
  searchMovies: (query: string, page = 1): Promise<TMDBSearchResponse> =>
    tmdbClient.get('/search/movie', { query, page }),

  getPopularMovies: (page = 1): Promise<TMDBSearchResponse> =>
    tmdbClient.get('/movie/popular', { page }),

  getMovieDetails: (movieId: number): Promise<TMDBMovieDetails> =>
    tmdbClient.get(`/movie/${movieId}`),

  getImageUrl: (path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
    if (!path) return '/placeholder.svg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },
};