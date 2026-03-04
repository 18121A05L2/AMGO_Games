import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, User, Bell, Shield, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(2, 'Role is required'),
  company: z.string().min(2, 'Company string is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  notificationsEnabled: z.boolean()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, isLoading } = useUserStore();
  const { addToast } = useUIStore();

  const { register, handleSubmit, formState: { errors, isDirty, isSubmitSuccessful }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  // Reset form with new profile data upon successful submit
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(profile);
    }
  }, [isSubmitSuccessful, profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      addToast({ title: 'Profile Updated', description: 'Your settings have been saved.', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to update profile.', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="text-primary h-5 w-5" />
              <CardTitle>Profile Details</CardTitle>
            </div>
            <CardDescription>Update your personal information and public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input {...register('name')} placeholder="Jane Doe" className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input {...register('email')} type="email" placeholder="jane@example.com" className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input {...register('company')} placeholder="Acme Corp" className={errors.company ? 'border-destructive' : ''} />
                {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input {...register('role')} disabled className="bg-muted text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Roles are managed by your administrator.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="text-primary h-5 w-5" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Manage your app preferences and notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium">Timezone</label>
                 <select 
                  {...register('timezone')} 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                 </select>
              </div>
              
              <div className="flex flex-col justify-center mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...register('notificationsEnabled')} 
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-medium block">Enable UI Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive toast alerts for background tasks.</span>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security (Read Only visually) */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="text-muted-foreground h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage security layers.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between border rounded-md p-4 bg-muted/30">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Status: Disabled</p>
                </div>
                <Button variant="outline" disabled>Enable 2FA</Button>
             </div>
          </CardContent>
        </Card>

        {/* Animated Global Save Action Banner */}
        <div className="sticky bottom-6 flex justify-center w-full z-40 pointer-events-none transition-all duration-300 pt-6">
          <div 
            className={cn(
              "flex items-center justify-between gap-4 sm:gap-6 bg-card border shadow-2xl shadow-black/10 p-3 sm:p-4 rounded-full transition-all duration-500 ease-out w-full max-w-3xl px-4 sm:px-6 pointer-events-auto origin-bottom",
              isDirty ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-sm">You have unsaved changes</p>
                <p className="text-xs text-muted-foreground hidden sm:block">Please save your settings before leaving.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => reset()} disabled={isLoading} className="gap-2 rounded-full h-9">
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Discard</span>
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!isDirty || isLoading}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-full h-9 px-4 sm:px-6"
              >
                <Save size={14} className={cn(isLoading && "animate-spin")} />
                {isLoading ? 'Saving...' : 'Save Updates'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
