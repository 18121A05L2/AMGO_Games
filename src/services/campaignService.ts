import { mockCampaigns } from './mockData/campaigns';
import type { Campaign, CampaignStatus } from './mockData/campaigns';
import { simulateDelay, simulateErrorRate } from './mockApi';
import type { PaginatedResponse } from './mockApi';

let campaignsDB = [...mockCampaigns];

export interface FetchCampaignsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusFilter?: CampaignStatus[];
  sortBy?: keyof Campaign;
  sortDirection?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  overbudgetCount: number;
  upcomingDeadlines: Campaign[];
  byStatus: Record<CampaignStatus, number>;
}

export const CampaignService = {
  async getCampaigns(params: FetchCampaignsParams): Promise<PaginatedResponse<Campaign>> {
    await simulateDelay(600);
    await simulateErrorRate(0.05); // 5% chance to fail to test UI error states

    const {
      page = 1,
      pageSize = 10,
      search = '',
      statusFilter = [],
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = params;

    // Filter
    let filtered = campaignsDB.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(c.status);
      return matchSearch && matchStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof Campaign] as any;
      const bVal = b[sortBy as keyof Campaign] as any;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getCampaignById(id: string): Promise<Campaign> {
    await simulateDelay(400);
    const campaign = campaignsDB.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    return { ...campaign };
  },

  async updateCampaignStatus(id: string, newStatus: CampaignStatus): Promise<Campaign> {
    await simulateDelay(500);
    // Increased error rate for mutations to easily test optimistic UI rollback
    await simulateErrorRate(0.2); 
    
    const index = campaignsDB.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    campaignsDB[index] = { ...campaignsDB[index], status: newStatus };
    return { ...campaignsDB[index] };
  },

  async bulkUpdateStatus(ids: string[], newStatus: CampaignStatus): Promise<void> {
    await simulateDelay(800);
    await simulateErrorRate(0.1);

    campaignsDB = campaignsDB.map(c => 
      ids.includes(c.id) ? { ...c, status: newStatus } : c
    );
  },
  
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    await simulateDelay(600);
    await simulateErrorRate(0.1);
    
    const index = campaignsDB.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...safeUpdates } = updates;
    campaignsDB[index] = { ...campaignsDB[index], ...safeUpdates };
    return { ...campaignsDB[index] };
  },
  
  async createCampaign(data: Omit<Campaign, 'id' | 'spent' | 'status'>): Promise<Campaign> {
    await simulateDelay(600);
    await simulateErrorRate(0.05);

    const newCampaign: Campaign = {
      ...data,
      id: `camp-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
      status: 'Draft',
      spent: 0
    };
    
    // Add to top of mock database
    campaignsDB.unshift(newCampaign);
    return { ...newCampaign };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await simulateDelay(800);
    
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(now.getDate() + 10);

    const stats: DashboardStats = {
      totalCampaigns: campaignsDB.length,
      activeCampaigns: 0,
      completedCampaigns: 0,
      totalBudget: 0,
      totalSpent: 0,
      overbudgetCount: 0,
      upcomingDeadlines: [],
      byStatus: {
        Draft: 0, Active: 0, Paused: 0, Completed: 0, Failed: 0
      }
    };

    campaignsDB.forEach(c => {
      stats.byStatus[c.status]++;
      if (c.status === 'Active') stats.activeCampaigns++;
      if (c.status === 'Completed') stats.completedCampaigns++;
      
      stats.totalBudget += c.budget;
      stats.totalSpent += c.spent;

      if (c.spent > c.budget) {
        stats.overbudgetCount++;
      }

      const endDate = new Date(c.endDate);
      if (endDate >= now && endDate <= tenDaysFromNow && c.status !== 'Completed') {
        stats.upcomingDeadlines.push(c);
      }
    });

    // Sort upcoming deadlines by closest first
    stats.upcomingDeadlines.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    stats.upcomingDeadlines = stats.upcomingDeadlines.slice(0, 5); // top 5

    return stats;
  }
};
