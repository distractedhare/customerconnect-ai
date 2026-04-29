import React from 'react';
import { pickKipLine } from '../services/kip/kipVoice';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  compact?: boolean;
  resetKey?: string;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
      return;
    }

    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message ?? '';
      const kipLine = pickKipLine('recoverGenericError', errorMessage);
      const {
        title = 'We hit a hiccup',
        message = 'This section glitched. Reloading usually catches the signal back up.',
        actionLabel = 'Reload',
        compact = false,
      } = this.props;

      return (
        <div
          className={`flex items-center justify-center p-4 sm:p-6 ${compact ? 'min-h-[280px]' : 'min-h-screen'}`}
          style={{ background: compact ? 'transparent' : 'var(--bg-page)' }}
        >
          <div className="w-full max-w-md rounded-xl border border-t-magenta/20 bg-surface p-6 text-center shadow-md sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-t-magenta/10">
              <svg className="h-7 w-7 text-t-magenta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">Kip · Reset</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-foreground">
              {kipLine}
            </p>
            <p className="mt-2 text-[12px] font-medium leading-relaxed text-t-dark-gray">
              {message}
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="focus-ring mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-t-magenta px-5 py-3 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-md transition-transform hover:scale-[1.01] active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
