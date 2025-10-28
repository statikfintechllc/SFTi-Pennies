import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { aiSearchService } from '@/lib/aiSearch';
import { Stock } from '@/types';
import { cn } from '@/lib/utils';

// Custom SVG Icons
const TrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Lightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M12 3C8.686 3 6 5.686 6 9C6 11.209 7.209 13.109 9 14.17V16C9 16.552 9.448 17 10 17H14C14.552 17 15 16.552 15 16V14.17C16.791 13.109 18 11.209 18 9C18 5.686 15.314 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BarChart3 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21M7 14V20M12 9V20M17 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface MarketInsightsProps {
  stocks: Stock[];
}

export function MarketInsights({ stocks }: MarketInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load insights when dialog opens
  useEffect(() => {
    if (isOpen && insights.length === 0) {
      loadInsights();
    }
  }, [isOpen, stocks]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const newInsights = await aiSearchService.getMarketInsights(stocks);
      setInsights(newInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = () => {
    setInsights([]);
    loadInsights();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Mobile Button */}
      <DialogTrigger asChild className="lg:hidden">
        <Button variant="outline" size="md" className="gap-1 flex-1 max-w-[110px]">
          <span className="text-sm">Market Insights</span>
        </Button>
      </DialogTrigger>
      
      {/* Web Button */}
      <DialogTrigger asChild className="hidden lg:inline-flex">
        <Button variant="outline" size="lg" className="gap-3 px-6 py-3">
          <TrendingUp size={24} />
          <span className="text-lg font-medium">Market Insights</span>
        </Button>
      </DialogTrigger>      <DialogContent className="max-w-[90vw] w-[90vw] h-[80vh] lg:max-w-[800px] lg:w-[800px] lg:h-[600px] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm lg:text-base">
            <TrendingUp size={20} className="text-accent" />
            Market Insights & Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-shrink-0 pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInsights}
            disabled={isLoading}
            className="text-xs lg:text-sm"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        <div className="flex-1 min-h-0">
          <div className="h-full border border-border rounded-lg overflow-hidden bg-card/30">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing market data...</p>
                </div>
              ) : insights.length > 0 ? (
                <div className="p-3 lg:p-6 space-y-3 lg:space-y-4">
                  {insights.map((insight, index) => (
                    <Card key={index} className="bg-card/50 border-l-4 border-l-accent hover:bg-card/70 transition-colors">
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-start gap-2 lg:gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Lightbulb size={16} className="text-accent" />
                          </div>
                          <div className="text-xs lg:text-sm text-foreground leading-relaxed whitespace-normal break-words">
                            {insight}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-8 text-center h-full flex flex-col items-center justify-center">
                  <BarChart3 size={32} className="mx-auto mb-3 opacity-50 text-muted-foreground lg:hidden" />
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground hidden lg:block" />
                  <p className="text-sm lg:text-base mb-2 text-muted-foreground">No insights available</p>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4">Market analysis will appear here</p>
                  <Button variant="outline" size="sm" onClick={refreshInsights} disabled={isLoading}>
                    Generate Insights
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}