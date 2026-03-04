import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CampaignList } from '@/features/campaigns/views/CampaignList'

// Placeholder components until we build the real ones
const DashboardPlaceholder = () => (
  <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-muted-foreground mt-2">Welcome to your workspace.</p></div>
)
const SettingsPlaceholder = () => (
  <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>
)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPlaceholder />} />
            
            <Route path="campaigns" element={<CampaignList />} />
            
            <Route path="campaigns/:id" element={
              <div className="p-8"><h1 className="text-2xl font-bold">Campaign Details</h1></div>
            } />
            
            <Route path="settings" element={<SettingsPlaceholder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastProvider />
    </ErrorBoundary>
  )
}

export default App
