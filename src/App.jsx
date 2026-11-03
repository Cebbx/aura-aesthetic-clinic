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
    isBookingActive,
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

      {/* Clinic Footer - Hidden during active booking steps to give a clean, distraction-free checkout experience */}
      {!isBookingActive ? (
        <footer className="bg-white border-t border-aura-200/80 py-7 text-center text-xs text-gray-500">
          <div className="max-w-3xl mx-auto px-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-aura-700 to-aura-400 flex items-center justify-center text-white font-serif-luxury font-bold text-[10px] shadow-xs overflow-hidden">
                {clinicProfile?.logoUrl ? (
                  <img src={clinicProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  clinicProfile?.clinicName ? clinicProfile.clinicName.trim().charAt(0).toUpperCase() : 'A'
                )}
              </div>
              <span className="font-serif-luxury font-bold text-aura-dark text-sm tracking-wider">
                {clinicProfile?.clinicName?.toUpperCase() || 'AURA AESTHETIC CLINIC'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="font-medium text-gray-600 text-xs">
                {clinicProfile?.tagline || 'Medical Concierge'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-aura-800 font-medium">
              <button
                onClick={openAboutModal}
                className="hover:text-aura-600 hover:underline transition-colors cursor-pointer"
              >
                About Clinic & Doctors
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={openAboutModal}
                className="hover:text-aura-600 hover:underline transition-colors cursor-pointer"
              >
                Services Menu & Rates
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={openAboutModal}
                className="hover:text-aura-600 hover:underline transition-colors cursor-pointer"
              >
                Concierge Support & Socials
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={openAboutModal}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                <SafetyCertificateOutlined className="text-xs" />
                <span>BIR Registered (Seal 26)</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              {clinicProfile?.address || '3F Promenade Wing, Bonifacio High Street, BGC Taguig City'} • Concierge: {clinicProfile?.phone || '(02) 8812-AURA'}
            </p>

            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-1.5">
              <span>© {new Date().getFullYear()} {clinicProfile?.clinicName || 'Aura Aesthetic Clinic'}. All rights reserved.</span>
              <span className="text-[10px] text-aura-700/80 font-medium">
                {clinicProfile?.appointmentAdvisory || 'Strictly by Scheduled Appointment'}
              </span>
            </div>
          </div>
        </footer>
      ) : (
        <div className="py-4 text-center text-[11px] text-gray-400 font-medium">
          🔒 Secure 256-Bit Encrypted Medical Concierge Booking
        </div>
      )}

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
