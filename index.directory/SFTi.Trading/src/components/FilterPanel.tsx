import { useState } from 'react';
import { ScannerFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useKV } from '@github/spark/hooks';

// Custom SVG Icons
const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Filter = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RotateCcw = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4V10H7M3.51 15A9 9 0 0 0 20.49 9A9 9 0 0 0 12 3A9 9 0 0 0 5.64 5.64L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface FilterPanelProps {
  filters: ScannerFilters;
  onFiltersChange: (filters: ScannerFilters) => void;
}

const PRESET_FILTERS = {
  'Hot Penny Stocks': {
    priceMin: 0.01,
    priceMax: 5.00,
    marketCapMin: 50_000_000,
    marketCapMax: 2_000_000_000,
    floatMin: 10_000_000,
    floatMax: 500_000_000,
    volumeMin: 5_000_000,
    changeMin: 5,
    changeMax: 100,
    newsOnly: false
  },
  'Low Float Runners': {
    priceMin: 0.50,
    priceMax: 5.00,
    marketCapMin: 100_000_000,
    marketCapMax: 1_000_000_000,
    floatMin: 10_000_000,
    floatMax: 100_000_000,
    volumeMin: 2_000_000,
    changeMin: 10,
    changeMax: 100,
    newsOnly: false
  },
  'News Breakouts': {
    priceMin: 0.10,
    priceMax: 5.00,
    marketCapMin: 25_000_000,
    marketCapMax: 2_000_000_000,
    floatMin: 5_000_000,
    floatMax: 1_000_000_000,
    volumeMin: 1_000_000,
    changeMin: 15,
    changeMax: 100,
    newsOnly: true
  }
};

const DEFAULT_FILTERS: ScannerFilters = {
  priceMin: 0.01,
  priceMax: 5.00,
  marketCapMin: 1_000_000,
  marketCapMax: 2_000_000_000,
  floatMin: 1_000_000,
  floatMax: 1_000_000_000,
  volumeMin: 100_000,
  changeMin: -100,
  changeMax: 100,
  newsOnly: false
};

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedPresets, setSavedPresets] = useKV<Record<string, ScannerFilters>>('scanner-presets', {});

  const formatValue = (value: number, type: 'price' | 'volume' | 'marketcap' | 'percent') => {
    switch (type) {
      case 'price':
        return `$${value.toFixed(2)}`;
      case 'volume':
        return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${(value / 1_000).toFixed(0)}K`;
      case 'marketcap':
        return value >= 1_000_000_000 ? `$${(value / 1_000_000_000).toFixed(1)}B` : `$${(value / 1_000_000).toFixed(0)}M`;
      case 'percent':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const applyPreset = (preset: ScannerFilters) => {
    onFiltersChange(preset);
  };

  const resetFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const saveCurrentAsPreset = (name: string) => {
    setSavedPresets(current => ({
      ...current,
      [name]: filters
    }));
  };

  return (
    <Card className="mb-1 py-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between px-3 py-2 h-8 font-medium rounded-none"
          >
            <div className="flex items-center gap-2">
              <Filter size={14} />
              <span className="text-sm">Scanner Filters</span>
            </div>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3">
            {/* Preset Filters */}
            <div>
              <Label className="text-xs font-medium mb-1 block">Quick Presets</Label>
              <div className="flex flex-wrap gap-1">
                {Object.entries(PRESET_FILTERS).map(([name, preset]) => (
                  <Button 
                    key={name}
                    size="sm" 
                    variant="outline"
                    onClick={() => applyPreset(preset)}
                    className="text-xs px-1.5 py-0.5 h-auto"
                  >
                    {name}
                  </Button>
                ))}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={resetFilters}
                  className="text-muted-foreground text-xs px-1.5 py-0.5 h-auto"
                >
                  <RotateCcw size={10} className="mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Price Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Price Range</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        priceMin: parseFloat(e.target.value) || 0
                      })}
                      className="text-xs h-8"
                      step="0.01"
                      min="0.01"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        priceMax: parseFloat(e.target.value) || 5
                      })}
                      className="text-xs h-8"
                      step="0.01"
                      max="5.00"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatValue(filters.priceMin, 'price')} - {formatValue(filters.priceMax, 'price')}
                  </div>
                </div>
              </div>

              {/* Market Cap Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Market Cap</Label>
                <Slider
                  value={[filters.marketCapMin, filters.marketCapMax]}
                  min={1_000_000}
                  max={2_000_000_000}
                  step={10_000_000}
                  onValueChange={([min, max]) => onFiltersChange({
                    ...filters,
                    marketCapMin: min,
                    marketCapMax: max
                  })}
                  className="py-2"
                />
                <div className="text-xs text-muted-foreground">
                  {formatValue(filters.marketCapMin, 'marketcap')} - {formatValue(filters.marketCapMax, 'marketcap')}
                </div>
              </div>

              {/* Float Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Float</Label>
                <Slider
                  value={[filters.floatMin, filters.floatMax]}
                  min={1_000_000}
                  max={1_000_000_000}
                  step={10_000_000}
                  onValueChange={([min, max]) => onFiltersChange({
                    ...filters,
                    floatMin: min,
                    floatMax: max
                  })}
                  className="py-2"
                />
                <div className="text-xs text-muted-foreground">
                  {formatValue(filters.floatMin, 'volume')} - {formatValue(filters.floatMax, 'volume')}
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Min Volume</Label>
                <Slider
                  value={[filters.volumeMin]}
                  min={100_000}
                  max={50_000_000}
                  step={100_000}
                  onValueChange={([min]) => onFiltersChange({
                    ...filters,
                    volumeMin: min
                  })}
                  className="py-2"
                />
                <div className="text-xs text-muted-foreground">
                  Min: {formatValue(filters.volumeMin, 'volume')}
                </div>
              </div>

              {/* Change % Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Change %</Label>
                <Slider
                  value={[filters.changeMin, filters.changeMax]}
                  min={-100}
                  max={100}
                  step={1}
                  onValueChange={([min, max]) => onFiltersChange({
                    ...filters,
                    changeMin: min,
                    changeMax: max
                  })}
                  className="py-2"
                />
                <div className="text-xs text-muted-foreground">
                  {formatValue(filters.changeMin, 'percent')} - {formatValue(filters.changeMax, 'percent')}
                </div>
              </div>

              {/* News Only Toggle */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">News Filter</Label>
                <div className="flex items-center space-x-2 py-2">
                  <Switch
                    checked={filters.newsOnly}
                    onCheckedChange={(checked) => onFiltersChange({
                      ...filters,
                      newsOnly: checked
                    })}
                  />
                  <Label className="text-xs text-muted-foreground">
                    Only stocks with news
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}