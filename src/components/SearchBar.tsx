import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '../hooks/useDebounce';
import { dbHelpers } from '../services/idb';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  onSearch, 
  isLoading = false,
  placeholder = "Search for movies...",
  className 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(value, 300);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery !== value) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  const loadSearchHistory = async () => {
    try {
      const history = await dbHelpers.getSearchHistory(5);
      setSearchHistory(history.map(h => h.query));
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      // Save to search history
      await dbHelpers.addToSearchHistory(query.trim());
      await loadSearchHistory();
      
      // Track search
      await dbHelpers.trackEvent('movie_search', { query: query.trim() });
      
      // Trigger search
      onSearch(query.trim());
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleHistoryClick = (query: string) => {
    onChange(query);
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Show suggestions when typing
    if (newValue.trim() && searchHistory.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const clearSearch = () => {
    onChange('');
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.trim() && searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const filteredHistory = searchHistory.filter(h => 
    h.toLowerCase().includes(value.toLowerCase()) && h !== value
  );

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full pl-10 pr-12 h-12 text-base",
            "bg-surface border-border/50 focus:border-primary/50",
            "transition-all duration-200",
            isFocused && "ring-2 ring-primary/20"
          )}
          disabled={isLoading}
        />
        
        {/* Clear Button */}
        {value && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={clearSearch}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && filteredHistory.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 border-border/50 bg-surface/95 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent searches
              </div>
              
              {filteredHistory.map((query, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left",
                    "hover:bg-muted/50 rounded-md transition-colors",
                    "text-sm text-foreground"
                  )}
                  onClick={() => handleHistoryClick(query)}
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1">{query}</span>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="mr-1 h-2 w-2" />
                    Recent
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}