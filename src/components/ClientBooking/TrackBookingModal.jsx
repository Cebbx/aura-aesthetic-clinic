import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Tag, Divider, Empty, Alert, Select, message } from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  PrinterOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CloseCircleOutlined,
  HourglassFilled,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  StarFilled,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import ReceiptModal from './ReceiptModal';
import RateProcedureModal from './RateProcedureModal';
import EditAppointmentModal from '../AdminDashboard/EditAppointmentModal';

const { Option } = Select;
const { TextArea } = Input;

const CLIENT_CANCEL_REASONS = [
  'Schedule Conflict or Work Commitment',
  'Personal or Family Emergency',
  'Health or Feeling Unwell',
  'Financial or Budget Consideration',
  'Booked Wrong Service or Date',
  'Other Reason'
];

const TrackBookingModal = ({ open, onClose }) => {
  const { appointments, googleUser, cancelAppointmentByClient, clinicProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [receiptApt, setReceiptApt] = useState(null);
  const [rateModalApt, setRateModalApt] = useState(null);
  const [editModalApt, setEditModalApt] = useState(null);
  
  // Client cancellation state
  const [cancelTargetApt, setCancelTargetApt] = useState(null);
  const [cancelReason, setCancelReason] = useState(CLIENT_CANCEL_REASONS[0]);
  const [cancelRemarks, setCancelRemarks] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Auto-search remembered phone or Google email when modal opens
  useEffect(() => {
    if (open && !hasSearched) {
      try {
        const savedPhone = localStorage.getItem('aura_client_phone');
        const userEmail = googleUser?.email;
        if (savedPhone) {
          setSearchQuery(savedPhone);
          setHasSearched(true);
        } else if (userEmail) {
          setSearchQuery(userEmail);
          setHasSearched(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [open, googleUser, hasSearched]);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const matchingAppointments = hasSearched && cleanQuery
    ? appointments.filter(a => {
        const idMatch = a.id?.toLowerCase().includes(cleanQuery);
        const phoneMatch = a.phone?.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, ''));
        const nameMatch = a.clientName?.toLowerCase().includes(cleanQuery);
        const emailMatch = a.email?.toLowerCase().includes(cleanQuery);
        return idMatch || phoneMatch || nameMatch || emailMatch;
      })
    : [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
  };

  const handleConfirmClientCancel = () => {
    if (!cancelTargetApt) return;
    setCancelling(true);

    setTimeout(() => {
      cancelAppointmentByClient(cancelTargetApt.id, cancelReason, cancelRemarks);
      setCancelling(false);
      message.success(`Your appointment ${cancelTargetApt.id} has been cancelled.`);
      setCancelTargetApt(null);
      setCancelRemarks('');
    }, 400);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          onClose();
          resetSearch();
        }}
        title={
          <div className="flex items-center gap-2 font-serif-luxury text-lg text-aura-dark">
            <CalendarOutlined className="text-aura-700" />
            <span>Track Appointment</span>
          </div>
        }
        footer={null}
        centered
        width="95%"
        style={{ maxWidth: 540 }}
        className="aura-track-modal"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-gray-500 leading-relaxed">
            Enter your <strong>Booking Reference ID</strong>, <strong>Phone Number</strong>, or <strong>Email</strong> to view your live appointment status, print your slip, or cancel if needed.
          </p>

          {/* Search Box */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g. AURA-202611-1 or 0917-882-9912"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (hasSearched) setHasSearched(false);
              }}
              onKeyDown={handleKeyDown}
              allowClear
              className="!rounded-xl !py-2 text-xs"
            />
            <Button
              type="primary"
              onClick={handleSearch}
              className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold !px-4"
            >
              Search
            </Button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-3 pt-2">
              {matchingAppointments.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center space-y-2">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span className="text-xs text-gray-500">
                        No appointment found for "<strong>{searchQuery}</strong>".
                      </span>
                    }
                  />
                  <p className="text-[11px] text-gray-400">
                    Please verify your reference number or contact our reception at <strong>(02) 8812-AURA</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-gray-500 font-semibold flex items-center justify-between">
                    <span>Found {matchingAppointments.length} appointment(s):</span>
                    {localStorage.getItem('aura_client_phone') && (
                      <span className="text-[10px] text-aura-600 font-normal">Auto-detected from your device</span>
                    )}
                  </div>

                  {matchingAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="bg-white p-4 rounded-2xl border border-aura-200 shadow-xs space-y-3 transition-all"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-aura-100 pb-2.5">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                            Reference No.
                          </span>
                          <span className="font-mono font-bold text-sm text-aura-800">
                            {apt.id}
                          </span>
                        </div>

                        <div>
                          {apt.status === 'Confirmed' && (
                            <Tag color="green" className="!rounded-full px-2.5 py-0.5 font-semibold text-xs flex items-center gap-1">
                              <CheckCircleFilled /> Confirmed
                            </Tag>
                          )}
                          {apt.status === 'Pending' && (
                            <Tag color="gold" className="!rounded-full px-2.5 py-0.5 font-semibold text-xs flex items-center gap-1">
                              <HourglassFilled /> Pending Approval
                            </Tag>
                          )}
                          {apt.status === 'Completed' && (
                            <Tag color="blue" className="!rounded-full px-2.5 py-0.5 font-semibold text-xs flex items-center gap-1">
                              <CheckCircleFilled /> Completed
                            </Tag>
                          )}
                          {apt.status === 'Cancelled' && (
                            <Tag color="red" className="!rounded-full px-2.5 py-0.5 font-semibold text-xs flex items-center gap-1">
                              <CloseCircleFilled /> Cancelled
                            </Tag>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs">
                        <div className="font-bold text-sm text-gray-900">
                          {apt.serviceName}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-gray-600 text-xs pt-1">
                          <div className="flex items-center gap-1.5">
                            <CalendarOutlined className="text-aura-600" />
                            <span>{apt.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ClockCircleOutlined className="text-aura-600" />
                            <span>{apt.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserOutlined className="text-aura-600" />
                            <span className="truncate">{apt.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <PhoneOutlined className="text-aura-600" />
                            <span>{apt.phone}</span>
                          </div>
                        </div>

                        {apt.email && (
                          <div className="text-[11px] text-gray-500 pt-0.5">
                            Email: <span className="font-medium text-gray-700">{apt.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Advice Box & Upcoming Reminders */}
                      {apt.status === 'Pending' && (
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                          Your appointment request is safely received. Front desk will review and send confirmation shortly.
                        </div>
                      )}

                      {apt.status === 'Confirmed' && apt.date === dayjs().format('YYYY-MM-DD') && (
                        <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300 text-amber-950 text-xs font-medium space-y-1 shadow-xs">
                          <div className="font-bold flex items-center justify-between text-amber-900">
                            <span className="flex items-center gap-1.5">
                              <BellOutlined className="text-amber-600 animate-bounce" />
                              <span>Upcoming Reminder: Your appointment is TODAY at {apt.time}!</span>
                            </span>
                            <span className="text-[10px] bg-amber-200/90 px-2 py-0.5 rounded-full font-bold">Today</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Our clinic staff is preparing your treatment suite. Please arrive 10-15 minutes prior at {clinicProfile?.address || '3F Promenade, BGC Taguig'}.
                          </p>
                        </div>
                      )}

                      {apt.status === 'Confirmed' && apt.date === dayjs().add(1, 'day').format('YYYY-MM-DD') && (
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
                          <div className="font-bold flex items-center justify-between text-amber-800">
                            <span className="flex items-center gap-1.5">
                              <CalendarOutlined className="text-amber-600" />
                              <span>Reminder: Your appointment is TOMORROW at {apt.time}!</span>
                            </span>
                            <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full font-bold">Tomorrow</span>
                          </div>
                          <p className="text-[11px] text-amber-700">
                            Looking forward to pampering you! Please contact concierge if you need any adjustments.
                          </p>
                        </div>
                      )}

                      {apt.status === 'Confirmed' && apt.date !== dayjs().format('YYYY-MM-DD') && apt.date !== dayjs().add(1, 'day').format('YYYY-MM-DD') && (
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                          Your schedule is officially <strong>Confirmed</strong>! Location: <strong>{clinicProfile?.address || '3F Promenade, BGC Taguig'}</strong>.
                        </div>
                      )}

                      {apt.status === 'Cancelled' && (
                        <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                          <strong>Cancellation Details:</strong> {apt.cancellationReason || apt.cancelReason || 'Cancelled upon request.'}
                        </div>
                      )}

                      {apt.status === 'Completed' && (
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                              <StarFilled className="text-amber-500" />
                              <span>Session Completed! How was your procedure?</span>
                            </div>
                            {apt.isReviewed && (
                              <Tag color="green" className="!mr-0 text-[10px] font-semibold">
                                ✓ Reviewed
                              </Tag>
                            )}
                          </div>

                          {apt.isReviewed ? (
                            <div className="bg-white/80 p-2.5 rounded-xl text-xs text-gray-700 space-y-0.5">
                              <div className="text-[11px] font-bold text-amber-800">
                                ⭐ Your Rating: {apt.reviewData?.rating} out of 5 stars
                              </div>
                              <p className="text-[11px] text-gray-600 italic">
                                "{apt.reviewData?.comment}"
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                              <p className="text-[11px] text-amber-800 leading-tight">
                                Rate your specialist and help other patients by sharing your treatment experience.
                              </p>
                              <Button
                                size="small"
                                type="primary"
                                icon={<StarFilled />}
                                onClick={() => setRateModalApt(apt)}
                                className="!bg-amber-600 hover:!bg-amber-700 !border-none !rounded-xl text-xs font-semibold !h-7 px-3 shrink-0"
                              >
                                Rate Procedure
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons: View Slip & Cancel Request */}
                      <div className="pt-2 border-t border-aura-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                            <>
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => setEditModalApt(apt)}
                                className="!rounded-xl text-xs !border-aura-400 !text-aura-800 hover:!bg-aura-50 font-medium"
                              >
                                Edit Services & Schedule
                              </Button>

                              <Button
                                size="small"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                  setCancelTargetApt(apt);
                                  setCancelReason(CLIENT_CANCEL_REASONS[0]);
                                  setCancelRemarks('');
                                }}
                                className="!rounded-xl text-xs hover:!bg-rose-50 font-medium"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {apt.status === 'Confirmed' && (
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(apt.serviceName + ' • ' + (clinicProfile?.clinicName || 'Aura Clinic'))}&dates=${apt.date ? apt.date.replace(/-/g, '') : ''}/${apt.date ? apt.date.replace(/-/g, '') : ''}&details=${encodeURIComponent('Appointment Ref: ' + apt.id + '\nProcedure: ' + apt.serviceName + '\nLocation: ' + (clinicProfile?.address || 'BGC Taguig') + '\nConcierge: ' + (clinicProfile?.phone || '(02) 8812-AURA'))}&location=${encodeURIComponent(clinicProfile?.address || 'Bonifacio High Street, Taguig City')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <CalendarOutlined />
                              <span>Add to Calendar</span>
                            </a>
                          )}

                          <Button
                            size="small"
                            icon={<PrinterOutlined />}
                            onClick={() => setReceiptApt(apt)}
                            className="!rounded-xl text-xs !border-aura-300 !text-aura-800 hover:!border-aura-600 font-medium"
                          >
                            View Official Slip
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-aura-50/60 p-3 rounded-xl border border-aura-200/80 text-[11px] text-gray-500 flex items-start gap-2">
            <EnvironmentOutlined className="text-aura-600 mt-0.5" />
            <div>
              <strong>Aura Aesthetic Clinic Front Desk:</strong> 3F Promenade Wing, Bonifacio High Street, BGC Taguig • Concierge: <strong>(02) 8812-AURA</strong>
            </div>
          </div>
        </div>
      </Modal>

      {/* Official Printable Slip Modal */}
      <ReceiptModal
        open={!!receiptApt}
        onClose={() => setReceiptApt(null)}
        appointment={receiptApt}
      />

      {/* Client Cancellation Modal */}
      <Modal
        open={!!cancelTargetApt}
        onCancel={() => {
          setCancelTargetApt(null);
          setCancelReason(CLIENT_CANCEL_REASONS[0]);
          setCancelRemarks('');
        }}
        title={
          <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-lg text-aura-dark">
            <CloseCircleOutlined className="text-rose-600" />
            <span>Cancel Appointment Request</span>
          </div>
        }
        footer={null}
        centered
        width="92%"
        style={{ maxWidth: 440 }}
      >
        <div className="space-y-3.5 pt-1">
          {cancelTargetApt && (
            <div className="p-3 bg-aura-50/80 rounded-xl border border-aura-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-aura-800">{cancelTargetApt.id}</span>
                <span className="text-[10px] text-gray-500">{cancelTargetApt.date} • {cancelTargetApt.time}</span>
              </div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">{cancelTargetApt.serviceName}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Client: {cancelTargetApt.clientName}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason for Cancellation *
            </label>
            <Select
              value={cancelReason}
              onChange={setCancelReason}
              className="w-full !rounded-xl"
              size="large"
            >
              {CLIENT_CANCEL_REASONS.map(r => (
                <Option key={r} value={r}>{r}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Additional Note for Clinic (Optional)
            </label>
            <TextArea
              rows={3}
              placeholder="e.g., Need to reschedule next month, urgent family matter..."
              value={cancelRemarks}
              onChange={(e) => setCancelRemarks(e.target.value)}
              className="!rounded-xl text-xs"
            />
          </div>

          <Alert
            message="Notice: Cancelling this booking will release your reserved slot back to the clinic calendar. You may book another treatment anytime."
            type="warning"
            showIcon
            className="!rounded-xl text-[11px]"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              onClick={() => setCancelTargetApt(null)}
              className="!rounded-xl text-xs !h-9"
            >
              Keep My Booking
            </Button>
            <Button
              type="primary"
              danger
              loading={cancelling}
              onClick={handleConfirmClientCancel}
              className="!rounded-xl text-xs !h-9 font-semibold"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Appointment & Services Modal */}
      <EditAppointmentModal
        open={Boolean(editModalApt)}
        onClose={() => setEditModalApt(null)}
        appointment={editModalApt}
      />

      {/* Patient Rate Procedure Modal */}
      <RateProcedureModal
        open={!!rateModalApt}
        onClose={() => setRateModalApt(null)}
        appointment={rateModalApt}
      />
    </>
  );
};

export default TrackBookingModal;
