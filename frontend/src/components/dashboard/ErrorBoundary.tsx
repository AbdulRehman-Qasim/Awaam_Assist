import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-rose-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
          <p className="text-slate-500 max-w-md mt-2 mb-8">
            The dashboard encountered an unexpected error. This might be due to a temporary connection issue or a rendering problem.
          </p>
          <Button onClick={this.handleRetry} variant="default" className="gap-2 bg-slate-900">
            <RefreshCcw className="w-4 h-4" />
            Reload Dashboard
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
