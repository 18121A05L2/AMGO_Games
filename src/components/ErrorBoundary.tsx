import React, { Component } from 'react';
import type { ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md">
            {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
