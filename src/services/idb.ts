import { openDB, DBSchema } from 'idb';

export interface AppDB extends DBSchema {
  favorites: {
    key: number;
    value: {
      id: number;
      title: string;
      overview: string;
      poster_path: string;
      release_date: string;
      vote_average: number;
      savedAt: number;
    };
  };
  'search-history': {
    key: string;
    value: {
      query: string;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
  'api-cache': {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      ttl: number;
    };
    indexes: { 'by-timestamp': number };
  };
  preferences: {
    key: string;
    value: any;
  };
  analytics: {
    key: number;
    value: {
      action: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

// Initialize IndexedDB
export const initDB = async () => {
  return openDB<AppDB>('movie-discovery-db', 1, {
    upgrade(db) {
      // Favorites store
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }

      // Search history store
      if (!db.objectStoreNames.contains('search-history')) {
        const searchStore = db.createObjectStore('search-history', { keyPath: 'query' });
        searchStore.createIndex('by-timestamp', 'timestamp');
      }

      // API cache store
      if (!db.objectStoreNames.contains('api-cache')) {
        const cacheStore = db.createObjectStore('api-cache', { keyPath: 'key' });
        cacheStore.createIndex('by-timestamp', 'timestamp');
      }

      // Preferences store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences');
      }

      // Analytics store
      if (!db.objectStoreNames.contains('analytics')) {
        const analyticsStore = db.createObjectStore('analytics', { autoIncrement: true });
        analyticsStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
};

// Helper functions for common operations
export const dbHelpers = {
  // Favorites
  addFavorite: async (movie: AppDB['favorites']['value']) => {
    const db = await initDB();
    return db.add('favorites', movie);
  },

  removeFavorite: async (id: number) => {
    const db = await initDB();
    return db.delete('favorites', id);
  },

  getFavorites: async () => {
    const db = await initDB();
    return db.getAll('favorites');
  },

  isFavorite: async (id: number) => {
    const db = await initDB();
    const favorite = await db.get('favorites', id);
    return !!favorite;
  },

  // Search history
  addToSearchHistory: async (query: string) => {
    const db = await initDB();
    return db.put('search-history', {
      query,
      timestamp: Date.now(),
    });
  },

  getSearchHistory: async (limit = 10) => {
    const db = await initDB();
    const tx = db.transaction('search-history', 'readonly');
    const index = tx.store.index('by-timestamp');
    const history = await index.getAll();
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  // API Cache
  cacheAPIResponse: async (key: string, data: any, ttlMinutes = 10) => {
    const db = await initDB();
    return db.put('api-cache', {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  },

  getCachedResponse: async (key: string) => {
    const db = await initDB();
    const cached = await db.get('api-cache', key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      await db.delete('api-cache', key);
      return null;
    }

    return cached.data;
  },

  // Preferences
  setPreference: async (key: string, value: any) => {
    const db = await initDB();
    return db.put('preferences', value, key);
  },

  getPreference: async (key: string) => {
    const db = await initDB();
    return db.get('preferences', key);
  },

  // Analytics
  trackEvent: async (action: string, data: any = {}) => {
    const db = await initDB();
    return db.add('analytics', {
      action,
      data,
      timestamp: Date.now(),
    });
  },

  getAnalytics: async (limit = 100) => {
    const db = await initDB();
    const tx = db.transaction('analytics', 'readonly');
    const index = tx.store.index('by-timestamp');
    const events = await index.getAll();
    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
};