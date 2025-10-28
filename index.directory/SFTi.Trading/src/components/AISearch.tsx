import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { aiSearchService } from '@/lib/aiSearch';
import { Stock, AISearchResult, SearchMemory } from '@/types';
import { useKV } from '@github/spark/hooks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Custom SVG Icons
const Search = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Brain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5C13.66 5 15 3.66 15 2C15 3.66 16.34 5 18 5C16.34 5 15 6.34 15 8C15 6.34 13.66 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22C10.34 22 9 20.66 9 19C9 20.66 7.66 22 6 22C7.66 22 9 20.66 9 19C9 17.34 10.34 16 12 16C13.66 16 15 17.34 15 19C15 20.66 13.66 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V5M15 8V19M9 8V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Target = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const Lightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M12 3C8.686 3 6 5.686 6 9C6 11.209 7.209 13.109 9 14.17V16C9 16.552 9.448 17 10 17H14C14.552 17 15 16.552 15 16V14.17C16.791 13.109 18 11.209 18 9C18 5.686 15.314 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const History = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12A9 9 0 1 0 12 3A9 9 0 0 0 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AISearchProps {
  stocks: Stock[];
  onStockSelect: (symbol: string) => void;
}

export function AISearch({ stocks, onStockSelect }: AISearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useKV<SearchMemory[]>('ai-search-history', []);
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, [stocks]);

  const loadSuggestions = async () => {
    try {
      const newSuggestions = await aiSearchService.getSearchSuggestions(stocks);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (!searchTerm) return;

    setIsSearching(true);
    try {
      const results = await aiSearchService.performSearch(searchTerm, stocks);
      setSearchResults(results);
      
      // Add to history
      setSearchHistory(prev => {
        const newHistory = [{
          query: searchTerm,
          results,
          timestamp: new Date(),
          filters: {} as any
        }, ...prev.slice(0, 19)]; // Keep last 20 searches
        return newHistory;
      });

      toast.success(`Found ${results.length} relevant stocks`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleStockClick = (symbol: string) => {
    onStockSelect(symbol);
    setIsOpen(false);
    toast.success(`Opened chart for ${symbol}`);
  };

  const getPatternBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-success';
    if (confidence >= 60) return 'bg-accent';
    return 'bg-muted';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Mobile Button */}
      <DialogTrigger asChild className="block lg:hidden">
        <Button variant="outline" size="md" className="gap-1 flex-1 max-w-[90px]">
          <span className="text-sm">AI Search</span>
        </Button>
      </DialogTrigger>
      
      {/* Web Button */}
      <DialogTrigger asChild className="hidden lg:inline-flex">
        <Button variant="outline" size="lg" className="gap-3 px-6 py-3">
          <Brain size={24} />
          <span className="text-lg font-medium">AI Search</span>
        </Button>
      </DialogTrigger>      <DialogContent className="max-w-[90vw] w-[90vw] h-[75vh] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-3">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Brain size={16} />
            AI Stock Search
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Input with History Dropdown */}
          <div className="flex gap-2 flex-shrink-0 items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Search for breakout patterns, high volume stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-8 h-8 text-sm"
              />
              
              {/* Recent Searches Dropdown */}
              <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
                  >
                    <History size={12} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-2" align="end">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium">Recent Searches</div>
                    {searchHistory.slice(0, 8).map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-8 px-2"
                        onClick={() => {
                          handleSuggestionClick(search.query);
                          setIsHistoryOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-left truncate">{search.query}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {search.results.length}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                    {searchHistory.length === 0 && (
                      <div className="text-center text-muted-foreground py-4 text-xs">
                        No recent searches
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={() => handleSearch()} 
              disabled={isSearching || !searchQuery.trim()}
              className="flex-shrink-0 px-4 h-8 text-sm"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Left Column - Search Results */}
            <div className="w-[70%] flex flex-col min-h-0">
              <div className="flex-shrink-0 mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target size={14} />
                  Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                </h3>
              </div>
              
              <div className="flex-1 min-h-0 border border-border rounded-lg overflow-hidden bg-card/50">
                <div className="h-full overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    <div className="p-3 space-y-3">
                      {searchResults.map((result, index) => (
                        <Card 
                          key={result.symbol}
                          className={cn(
                            "cursor-pointer transition-all hover:bg-muted/50 border-l-4",
                            result.relevanceScore >= 80 ? "border-l-success" :
                            result.relevanceScore >= 60 ? "border-l-accent" : "border-l-muted"
                          )}
                          onClick={() => handleStockClick(result.symbol)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex flex-col gap-2">
                                <h4 className="font-mono font-bold text-lg">{result.symbol}</h4>
                                <Badge variant="outline" className="text-sm w-fit">
                                  Relevance: {result.relevanceScore}%
                                </Badge>
                              </div>
                              {result.priceTargets && (
                                <div className="text-right text-sm text-muted-foreground space-y-1">
                                  <div>Target: ${result.priceTargets.target}</div>
                                  <div>Support: ${result.priceTargets.support}</div>
                                </div>
                              )}
                            </div>

                            {/* Reasons */}
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2">
                                {result.reasons.slice(0, 3).map((reason, i) => (
                                  <Badge key={i} variant="secondary" className="text-sm py-1 px-2">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Patterns */}
                            {result.patterns.length > 0 && (
                              <div className="space-y-2">
                                {result.patterns.slice(0, 2).map((pattern, i) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{pattern.pattern}</span>
                                    <Badge 
                                      className={cn(
                                        "text-sm py-1 px-2",
                                        getPatternBadgeColor(pattern.confidence)
                                      )}
                                    >
                                      {pattern.confidence}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                      <Brain size={40} className="mx-auto mb-3 opacity-50" />
                      <p className="text-base mb-2">No search results yet</p>
                      <p className="text-sm">Try searching for patterns, sectors, or conditions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Suggestions */}
            <div className="w-[30%] flex flex-col min-h-0">
              <div className="flex-shrink-0 mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb size={14} />
                  Quick Suggestions
                </h3>
              </div>
              <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card/50">
                <div className="h-full overflow-y-auto custom-scrollbar p-3">
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-auto py-2 px-3 text-left rounded-md leading-normal hover:bg-muted/70"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="leading-normal whitespace-normal break-words text-left">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}