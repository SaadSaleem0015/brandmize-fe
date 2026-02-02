import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  HiExclamationTriangle, 
  HiArrowPath, 
  HiHome, 
  HiChatBubbleLeftRight 
} from 'react-icons/hi2';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    console.group('🚨 Error Boundary Caught an Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Stack:', error.stack);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center p-2 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-glow max-w-sm w-full mx-auto transform animate-scale-in border border-border">
            <div className="p-4 bg-gradient-primary rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiExclamationTriangle className="text-primary-foreground text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-primary-foreground">Something Went Wrong</h3>
                  <p className="text-xs text-primary-foreground/80 mt-0.5">Let's get this fixed</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                An unexpected error occurred. Please try one of the options below to continue.
              </p>


              <div className="space-y-2">
                <button
                  onClick={this.handleRetry}
                  className="w-full group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] shadow-subtle text-white"
                >
                  <HiArrowPath className="text-sm group-hover:rotate-180 transition-transform duration-300 text-white" />
                  Try Again
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={this.handleReload}
                    className="group flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                  >
                    <HiArrowPath className="text-xs group-hover:rotate-180 transition-transform duration-300" />
                    Reload
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="group flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                  >
                    <HiHome className="text-xs group-hover:scale-110 transition-transform duration-200" />
                    Home
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-muted/50 rounded-b-lg border-t border-border">
              <button className="w-full group flex items-center justify-center gap-2 text-primary hover:text-primary/80 text-xs font-medium transition-all duration-200 hover:scale-[1.02]">
                <HiChatBubbleLeftRight className="text-xs group-hover:scale-110 transition-transform duration-200" />
                Need Help? Contact Support
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};