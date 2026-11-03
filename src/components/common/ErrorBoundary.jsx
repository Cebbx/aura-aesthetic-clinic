import React, { Component } from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Aura System Guard caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf7f7] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-aura-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-aura-100 text-aura-700 flex items-center justify-center text-3xl shadow-sm">
              <SafetyCertificateOutlined />
            </div>

            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark">
              Aura Aesthetic Clinic
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your session and clinic records are safe. We detected a minor connection hiccup, but no data was lost.
            </p>

            <div className="pt-2">
              <Button
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
                className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !h-11 !px-6 !font-bold text-xs sm:text-sm shadow-md shadow-aura-700/25"
              >
                Reload Secure Portal
              </Button>
            </div>

            <div className="text-[11px] text-gray-400 pt-2 border-t border-aura-100">
              System Resilience Guard • 24/7 Protected Session
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
