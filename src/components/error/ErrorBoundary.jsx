import logger from "@/utils/logger";
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  handleRefresh = () => {
    // Reset error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Refresh the page
    window.location.reload();
  };
  handleReset = () => {
    // Just reset the error state without refreshing
  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. 
                Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-3 rounded-md text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleRefresh} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
            </CardContent>
          </Card>
        </div>
      );
    return this.props.children;
}
export default ErrorBoundary; 
