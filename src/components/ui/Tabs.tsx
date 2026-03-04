import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="py-6 flex-1 outline-none min-h-0">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
