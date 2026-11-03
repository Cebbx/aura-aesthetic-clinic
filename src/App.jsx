import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/common/Header';
import ClientBookingView from './components/ClientBooking/ClientBookingView';
import AdminDashboardView from './components/AdminDashboard/AdminDashboardView';
import AboutSupportModal from './components/ClientBooking/AboutSupportModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

const MainContent = () => {
  const {
    currentView,
    setCurrentView,
    clinicProfile,
    aboutModalOpen,
    closeAboutModal,
    openAboutModal
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f7] text-[#2d2024]">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main View Body */}
      <div className="flex-1">
        {currentView === 'client' ? (
          <ClientBookingView />
        ) : (
          <AdminDashboardView />
        )}
      </div>

      {/* Minimal Clean Clinic Footer */}
      <footer className="bg-white border-t border-aura-200/70 py-4 text-center text-xs text-gray-400">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center justify-center gap-1 text-[11px]">
          <span className="text-gray-500 font-medium">
            © {new Date().getFullYear()} {clinicProfile?.clinicName || 'Aura Aesthetic Clinic'}. All rights reserved.
          </span>
          <span className="text-[10px] text-aura-700/80 font-medium tracking-wide">
            {clinicProfile?.appointmentAdvisory || 'Strictly by Scheduled Appointment'}
          </span>
        </div>
      </footer>

      {/* Global About, Services & Support Modal */}
      <AboutSupportModal
        open={aboutModalOpen}
        onClose={closeAboutModal}
        onSelectServiceForBooking={(service) => {
          setCurrentView('client');
          window.dispatchEvent(new CustomEvent('aura:select-service', { detail: service }));
        }}
      />
    </div>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b76e79', // Aura Rose Gold primary
          colorLink: '#b76e79',
          colorLinkHover: '#87424d',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#e11d48',
          borderRadius: 12,
          fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
          colorTextBase: '#2d2024',
          colorBgBase: '#ffffff'
        },
        components: {
          Button: {
            controlHeight: 40,
            borderRadius: 10,
            primaryShadow: '0 4px 14px 0 rgba(183, 110, 121, 0.25)'
          },
          Card: {
            borderRadiusLG: 16
          },
          Table: {
            headerBg: '#faf4f5',
            headerColor: '#713942',
            rowHoverBg: '#fef9fa'
          },
          Steps: {
            colorPrimary: '#b76e79',
            finishIconBorderColor: '#b76e79'
          },
          Menu: {
            itemSelectedBg: '#fbf0f2',
            itemSelectedColor: '#87424d',
            itemHoverBg: '#fdf5f6'
          }
        }
      }}
    >
      <AppProvider>
        <ErrorBoundary>
          <MainContent />
        </ErrorBoundary>
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
