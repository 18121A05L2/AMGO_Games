import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Campaign } from '@/services/mockData/campaigns';
import { CampaignService } from '@/services/campaignService';
import { useUIStore } from '@/store/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Save } from 'lucide-react';

const overviewSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  budget: z.number().min(100, "Budget must be at least $100"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type OverviewFormData = z.infer<typeof overviewSchema>;

interface OverviewTabProps {
  campaign: Campaign;
  onUpdate: (c: Campaign) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ campaign, onUpdate }) => {
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format dates for input[type="date"]
  const formatDateForInput = (isoString: string) => {
    try { return new Date(isoString).toISOString().split('T')[0]; }
    catch { return ''; }
  };

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<OverviewFormData>({
    resolver: zodResolver(overviewSchema),
    defaultValues: {
      name: campaign.name,
      budget: campaign.budget,
      startDate: formatDateForInput(campaign.startDate),
      endDate: formatDateForInput(campaign.endDate),
    }
  });

  // Warn user of unsaved changes if they try to close tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (data: OverviewFormData) => {
    setIsSubmitting(true);
    try {
      const updated = await CampaignService.updateCampaign(campaign.id, {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
      onUpdate(updated);
      reset({
        name: updated.name,
        budget: updated.budget,
        startDate: formatDateForInput(updated.startDate),
        endDate: formatDateForInput(updated.endDate),
      });
      addToast({ title: 'Success', description: 'Campaign updated successfully.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Update Failed', description: 'Failed to update campaign details.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl animate-in slide-in-from-bottom-2 fade-in">
      {isDirty && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 text-warning-foreground rounded-md flex items-start gap-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-sm">Unsaved Changes</h4>
            <p className="text-sm opacity-90">You have modified this form. Don't forget to save your changes before leaving this tab.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Campaign Name</label>
          <Input {...register('name')} placeholder="Enter campaign name" />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Total Budget ($)</label>
          <Input 
            {...register('budget', { valueAsNumber: true })} 
            type="number" 
            placeholder="0.00" 
          />
          {errors.budget && <p className="text-destructive text-sm">{errors.budget.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input {...register('startDate')} type="date" />
            {errors.startDate && <p className="text-destructive text-sm">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input {...register('endDate')} type="date" />
            {errors.endDate && <p className="text-destructive text-sm">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => reset()} 
            disabled={!isDirty || isSubmitting}
          >
            Discard Changes
          </Button>
          <Button 
            type="submit" 
            disabled={!isDirty || isSubmitting}
            className="gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};
