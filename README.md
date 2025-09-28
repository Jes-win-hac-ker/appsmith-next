# 🎬 Movie Discovery App

A modern, feature-rich movie discovery application built with React, TypeScript, and The Movie Database (TMDB) API. Features offline support, favorites management, advanced search, and a beautiful dark theme interface.

![Movie Discovery App](https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=400&fit=crop&q=80)

## ✨ Features

### 🔍 **Advanced Search**
- Debounced search with 300ms delay
- Search suggestions from recent searches
- Infinite scroll pagination
- Real-time search results

### ❤️ **Favorites Management**
- Save/remove movies from favorites
- Persistent storage using IndexedDB
- Search within favorites
- Export favorites data

### 🌐 **Offline Support**
- Service Worker for caching static assets
- IndexedDB for offline data storage
- Cache API for API responses
- Offline-first architecture

### 🎨 **Beautiful UI/UX**
- Modern dark theme with light mode option
- Responsive design for all devices
- Smooth animations and transitions
- Netflix-inspired card layouts
- Accessible design with proper ARIA labels

### ⚙️ **Customizable Settings**
- Theme toggle (light/dark)
- Adjustable page sizes
- Language preferences
- Offline mode toggle
- Data export functionality

### 📊 **Local Analytics**
- Track user interactions (stored locally only)
- View usage statistics
- Export analytics data
- Privacy-focused (no external tracking)

### 🔒 **Privacy & Security**
- All data stored locally (IndexedDB + localStorage)
- No external tracking
- API key secured via environment variables
- Rate limiting awareness

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- TMDB API key (free from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd movie-discovery-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API key**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your TMDB API key
   VITE_TMDB_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Building for Production

```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query (TanStack), Context API
- **Storage**: IndexedDB (idb wrapper), localStorage, Cache API
- **Routing**: React Router DOM
- **Testing**: Jest, React Testing Library (coming soon)
- **API**: The Movie Database (TMDB) REST API

### Project Structure
```
src/
├── api/                 # API client and adapters
│   ├── apiClient.ts     # Robust fetch wrapper with retry logic
│   └── tmdb.ts          # TMDB API specific functions
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # Main layout with navigation
│   ├── MovieCard.tsx    # Individual movie card
│   ├── MovieGrid.tsx    # Grid layout for movies
│   ├── SearchBar.tsx    # Search input with suggestions
│   └── MovieDetailModal.tsx # Movie details modal
├── contexts/            # React contexts
│   └── PreferencesContext.tsx # User preferences
├── hooks/               # Custom React hooks
│   ├── useDebounce.ts   # Debounce hook
│   ├── useFavorites.ts  # Favorites management
│   └── use-toast.ts     # Toast notifications
├── pages/               # Page components
│   ├── Home.tsx         # Main search and discovery page
│   ├── Favorites.tsx    # Saved movies page
│   ├── Settings.tsx     # App settings page
│   └── NotFound.tsx     # 404 error page
├── services/            # Core services
│   ├── idb.ts           # IndexedDB wrapper and schema
│   └── sw-registration.ts # Service worker registration
├── App.tsx              # Main app component
├── main.tsx             # Application entry point
└── index.css            # Global styles and design system
```

### Key Features Implementation

#### 🗄️ **Storage Architecture**
- **IndexedDB**: Primary storage for favorites, search history, API cache, preferences, and analytics
- **localStorage**: Quick access for theme preferences
- **Cache API**: Service worker managed cache for API responses and static assets

#### 🌐 **Offline Strategy**
- **Static Assets**: Cached on service worker install
- **API Responses**: Stale-while-revalidate strategy
- **Favorites**: Always available offline from IndexedDB
- **Search History**: Synced between online/offline states

#### 🔍 **Search Implementation**
- **Debounced Input**: 300ms delay to prevent excessive API calls
- **Pagination**: Infinite scroll with "Load More" button
- **History**: Recent searches saved to IndexedDB
- **Suggestions**: Smart autocomplete from search history

## 🎨 Design System

The app uses a custom design system built on Tailwind CSS with semantic color tokens:

### Color Palette
- **Primary**: Blue gradient (#3B82F6 → #6366F1)
- **Secondary**: Purple accent (#8B5CF6 → #A855F7)
- **Surface**: Dark backgrounds with subtle variations
- **Interactive**: Smooth hover states and focus indicators

### Typography
- **Headlines**: Bold, modern font stack
- **Body**: Optimized for readability
- **Code**: Monospace for technical content

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Multiple variants with smooth transitions
- **Forms**: Accessible inputs with proper focus states
- **Modals**: Backdrop blur with smooth animations

## 🔌 API Integration

### TMDB API Features Used
- **Search Movies**: `/search/movie`
- **Popular Movies**: `/movie/popular`  
- **Movie Details**: `/movie/{id}`
- **Movie Images**: `/t/p/{size}/{path}`

### Error Handling
- **Network Errors**: Retry with exponential backoff
- **Rate Limiting**: Respect API limits with proper headers
- **Offline Fallback**: Serve cached content when offline
- **User Feedback**: Clear error messages and retry options

### Rate Limiting
- **Detection**: Parse `X-RateLimit-*` headers
- **Prevention**: Cache responses to reduce API calls
- **User Notice**: Show warning when approaching limits
- **Graceful Degradation**: Fallback to cached content

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Proper touch targets and gestures
- **Performance**: Optimized for mobile networks
- **PWA Ready**: Service worker and manifest (can be extended)

## 🧪 Testing

### Current Testing Setup
- Jest configured for unit testing
- React Testing Library for component testing
- ESLint for code quality
- TypeScript for type safety

### Planned Test Coverage
- [ ] Search functionality
- [ ] Favorites management
- [ ] Offline capabilities
- [ ] Component interactions
- [ ] API error handling

## 🚀 Deployment

### Recommended Platforms
- **Vercel**: Zero-config deployment with automatic HTTPS
- **Netlify**: Easy static site hosting with form handling
- **GitHub Pages**: Free hosting for public repositories

### Environment Variables
Make sure to set your environment variables in your deployment platform:
```
VITE_TMDB_API_KEY=your_production_api_key
```

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Images and fonts optimized
- **Bundle Analysis**: Use `npm run build` to analyze bundle size
- **Service Worker**: Automatically generates caching strategies

## 🔒 Security Considerations

### API Key Security
- **Environment Variables**: Never commit API keys to version control
- **Client-Side Exposure**: TMDB API keys are safe for client-side use
- **Rate Limiting**: Implement request throttling to prevent abuse

### Data Privacy
- **Local Storage**: All user data stored locally
- **No Tracking**: Zero external analytics or tracking
- **User Control**: Full data export and deletion capabilities

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Extended recommended rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Movie Database (TMDB)**: Movie data and images
- **shadcn/ui**: Beautiful UI components
- **Lucide React**: Consistent icon set
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Powerful data fetching and caching

---

**Built with ❤️ using modern web technologies**

*This product uses the TMDB API but is not endorsed or certified by TMDB.*