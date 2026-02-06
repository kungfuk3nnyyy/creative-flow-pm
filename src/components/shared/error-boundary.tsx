"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="p-4 bg-error-soft rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-h4 text-ink">Something went wrong</h3>
          <p className="text-body-sm text-slate mt-2 max-w-sm">
            An unexpected error occurred. Please try again or contact support if
            the issue persists.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-6"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
