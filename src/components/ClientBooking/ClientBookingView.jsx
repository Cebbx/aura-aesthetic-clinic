import React, { useState, useEffect } from 'react';
import { Steps } from 'antd';
import {
  AppstoreOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  HeartOutlined,
  InfoCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import Step1SelectService from './Step1SelectService';
import Step2SelectSchedule from './Step2SelectSchedule';
import Step3ClientInfo from './Step3ClientInfo';
import BookingSuccess from './BookingSuccess';

const ClientBookingView = () => {
  const { openAboutModal } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  // Booking draft state - Supports single or multiple treatments
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(null);
  const [completedBooking, setCompletedBooking] = useState(null);

  // Fallback single selected service for backwards compatibility
  const selectedService = selectedServices[0] || null;

  // Toggle service selection in array
  const handleToggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // Remove single service
  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  // Listen for direct treatment selection from About & Services modal
  useEffect(() => {
    const handleSelectServiceEvent = (e) => {
      if (e.detail) {
        setSelectedServices([e.detail]);
        setCurrentStep(1);
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    };
    window.addEventListener('aura:select-service', handleSelectServiceEvent);
    return () => window.removeEventListener('aura:select-service', handleSelectServiceEvent);
  }, []);

  // Reset to book again
  const handleReset = () => {
    setCurrentStep(0);
    setSelectedServices([]);
    setSelectedDate(dayjs());
    setSelectedTime(null);
    setCompletedBooking(null);
  };

  const stepsItems = [
    {
      title: 'Service',
      description: 'Choose treatment',
      icon: <AppstoreOutlined />
    },
    {
      title: 'Schedule',
      description: 'Pick date & slot',
      icon: <CalendarOutlined />
    },
    {
      title: 'Confirm',
      description: 'Client info & voucher',
      icon: <UserOutlined />
    }
  ];

  return (
    <div className="min-h-screen bg-aura-50/50 pb-28 sm:pb-20">
      {/* Clinic Hero / Header Banner - Only displayed on Step 0 (Services catalog). Hidden on Schedule and Client Info steps for a clean, distraction-free app experience */}
      {currentStep === 0 && !completedBooking && (
        <section className="bg-gradient-to-b from-white via-aura-50/60 to-aura-50/20 border-b border-aura-200/80 pt-6 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-aura-100 border border-aura-200 text-aura-800 text-[11px] sm:text-xs font-semibold shadow-xs">
              <StarOutlined className="text-aura-600" />
              <span>Aura Aesthetic & Wellness</span>
              <div className="w-1 h-1 rounded-full bg-aura-500"></div>
              <span className="flex items-center gap-0.5 text-amber-500">
                <StarFilled className="text-[10px]" /> 4.9 (1.2k+ Reviews)
              </span>
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-bold text-aura-dark tracking-tight leading-snug">
              Embrace Your Natural Radiance
            </h1>

            <p className="text-xs sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Medical-grade facials, body contouring, nail detox, and laser aesthetics. Book in three effortless steps.
            </p>

            {/* Clinic Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1 text-[11px] sm:text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <SafetyCertificateOutlined className="text-emerald-600" />
                <span>Certified Aestheticians</span>
              </span>
              <span className="flex items-center gap-1">
                <StarOutlined className="text-aura-600" />
                <span>100% Sterile Kits</span>
              </span>
              <span className="flex items-center gap-1">
                <HeartOutlined className="text-rose-500" />
                <span>Zero Pre-payment</span>
              </span>
            </div>

            {/* About Clinic & Services Explorer Pill Button */}
            <div className="pt-1">
              <button
                onClick={openAboutModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-aura-50 border border-aura-300 text-aura-800 text-xs font-semibold shadow-xs hover:shadow-sm transition-all group cursor-pointer"
              >
                <InfoCircleOutlined className="text-aura-600" />
                <span>Explore Doctor Credentials, Full Menu & Support</span>
                <RightOutlined className="text-[10px] text-aura-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Container */}
      <main className={`max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 ${currentStep === 0 ? '-mt-2 sm:-mt-4' : 'pt-3 sm:pt-6'}`}>
        {/* If Completed, show Success screen directly */}
        {completedBooking ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-aura-200 p-4 sm:p-10 shadow-lg shadow-aura-200/50">
            <BookingSuccess
              appointment={completedBooking}
              onReset={handleReset}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-aura-200/90 p-4 sm:p-8 shadow-sm">
            {/* Desktop Ant Design Steps */}
            <div className="hidden sm:block mb-8 max-w-3xl mx-auto px-2">
              <Steps
                current={currentStep}
                items={stepsItems}
                responsive={true}
                className="aura-steps"
              />
            </div>

            {/* Mobile Visual Progress Indicator */}
            <div className="sm:hidden mb-6 bg-aura-50/80 p-3 rounded-xl border border-aura-200/70">
              <div className="flex items-center justify-between text-xs font-bold text-aura-900 mb-1.5">
                <span>Step {currentStep + 1} of 3: {stepsItems[currentStep].title}</span>
                <span className="text-aura-600 font-semibold">{Math.round(((currentStep + 1) / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-aura-200/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-aura-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step 1: Select Service (Multi-Service Supported) */}
            {currentStep === 0 && (
              <Step1SelectService
                selectedServices={selectedServices}
                selectedService={selectedService}
                onToggleService={handleToggleService}
                onSelectService={(service) => setSelectedServices([service])}
                onNext={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep(1);
                }}
              />
            )}

            {/* Step 2: Select Schedule */}
            {currentStep === 1 && (
              <Step2SelectSchedule
                selectedDate={selectedDate}
                onSelectDate={(date) => setSelectedDate(date)}
                selectedTime={selectedTime}
                onSelectTime={(time) => setSelectedTime(time)}
                selectedServices={selectedServices}
                selectedService={selectedService}
                onBack={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep(0);
                }}
                onNext={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep(2);
                }}
              />
            )}

            {/* Step 3: Client Info & Voucher */}
            {currentStep === 2 && (
              <Step3ClientInfo
                selectedServices={selectedServices}
                selectedService={selectedService}
                onRemoveService={handleRemoveService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBack={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep(1);
                }}
                onBookingComplete={(newApt) => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCompletedBooking(newApt);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientBookingView;
