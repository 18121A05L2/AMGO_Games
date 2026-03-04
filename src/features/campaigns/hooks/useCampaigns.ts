import { useState, useCallback, useEffect } from 'react';
import type { Campaign, CampaignStatus } from '@/services/mockData/campaigns';
import { CampaignService } from '@/services/campaignService';
import type { FetchCampaignsParams } from '@/services/campaignService';
import { useUIStore } from '@/store/uiStore';

export function useCampaigns() {
  const { addToast } = useUIStore();
  const [data, setData] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<FetchCampaignsParams>({
    page: 1,
    pageSize: 10,
    search: '',
    statusFilter: [],
    sortBy: 'startDate',
    sortDirection: 'desc'
  });

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CampaignService.getCampaigns(params);
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      setError('Failed to fetch campaigns. Please try again.');
      addToast({ title: 'Error', description: 'Failed to fetch campaigns due to a network error.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [params, addToast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const updateStatusOptimistic = async (id: string, newStatus: CampaignStatus) => {
    // 1. Save previous state for rollback
    const previousState = [...data];
    
    // 2. Optimistically update local state immediately
    setData(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    // 3. Perform actual mutation
    try {
      await CampaignService.updateCampaignStatus(id, newStatus);
      addToast({ title: 'Updated', description: 'Campaign status updated successfully.', type: 'success' });
    } catch (err) {
      // 4. Rollback on failure
      setData(previousState);
      addToast({ title: 'Update Failed', description: 'Reverted campaign status due to network error.', type: 'error' });
    }
  };

  const bulkUpdateStatusOptimistic = async (ids: string[], newStatus: CampaignStatus) => {
    const previousState = [...data];
    setData(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: newStatus } : c));
    
    try {
      await CampaignService.bulkUpdateStatus(ids, newStatus);
      addToast({ title: 'Bulk Updated', description: `${ids.length} campaigns updated successfully.`, type: 'success' });
    } catch (err) {
      setData(previousState);
      addToast({ title: 'Bulk Update Failed', description: 'Reverted bulk update due to network error.', type: 'error' });
    }
  };

  return {
    data,
    total,
    isLoading,
    error,
    params,
    setParams,
    updateStatusOptimistic,
    bulkUpdateStatusOptimistic,
    refresh: fetchCampaigns
  };
}
