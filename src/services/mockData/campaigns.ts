export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Failed';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
}

import campaignsData from './campaignsData.json';

export const mockCampaigns: Campaign[] = campaignsData as Campaign[];
