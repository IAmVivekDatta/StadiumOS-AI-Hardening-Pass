'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-5 text-center space-y-3 flex flex-col items-center justify-center min-h-[150px] w-full">
          <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
          <h3 className="text-xs font-semibold text-red-400">
            {this.props.fallbackTitle || 'Component Render Error'}
          </h3>
          <p className="text-[10px] text-neutral-400 max-w-xs leading-normal">
            An unexpected error occurred while rendering this interface component. Telemetry fallback is active.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-400 text-[10px] rounded transition-colors"
          >
            Retry Render
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
