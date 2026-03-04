import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CampaignList } from '@/features/campaigns/views/CampaignList'
import { CampaignDetail } from '@/features/campaigns/views/CampaignDetail'

import { DashboardHome } from '@/features/dashboard/views/DashboardHome'
import { SettingsView } from '@/features/settings/views/SettingsView'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            
            <Route path="campaigns" element={<CampaignList />} />
            
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            
            <Route path="settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastProvider />
    </ErrorBoundary>
  )
}

export default App
