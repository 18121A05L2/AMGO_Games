import React from 'react';
import type { Campaign, CampaignStatus } from '@/services/mockData/campaigns';
import type { FetchCampaignsParams } from '@/services/campaignService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Play, Pause, AlertCircle, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CampaignTableProps {
  data: Campaign[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onUpdateStatus: (id: string, status: CampaignStatus) => void;
  params: FetchCampaignsParams;
  onSortParamChange: (sortBy: keyof Campaign) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  data,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onUpdateStatus,
  params,
  onSortParamChange
}) => {
  const handleSort = (key: keyof Campaign) => {
    onSortParamChange(key);
  };

  const SortIcon = ({ column }: { column: keyof Campaign }) => {
    if (params.sortBy !== column) return <div className="w-4" />;
    return params.sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getStatusBadgeVariant = (status: CampaignStatus) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Failed': return 'destructive';
      case 'Paused': return 'warning';
      case 'Completed': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-full overflow-auto rounded-lg border bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
          <tr>
            <th className="p-4 w-12 text-center">
              <input 
                type="checkbox" 
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                checked={data.length > 0 && selectedIds.length === data.length}
                onChange={onToggleAll}
                disabled={data.length === 0}
              />
            </th>
            <th className="p-4 cursor-pointer hover:bg-muted font-semibold" onClick={() => handleSort('name')}>
              <div className="flex items-center">Name <SortIcon column="name" /></div>
            </th>
            <th className="p-4 cursor-pointer hover:bg-muted font-semibold" onClick={() => handleSort('status')}>
              <div className="flex items-center">Status <SortIcon column="status" /></div>
            </th>
            <th className="p-4 cursor-pointer hover:bg-muted font-semibold" onClick={() => handleSort('budget')}>
              <div className="flex items-center">Budget <SortIcon column="budget" /></div>
            </th>
            <th className="p-4 cursor-pointer hover:bg-muted font-semibold" onClick={() => handleSort('startDate')}>
              <div className="flex items-center">Dates <SortIcon column="startDate" /></div>
            </th>
            <th className="p-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: params.pageSize || 10 }).map((_, i) => (
              <tr key={`skel-${i}`} className="animate-pulse">
                <td className="p-4"><div className="h-4 w-4 bg-muted rounded" /></td>
                <td className="p-4"><div className="h-4 w-3/4 bg-muted rounded" /></td>
                <td className="p-4"><div className="h-5 w-16 bg-muted rounded-full" /></td>
                <td className="p-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                <td className="p-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                <td className="p-4"><div className="h-8 w-8 bg-muted rounded-md ml-auto" /></td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-12 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
                <p>No campaigns found matching your criteria.</p>
              </td>
            </tr>
          ) : (
            data.map(campaign => (
              <tr 
                key={campaign.id} 
                className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(campaign.id) ? 'bg-primary/5' : ''}`}
              >
                <td className="p-4 text-center">
                  <input 
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    checked={selectedIds.includes(campaign.id)}
                    onChange={() => onToggleSelect(campaign.id)}
                  />
                </td>
                <td className="p-4 font-medium text-foreground max-w-[200px] truncate" title={campaign.name}>
                  {campaign.name}
                </td>
                <td className="p-4">
                  <Badge variant={getStatusBadgeVariant(campaign.status)} className="shadow-xs">
                    {campaign.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(campaign.spent)} spent</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">
                  <div className="flex flex-col text-xs">
                    <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                    <span>to {new Date(campaign.endDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 isolate">
                    {campaign.status === 'Active' ? (
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onUpdateStatus(campaign.id, 'Paused')} title="Pause">
                        <Pause size={14} />
                      </Button>
                    ) : (
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onUpdateStatus(campaign.id, 'Active')} title="Activate">
                        <Play size={14} />
                      </Button>
                    )}
                    <Link to={`/campaigns/${campaign.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
