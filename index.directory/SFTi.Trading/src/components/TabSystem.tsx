import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tab, Stock } from '@/types';
import { TabSelector } from './TabSelector';

interface TabSystemProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onAddTab: (symbol: string) => void;
  onAddEmptyTab?: () => void;
  stocks: Stock[];
  maxTabs?: number;
}

export function TabSystem({ 
  tabs, 
  activeTabId, 
  onTabChange, 
  onTabClose, 
  onAddTab,
  onAddEmptyTab,
  stocks,
  maxTabs = 6 
}: TabSystemProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);

  // Debug: Log tabs to console
  console.log('TabSystem rendering tabs:', tabs);

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const canAddTab = tabs.length < maxTabs;
  const openTabSymbols = tabs.filter(tab => tab.symbol).map(tab => tab.symbol!);

  return (
    <div className="flex items-center bg-card border-b border-border">
      <ScrollArea className="flex-1">
        <div className="flex items-center min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-3 min-w-0 cursor-pointer border-r border-border transition-colors whitespace-nowrap",
                "hover:bg-muted/50",
                activeTabId === tab.id && "bg-background border-b-2 border-b-accent"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                {tab.type === 'scanner' ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-muted-foreground flex-shrink-0"
                  >
                    {/* Chart grid */}
                    <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="3" y1="15" x2="9" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="9" y1="21" x2="9" y2="3" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="15" y1="21" x2="15" y2="3" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                    
                    {/* Stock chart line (upward trend) */}
                    <path d="M 4 18 Q 7 16 10 12 T 16 8 T 20 6" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round"/>
                    
                    {/* Data points */}
                    <circle cx="4" cy="18" r="1" fill="currentColor"/>
                    <circle cx="10" cy="12" r="1" fill="currentColor"/>
                    <circle cx="16" cy="8" r="1" fill="currentColor"/>
                    <circle cx="20" cy="6" r="1.5" fill="currentColor"/>
                    
                    {/* Up arrow */}
                    <path d="M 19 7 L 20 6 L 21 7" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round"/>
                  </svg>
                ) : tab.type === 'sfti_top10' ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary flex-shrink-0"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {tab.title}
                </span>
              </div>
              
              {tab.type !== 'scanner' && tab.type !== 'sfti_top10' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive ml-2"
                  onClick={(e) => handleTabClose(e, tab.id)}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {canAddTab && (
        <div className="flex-shrink-0">
          <TabSelector 
            stocks={stocks}
            onStockSelect={onAddTab}
            onCreateEmptyTab={onAddEmptyTab}
            openTabSymbols={openTabSymbols}
          />
        </div>
      )}
    </div>
  );
}

export type { Tab };