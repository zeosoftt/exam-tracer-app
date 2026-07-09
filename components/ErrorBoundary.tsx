/**
 * Global Error Boundary
 * Catches React errors and displays user-friendly messages
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { postClientError } from '@/lib/client-api/logErrorClient';
import { captureException } from '@/lib/sentry/capture';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, { componentStack: errorInfo.componentStack ?? undefined });

    if (typeof window !== 'undefined') {
      // Send error to logging API
      void postClientError({
        message: error.message,
        stack: error.stack ?? undefined,
        componentStack: errorInfo.componentStack ?? undefined,
      });

      // Development: also log to console
      if (process.env.NODE_ENV === 'development') {
        console.error('React Error Boundary:', error, errorInfo);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-secondary-50">
          <div className="card max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold text-danger-600">
              Bir Hata Oluştu
            </h1>
            <p className="mb-6 text-secondary-600">
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
