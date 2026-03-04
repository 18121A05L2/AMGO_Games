import React, { useState, useEffect } from 'react';
import type { CampaignStatus } from '@/services/mockData/campaigns';
import type { FetchCampaignsParams } from '@/services/campaignService';
import { Input } from '@/components/ui/Input';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CampaignFiltersProps {
  params: FetchCampaignsParams;
  onChange: (newParams: Partial<FetchCampaignsParams>) => void;
  className?: string;
}

const statusOptions: CampaignStatus[] = ['Draft', 'Active', 'Paused', 'Completed', 'Failed'];

export const CampaignFilters: React.FC<CampaignFiltersProps> = ({ params, onChange, className }) => {
  const [localSearch, setLocalSearch] = useState(params.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search effect without external hooks library
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ search: localSearch, page: 1 }); // reset to page 1 on search
    }, 500);

    return () => clearTimeout(handler);
  // Disabled exhaustive-deps to intentionally only run on localSearch change to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const toggleStatus = (status: CampaignStatus) => {
    const current = params.statusFilter || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
      
    onChange({ statusFilter: updated, page: 1 });
  };

  const hasActiveFilters = (params.statusFilter?.length || 0) > 0;

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 mb-6", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input 
          placeholder="Search campaigns by name..." 
          className="pl-9 h-10 w-full"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button 
            onClick={() => setLocalSearch('')}
            className="absolute right-3 top-1/2 -mt-2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="relative flex justify-end gap-2 isolate">
        <Button 
          variant={hasActiveFilters || isFilterOpen ? "secondary" : "outline"}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="gap-2 shrink-0 relative"
          size="default"
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              {params.statusFilter?.length}
            </span>
          )}
        </Button>
      </div>

      {isFilterOpen && (
        <div className="fixed sm:absolute z-[90] bg-card border border-border shadow-lg right-0 sm:right-6 top-auto sm:top-auto sm:mt-12 w-full sm:w-auto p-4 rounded-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 bottom-0 sm:bottom-auto rounded-b-none sm:rounded-b-lg bg-white">
          <div className="flex items-center justify-between sm:hidden pb-2 border-b border-border">
            <h3 className="font-medium text-sm">Filters</h3>
            <button onClick={() => setIsFilterOpen(false)}><X size={16}/></button>
          </div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</h4>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => {
              const isSelected = (params.statusFilter || []).includes(status);
              return (
                <Button
                  key={status}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs rounded-full px-3 transition-all", 
                    isSelected && {
                      "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent ring-emerald-600/30": status === 'Active',
                      "bg-red-600 hover:bg-red-700 text-white border-transparent ring-red-600/30": status === 'Failed',
                      "bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-amber-500/30": status === 'Paused',
                      "bg-blue-600 hover:bg-blue-700 text-white border-transparent ring-blue-600/30": status === 'Completed',
                      "bg-secondary-foreground hover:bg-secondary-foreground/90 text-background border-transparent": status === 'Draft'
                    },
                    isSelected && "ring-2 ring-offset-2"
                  )}
                  onClick={() => toggleStatus(status)}
                >
                  {status}
                </Button>
              );
            })}
          </div>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 h-7 text-xs text-muted-foreground self-end"
              onClick={() => onChange({ statusFilter: [], page: 1 })}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
