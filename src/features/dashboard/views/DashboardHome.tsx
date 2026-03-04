import React, { useEffect, useState } from 'react';
import { CampaignService } from '@/services/campaignService';
import type { DashboardStats } from '@/services/campaignService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, Target, TrendingUp, DollarSign, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getDashboardStats();
        if (mounted) setStats(data);
      } catch (err) {
        if (mounted) setError('Failed to load dashboard metrics.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Spinner size={48} />
        <p className="text-muted-foreground animate-pulse">Loading workspace analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertCircle size={48} className="text-destructive" />
        <h2 className="text-xl font-semibold">Dashboard Unavailable</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const pieData = [
    { name: 'Active', value: stats.byStatus['Active'], color: 'hsl(var(--primary))' },
    { name: 'Paused', value: stats.byStatus['Paused'], color: '#f59e0b' },
    { name: 'Completed', value: stats.byStatus['Completed'], color: '#3b82f6' },
    { name: 'Failed', value: stats.byStatus['Failed'], color: 'hsl(var(--destructive))' },
    { name: 'Draft', value: stats.byStatus['Draft'], color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  const budgetProgress = Math.min((stats.totalSpent / Math.max(stats.totalBudget, 1)) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your workspace</h1>
        <p className="text-muted-foreground mt-1">Here's a high-level overview of your advertising operations.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{stats.totalCampaigns}</h2>
              <span className="text-sm text-emerald-500 font-medium flex items-center"><TrendingUp size={14} className="mr-1"/> active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold">{formatCurrency(stats.totalBudget)}</h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold">{formatCurrency(stats.totalSpent)}</h2>
            <div className="h-2 w-full bg-secondary rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full ${budgetProgress > 90 ? 'bg-destructive' : 'bg-primary'}`} 
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.overbudgetCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Overbudget Alerts</p>
              <AlertTriangle className={`h-4 w-4 ${stats.overbudgetCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{stats.overbudgetCount}</h2>
              <span className="text-sm text-muted-foreground">campaigns exceeding budget</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Deadlines (Next 10 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {stats.upcomingDeadlines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 opacity-20 mb-2" />
                <p>No immediate deadlines approaching.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingDeadlines.map(campaign => {
                  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col truncate pr-4">
                        <Link to={`/campaigns/${campaign.id}`} className="font-medium hover:underline text-primary truncate">
                          {campaign.name}
                        </Link>
                        <span className="text-xs text-muted-foreground mt-1 text-ellipsis">Ends: {new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${daysLeft <= 3 ? 'text-destructive' : ''}`}>{daysLeft} days</p>
                          <p className="text-xs text-muted-foreground">remaining</p>
                        </div>
                        <Badge variant="outline">{campaign.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
