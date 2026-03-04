import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, Megaphone, Menu, X, Bell } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform transform md:relative md:translate-x-0 duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <span className="text-lg font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
              SD
            </div>
            SaaS Dash
          </span>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-card border-b border-border shadow-sm shrink-0">
          <button 
            onClick={toggleSidebar}
            className="p-1 -ml-1 text-muted-foreground hover:text-foreground md:hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30 cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-muted/30">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar} 
        />
      )}
    </div>
  );
};
