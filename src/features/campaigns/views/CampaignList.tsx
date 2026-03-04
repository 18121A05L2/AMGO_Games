import React, { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignTable } from '../components/CampaignTable';
import { CampaignFilters } from '../components/CampaignFilters';
import type { Campaign } from '@/services/mockData/campaigns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';

export const CampaignList: React.FC = () => {
  const { 
    data, total, isLoading, error, params, 
    setParams, updateStatusOptimistic, bulkUpdateStatusOptimistic, refresh, createCampaign
  } = useCampaigns();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', budget: 1000, startDate: '', endDate: '' });

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(c => c.id));
    }
  };

  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
    setSelectedIds([]); // clear selection across pages
  };

  const handleChangeParams = (newParams: Partial<typeof params>) => {
    setParams(prev => ({ ...prev, ...newParams }));
    setSelectedIds([]);
  };

  const handleSortParam = (sortBy: keyof Campaign) => {
    setParams(prev => ({
      ...prev,
      sortBy,
      sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleBulkAction = async (status: "Active" | "Paused") => {
    setIsBulkModalOpen(false);
    if (selectedIds.length === 0) return;
    await bulkUpdateStatusOptimistic(selectedIds, status);
    setSelectedIds([]);
  };

  const handleCreateSubmit = async () => {
    if (!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate) return;
    await createCampaign({
      name: newCampaign.name,
      budget: Number(newCampaign.budget),
      startDate: new Date(newCampaign.startDate).toISOString(),
      endDate: new Date(newCampaign.endDate).toISOString()
    });
    setIsCreateModalOpen(false);
    setNewCampaign({ name: '', budget: 1000, startDate: '', endDate: '' });
  };

  const totalPages = Math.ceil(total / (params.pageSize || 10));

  if (error && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertCircle size={48} className="text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Failed to load campaigns</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={refresh} className="mt-4 gap-2">
          <RefreshCw size={16} /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all your advertising campaigns.</p>
        </div>
        <div className="flex gap-2 isolate">
          <Button variant="outline" className="gap-2 text-muted-foreground" onClick={refresh}>
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> New Campaign
          </Button>
        </div>
      </div>

      <div className="bg-card w-full border border-border shadow-sm rounded-lg flex flex-col min-h-0 flex-1 relative isolate">
        <div className="p-4 sm:p-6 pb-0 sm:pb-0 z-20">
          <CampaignFilters 
            params={params} 
            onChange={handleChangeParams} 
          />
        </div>
        
        {selectedIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 mx-4 sm:mx-6 my-2 px-4 py-2 flex items-center justify-between z-10 sticky top-0 rounded-lg shadow-sm">
            <span className="text-sm font-medium flex items-center gap-2 text-primary">
              <CheckSquare size={16} />
              {selectedIds.length} campaign(s) selected
            </span>
            <Button size="sm" variant="default" className="shadow-sm font-semibold" onClick={() => setIsBulkModalOpen(true)}>
              Bulk Actions
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto px-4 sm:px-6 z-0">
          <CampaignTable
            data={data}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
            onUpdateStatus={updateStatusOptimistic}
            params={params}
            onSortParamChange={handleSortParam}
          />
        </div>

        {/* Pagination */}
        <div className="border-t border-border p-4 sm:px-6 flex items-center justify-between shrink-0 bg-muted/20 rounded-b-lg">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{total === 0 ? 0 : ((params.page || 1) - 1) * (params.pageSize || 10) + 1}</span> to <span className="font-medium text-foreground">{Math.min((params.page || 1) * (params.pageSize || 10), total)}</span> of <span className="font-medium text-foreground">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange((params.page || 2) - 1)}
              disabled={(params.page || 1) <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange((params.page || 1) + 1)}
              disabled={(params.page || 1) >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Apply Bulk Action"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={() => handleBulkAction('Active')}>Set Active</Button>
            <Button variant="secondary" onClick={() => handleBulkAction('Paused')}>Set Paused</Button>
          </>
        }
      >
        <p className="text-sm">You have selected <strong>{selectedIds.length}</strong> campaigns. What status would you like to assign them?</p>
        <div className="bg-muted p-3 mt-4 rounded text-xs border border-border text-muted-foreground">
          <AlertCircle size={14} className="inline mr-1" />
          Tip: Changing status will emit an optimistic UI update. If it fails due to mocked network latency, it will revert immediately.
        </div>
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Campaign"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateSubmit} 
              disabled={!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate}
            >
              Create Campaign
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Name</label>
            <Input value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="E.g. Summer Sale" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget ($)</label>
            <Input type="number" value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: Number(e.target.value)})} min={100} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={newCampaign.startDate} onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={newCampaign.endDate} onChange={e => setNewCampaign({...newCampaign, endDate: e.target.value})} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
