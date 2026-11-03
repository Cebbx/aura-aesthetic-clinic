import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Tag, Typography, Divider } from 'antd';
import {
  ClockCircleOutlined,
  PrinterOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import ReceiptModal from './ReceiptModal';
import TrackBookingModal from './TrackBookingModal';

const BookingSuccess = ({ appointment, onReset }) => {
  const { clinicProfile } = useApp();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b76e79', '#ecc4cb', '#c5a059', '#ffffff']
      });
    } catch (e) {
      // safe fallback if canvas is restricted
    }
  }, []);

  if (!appointment) return null;

  return (
    <>
      <div className="max-w-2xl mx-auto py-2 sm:py-4">
        <Result
          icon={
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-600 text-3xl sm:text-4xl shadow-md">
              <ClockCircleOutlined className="animate-pulse" />
            </div>
          }
          title={
            <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-aura-dark block mt-2">
              Booking Request Received!
            </span>
          }
          subTitle={
            <div className="space-y-1.5 mt-2">
              <p className="text-gray-600 text-xs sm:text-sm">
                Thank you, <strong className="text-aura-800">{appointment.clientName}</strong>. Your requested slot is safely received by our front desk.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <BellOutlined />
                <span>Status: {appointment.status === 'Confirmed' ? 'Confirmed' : 'Pending Approval'}</span>
              </div>
            </div>
          }
          extra={
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full pt-2 flex-wrap">
              <Button
                key="receipt"
                type="primary"
                size="large"
                icon={<PrinterOutlined />}
                onClick={() => setShowReceiptModal(true)}
                className="w-full sm:w-auto !bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white !font-semibold shadow-md shadow-aura-700/20 !h-11 text-xs sm:text-sm"
              >
                View Official Slip & QR
              </Button>
              <a
                key="calendar"
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointment.serviceName + ' • ' + (clinicProfile?.clinicName || 'Aura Clinic'))}&dates=${appointment.date ? appointment.date.replace(/-/g, '') : ''}/${appointment.date ? appointment.date.replace(/-/g, '') : ''}&details=${encodeURIComponent('Appointment Ref: ' + appointment.id + '\nProcedure: ' + appointment.serviceName + '\nLocation: ' + (clinicProfile?.address || 'BGC Taguig') + '\nConcierge: ' + (clinicProfile?.phone || '(02) 8812-AURA'))}&location=${encodeURIComponent(clinicProfile?.address || 'Bonifacio High Street, Taguig City')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 rounded-xl border border-blue-300 text-blue-700 bg-blue-50/80 hover:bg-blue-100 !h-11 text-xs sm:text-sm font-semibold transition-colors"
              >
                <CalendarOutlined />
                <span>Add to Google Calendar</span>
              </a>
              <Button
                key="book-another"
                size="large"
                icon={<CalendarOutlined />}
                onClick={onReset}
                className="w-full sm:w-auto !rounded-xl !border-aura-300 !text-aura-800 hover:!border-aura-600 !h-11 text-xs sm:text-sm"
              >
                Book Another Treatment
              </Button>
            </div>
          }
        >
          {/* Booking Summary Box */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-aura-200/90 shadow-sm text-left space-y-4">
            <div className="flex items-center justify-between border-b border-aura-100 pb-3">
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold block">
                  Booking Reference ID
                </span>
                <span className="text-[10px] text-aura-600 font-medium">
                  Official Record
                </span>
              </div>
              <span className="font-mono font-bold text-sm sm:text-base text-aura-700 bg-aura-50 px-3 py-1 rounded-lg border border-aura-200">
                {appointment.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <span className="text-gray-400">
                  {Array.isArray(appointment.services) && appointment.services.length > 1 ? `Booked Treatments (${appointment.services.length}):` : 'Treatment:'}
                </span>
                
                {Array.isArray(appointment.services) && appointment.services.length > 1 ? (
                  <div className="flex flex-col gap-1.5 pt-1">
                    {appointment.services.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-aura-50/70 border border-aura-200/80 text-aura-900 text-xs px-3 py-1.5 rounded-xl font-medium"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-aura-600 font-bold">✓</span>
                          <span className="font-semibold text-gray-800">{s.name}</span>
                        </span>
                        <span className="font-mono text-aura-700 font-bold ml-2">₱{Number(s.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{appointment.serviceName}</p>
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-gray-400">Requested Schedule:</span>
                <p className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <CalendarOutlined className="text-aura-600" />
                  <span>{appointment.date} • {appointment.time}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-gray-400">Client Name:</span>
                <p className="font-semibold text-gray-800 flex items-center gap-1">
                  <UserOutlined className="text-gray-400" />
                  <span>{appointment.clientName}</span>
                </p>
              </div>

              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-gray-400">Contact Number:</span>
                <p className="font-mono font-semibold text-gray-800">{appointment.phone}</p>
              </div>
            </div>

            <Divider className="!my-2 border-aura-100" />

            {/* Total Due */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-gray-700">Total Due at Clinic:</span>
              <span className="font-serif-luxury font-bold text-lg text-aura-700">
                ₱{(appointment.finalAmount != null ? appointment.finalAmount : appointment.totalPrice).toLocaleString()}
              </span>
            </div>

            {/* Next Steps Card */}
            <div className="p-3 rounded-xl bg-aura-50/70 border border-aura-200 text-xs space-y-1.5">
              <span className="font-bold text-aura-900 block flex items-center gap-1">
                <SafetyCertificateOutlined className="text-aura-600" />
                <span>What happens next?</span>
              </span>
              <ul className="text-gray-600 text-[11px] space-y-1 list-disc list-inside">
                <li>Our aesthetic receptionist will verify room and therapist availability.</li>
                <li>You will receive an official approval SMS / call / email to confirm your session.</li>
                <li>No pre-payment needed — simply present your Reference ID upon arrival.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-aura-100 flex items-start gap-2 text-xs text-gray-500">
              <EnvironmentOutlined className="text-aura-600 mt-0.5 text-sm shrink-0" />
              <div>
                <strong>Aura Aesthetic Clinic BGC</strong>
                <p className="text-[11px] text-gray-400">3rd Floor, Promenade Wing, Bonifacio High Street, Taguig City</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <button
              onClick={() => setShowTrackModal(true)}
              className="text-xs text-aura-700 hover:text-aura-900 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <SearchOutlined />
              <span>Track this booking status anytime with your Reference ID</span>
            </button>
          </div>
        </Result>
      </div>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        open={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        appointment={appointment}
      />

      {/* Track Booking Modal */}
      <TrackBookingModal
        open={showTrackModal}
        onClose={() => setShowTrackModal(false)}
      />
    </>
  );
};

export default BookingSuccess;
