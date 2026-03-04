import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CampaignService } from '@/services/campaignService';
import type { Campaign } from '@/services/mockData/campaigns';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { OverviewTab } from '../components/OverviewTab';
import { AssetsTab } from '../components/AssetsTab';
import { PerformanceTab } from '../components/PerformanceTab';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CampaignService.getCampaignById(id);
        if (isMounted) setCampaign(data);
      } catch (err) {
        if (isMounted) setError('Failed to load campaign details. The item may have been deleted.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchCampaign();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return <div className="flex h-full items-center justify-center p-8"><Spinner size={48} /></div>;
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
         <AlertCircle size={48} className="text-destructive mb-4" />
         <h2 className="text-xl font-semibold">Error Loading Campaign</h2>
         <p className="text-muted-foreground">{error}</p>
         <Button onClick={() => navigate('/campaigns')} variant="outline" className="mt-4 gap-2">
           <ArrowLeft size={16} /> Back to List
         </Button>
      </div>
    );
  }

  const tabItems = [
    { id: 'overview', label: 'Overview', content: <OverviewTab campaign={campaign} onUpdate={(c: Campaign) => setCampaign(c)} /> },
    { id: 'assets', label: 'Assets', content: <AssetsTab campaignId={campaign.id} /> },
    { id: 'performance', label: 'Performance', content: <PerformanceTab campaignId={campaign.id} /> },
  ];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')} className="shrink-0 text-muted-foreground">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-border border-b-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight truncate">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1 -ml-1 text-sm">
              <span className="text-muted-foreground">ID: {campaign.id}</span>
              <span className="text-border">•</span>
              <Badge variant="outline">{campaign.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card w-full border border-border shadow-sm rounded-lg flex-1 min-h-0 flex flex-col pt-0 px-6 overflow-hidden">
        <Tabs tabs={tabItems} defaultTab="overview" className="flex-1 h-full" />
      </div>
    </div>
  );
};
