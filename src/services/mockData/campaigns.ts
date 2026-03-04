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

export const mockCampaigns: Campaign[] = Array.from({ length: 54 }).map((_, i) => {
  const statuses: CampaignStatus[] = ['Draft', 'Active', 'Paused', 'Completed', 'Failed'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const budget = Math.floor(Math.random() * 10000) * 10 + 1000;
  return {
    id: `camp-${(i + 1).toString().padStart(3, '0')}`,
    name: `Global Ad Campaign ${i + 1}`,
    status,
    budget,
    spent: Math.floor(Math.random() * budget),
    startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + Math.floor(Math.random() * 30 + 10) * 24 * 60 * 60 * 1000).toISOString(),
  };
});
