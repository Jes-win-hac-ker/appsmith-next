import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Trash2, Download, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePreferences } from '../contexts/PreferencesContext';
import { dbHelpers } from '../services/idb';
import { useToast } from '../hooks/use-toast';

export default function Settings() {
  const { preferences, updatePreferences, isLoading } = usePreferences();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updatePreferences({ theme });
  };

  const handlePageSizeChange = (pageSize: string) => {
    updatePreferences({ pageSize: parseInt(pageSize) });
  };

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language });
  };

  const handleOfflineModeToggle = (offlineMode: boolean) => {
    updatePreferences({ offlineMode });
  };

  const clearAllData = async () => {
    try {
      // Clear all data using helper functions
      const [favorites, searchHistory, analytics] = await Promise.all([
        dbHelpers.getFavorites(),
        dbHelpers.getSearchHistory(1000),
        dbHelpers.getAnalytics(1000),
      ]);

      // Delete all favorites
      await Promise.all(favorites.map(fav => dbHelpers.removeFavorite(fav.id)));
      
      // Clear localStorage
      localStorage.clear();
      
      toast({
        title: "Data Cleared",
        description: "All app data has been cleared successfully",
      });
      
      // Reload page to reset state
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast({
        title: "Error",
        description: "Failed to clear app data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    try {
      const [favorites, searchHistory, analyticsData] = await Promise.all([
        dbHelpers.getFavorites(),
        dbHelpers.getSearchHistory(50),
        dbHelpers.getAnalytics(100),
      ]);

      const exportData = {
        favorites,
        searchHistory,
        analytics: analyticsData,
        preferences,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movie-discovery-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await dbHelpers.getAnalytics(20);
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const pageSizeOptions = [
    { value: '10', label: '10 movies per page' },
    { value: '20', label: '20 movies per page' },
    { value: '50', label: '50 movies per page' },
  ];

  const languageOptions = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'it-IT', label: 'Italiano' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'ko-KR', label: '한국어' },
    { value: 'zh-CN', label: '中文 (简体)' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
            <SettingsIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Customize your movie discovery experience
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={preferences.theme === value ? "default" : "outline"}
                    onClick={() => handleThemeChange(value as 'light' | 'dark')}
                    className="justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Discovery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Discovery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="pageSize">Results per page</Label>
              <Select 
                value={preferences.pageSize.toString()} 
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="language">Preferred language</Label>
              <Select 
                value={preferences.language} 
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Offline Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="offline-mode">Enable offline mode</Label>
                <p className="text-sm text-muted-foreground">
                  Cache search results for offline viewing
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={preferences.offlineMode}
                onCheckedChange={handleOfflineModeToggle}
              />
            </div>
            
            {preferences.offlineMode && (
              <Alert>
                <AlertDescription>
                  Offline mode is enabled. Search results and movie details will be cached for offline access.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button
                onClick={exportData}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                Export Your Data
              </Button>

              <Button
                onClick={loadAnalytics}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Usage Analytics
              </Button>

              <Separator />

              <Button
                onClick={clearAllData}
                variant="destructive"
                className="w-full justify-start gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                This will permanently delete all your favorites, search history, and settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Display */}
      {showAnalytics && analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Usage Analytics (Local Only)</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAnalytics(false)}
              >
                Hide
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analytics.map((event, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {event.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.data && Object.keys(event.data).length > 0 && (
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {JSON.stringify(event.data, null, 0)}
                    </code>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Analytics data is stored locally and never sent to external servers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}