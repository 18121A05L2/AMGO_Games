import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { simulateDelay, simulateErrorRate } from '@/services/mockApi';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PerformanceTabProps {
  campaignId: string;
}

const generateMockData = () => {
  const data = [];
  let baseValue = 1000;
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    baseValue = baseValue + (Math.random() * 500 - 200);
    if (baseValue < 0) baseValue = 100;
    data.push({
      date: d.toISOString().split('T')[0],
      impressions: Math.floor(baseValue * 10),
      clicks: Math.floor(baseValue),
      conversions: Math.floor(baseValue * 0.05)
    });
  }
  return data;
};

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ campaignId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      await simulateDelay(1500); 
      await simulateErrorRate(0.1); // High error rate to demonstrate error UI
      setData(generateMockData());
    } catch (err) {
      setError('Failed to load performance metrics from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  if (loading) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/10">
        <Spinner size={32} />
        <p className="mt-4 text-sm text-muted-foreground">Loading interactive chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center border border-dashed border-destructive/30 rounded-lg bg-destructive/5 text-center p-6 space-y-4">
         <AlertCircle size={32} className="text-destructive mb-2" />
         <h3 className="text-lg font-medium text-destructive">Dashboard Error</h3>
         <p className="text-sm text-muted-foreground">{error}</p>
         <Button onClick={fetchMetrics} variant="outline" className="mt-4 gap-2">
           <RefreshCw size={16} /> Retry
         </Button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/10 text-center">
        <p className="text-muted-foreground">No performance data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <p className="text-sm text-muted-foreground font-medium mb-1">Total Impressions</p>
          <p className="text-2xl font-bold">{data.reduce((a, b) => a + b.impressions, 0).toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <p className="text-sm text-muted-foreground font-medium mb-1">Total Clicks</p>
          <p className="text-2xl font-bold">{data.reduce((a, b) => a + b.clicks, 0).toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <p className="text-sm text-muted-foreground font-medium mb-1">Conversions</p>
          <p className="text-2xl font-bold">{data.reduce((a, b) => a + b.conversions, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="h-[400px] w-full border rounded-lg bg-card p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={10} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}`} 
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorClicks)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
