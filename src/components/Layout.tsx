import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Home, Heart, Settings, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { favorites } = useFavorites();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Favorites', href: '/favorites', icon: Heart, badge: favorites.length },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mr-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Film className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              MovieDiscover
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-1 flex-1">
            {navigation.map(({ name, href, icon: Icon, badge }) => {
              const isActive = location.pathname === href;
              
              return (
                <Button
                  key={name}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "relative",
                    isActive && "bg-secondary/80"
                  )}
                >
                  <Link to={href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{name}</span>
                    {badge !== undefined && badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="h-5 px-1 text-xs ml-1 min-w-[20px] flex items-center justify-center"
                      >
                        {badge > 99 ? '99+' : badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* GitHub Link */}
          <Button asChild variant="ghost" size="icon" className="ml-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-surface/50">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Built with React, TypeScript, and The Movie Database (TMDB) API
            </p>
            <p className="text-xs">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}