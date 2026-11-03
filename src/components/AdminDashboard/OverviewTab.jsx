import React, { useState } from 'react';
import { Card, Statistic, Button, Tag, Badge, Progress, Tooltip, Popconfirm, message } from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  TeamOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  StarOutlined,
  QrcodeOutlined,
  RightOutlined,
  EyeOutlined,
  BellOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import AddAppointmentModal from './AddAppointmentModal';
import CreateVoucherModal from './CreateVoucherModal';
import QRCodeModal from '../common/QRCodeModal';
import ReceiptModal from '../ClientBooking/ReceiptModal';
import CancelAppointmentModal from './CancelAppointmentModal';
import SmsNotificationModal from './SmsNotificationModal';

const OverviewTab = ({ onNavigateTab }) => {
  const {
    stats,
    appointments,
    vouchers,
    updateAppointmentStatus,
    startFreshSlate,
    resetDemoData
  } = useApp();

  const [showAddApt, setShowAddApt] = useState(false);
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedReceiptApt, setSelectedReceiptApt] = useState(null);
  const [declineModalApt, setDeclineModalApt] = useState(null);
  const [smsModalApt, setSmsModalApt] = useState(null);

  // Active view filter for the timeline: 'pending' | 'today' | 'all'
  const [timelineFilter, setTimelineFilter] = useState(() => (stats.pendingCount > 0 ? 'pending' : 'today'));

  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const pendingAppointments = appointments.filter(a => a.status === 'Pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed');

  const rawList =
    timelineFilter === 'pending'
      ? pendingAppointments
      : timelineFilter === 'today'
      ? todayAppointments
      : appointments;

  // Sort: Latest / Newest at the top
  const displayedList = [...rawList].sort((a, b) => {
    if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  const handleExportBackup = () => {
    const backupData = {
      clinic: 'Aura Aesthetic Clinic',
      backupDate: new Date().toISOString(),
      totalAppointments: appointments.length,
      appointments: appointments
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_clinic_backup_${dayjs().format('YYYY-MM-DD_HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Clinic records safely backed up to your device!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-aura-800 via-aura-700 to-aura-600 rounded-3xl p-5 sm:p-6 text-white shadow-md shadow-aura-800/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-aura-100 text-xs font-semibold backdrop-blur-xs mb-2">
            <StarOutlined />
            <span>Clinic Director Live Control Panel</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold">
            Good day, Aura Clinic Owner
          </h2>
          <p className="text-aura-100/90 text-xs sm:text-sm mt-0.5">
            Today is {dayjs().format('dddd, MMMM DD, YYYY')}. You have{' '}
            <strong className="underline text-amber-200">{stats.pendingCount} live request(s)</strong> awaiting approval and{' '}
            <strong>{todayAppointments.length} appointment(s)</strong> scheduled for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            icon={<PlusOutlined />}
            onClick={() => setShowAddApt(true)}
            className="!bg-white !text-aura-800 hover:!bg-aura-50 !border-none !rounded-xl !font-semibold !h-10 text-xs shadow-xs"
          >
            Walk-in Booking
          </Button>

          <Button
            icon={<TagOutlined />}
            onClick={() => setShowCreateVoucher(true)}
            className="!bg-aura-900/60 !text-white hover:!bg-aura-900 !border-white/20 !rounded-xl !font-semibold !h-10 text-xs"
          >
            Issue Voucher
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportBackup}
            className="!bg-white/10 !text-white hover:!bg-white/20 !border-white/20 !rounded-xl !h-10 text-xs"
          >
            Backup Records
          </Button>

          <Button
            icon={<QrcodeOutlined />}
            onClick={() => setShowQrModal(true)}
            className="!bg-white/10 !text-white hover:!bg-white/20 !border-white/20 !rounded-xl !h-10 text-xs"
          >
            QR Pass
          </Button>
        </div>
      </div>

      {/* 4 Core Clickable Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Live Booking Requests (Pending Approval) */}
        <div
          onClick={() => {
            setTimelineFilter('pending');
            onNavigateTab('appointments', { statusFilter: 'Pending' });
          }}
          className={`group bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer ${
            stats.pendingCount > 0 ? 'border-amber-300 ring-2 ring-amber-200/50' : 'border-aura-200/90'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              {stats.pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>}
              <span>Live Booking Requests</span>
              <RightOutlined className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <Statistic
                value={stats.pendingCount}
                valueStyle={{ color: stats.pendingCount > 0 ? '#b45309' : '#713942', fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif' }}
                suffix={
                  <span className="text-xs font-sans text-gray-400 font-normal ml-1">
                    pending
                  </span>
                }
              />
            </div>
            <div className="mt-2 text-[11px] font-medium flex items-center gap-1">
              {stats.pendingCount > 0 ? (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                  ₱{stats.pendingRevenue.toLocaleString()} in pipeline • Review now →
                </span>
              ) : (
                <span className="text-gray-400">0 pending requests</span>
              )}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl group-hover:scale-110 transition-all ${
            stats.pendingCount > 0 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-aura-50 text-aura-600 border-aura-200'
          }`}>
            <BellOutlined />
          </div>
        </div>

        {/* 2. Confirmed & Done Appointments */}
        <div
          onClick={() => onNavigateTab('appointments', { statusFilter: 'ALL' })}
          className="group bg-white p-5 rounded-2xl border border-aura-200/90 shadow-xs flex items-center justify-between hover:shadow-md hover:border-aura-400 hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold uppercase tracking-wider group-hover:text-aura-700 transition-colors">
              <span>Total Appointments</span>
              <RightOutlined className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <Statistic
                value={stats.totalAppointments}
                valueStyle={{ color: '#713942', fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif' }}
                suffix={
                  <span className="text-xs font-sans text-gray-400 font-normal ml-1">
                    bookings
                  </span>
                }
              />
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{stats.confirmedCount} Confirmed • {stats.completedCount} Done</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-aura-50 border border-aura-200 flex items-center justify-center text-aura-600 text-xl group-hover:scale-110 group-hover:bg-aura-600 group-hover:text-white transition-all">
            <CalendarOutlined />
          </div>
        </div>

        {/* 3. Recorded Clinic Sales / Revenue */}
        <div
          onClick={() => onNavigateTab('appointments', { statusFilter: 'Confirmed' })}
          className="group bg-white p-5 rounded-2xl border border-aura-200/90 shadow-xs flex items-center justify-between hover:shadow-md hover:border-emerald-400 hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              <span>Actual Clinic Revenue</span>
              <RightOutlined className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <Statistic
                value={stats.totalRevenue}
                prefix="₱"
                precision={0}
                valueStyle={{ color: '#27272a', fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif' }}
              />
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpOutlined />
              <span>Real total from confirmed slots</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <DollarOutlined />
          </div>
        </div>

        {/* 4. Client Database */}
        <div
          onClick={() => onNavigateTab('clients')}
          className="group bg-white p-5 rounded-2xl border border-aura-200/90 shadow-xs flex items-center justify-between hover:shadow-md hover:border-purple-400 hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold uppercase tracking-wider group-hover:text-purple-700 transition-colors">
              <span>Client Database</span>
              <RightOutlined className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <Statistic
                value={stats.totalClients}
                valueStyle={{ color: '#713942', fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif' }}
                suffix={
                  <span className="text-xs font-sans text-gray-400 font-normal ml-1">
                    profiles
                  </span>
                }
              />
            </div>
            <div className="mt-2 text-[11px] text-purple-700 font-medium">
              <span>Real guest history • Click to view</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-xl group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
            <TeamOutlined />
          </div>
        </div>
      </div>

      {/* Grid: Live Requests / Schedule Timeline & Financial Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Schedule & Live Requests Queue */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-aura-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-aura-dark">
                Appointment Schedule
              </h3>
              <p className="text-xs text-gray-500">
                Dynamically calculated queue of all customer booking submissions
              </p>
            </div>

            {/* Timeline Filter Pills */}
            <div className="flex items-center gap-1 bg-aura-50 p-1 rounded-xl border border-aura-200/70 self-start sm:self-center">
              <button
                onClick={() => setTimelineFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  timelineFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-600 hover:text-aura-800'
                }`}
              >
                <span>Requests</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  timelineFilter === 'pending' ? 'bg-white text-amber-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {pendingAppointments.length}
                </span>
              </button>

              <button
                onClick={() => setTimelineFilter('today')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  timelineFilter === 'today'
                    ? 'bg-aura-700 text-white shadow-xs'
                    : 'text-gray-600 hover:text-aura-800'
                }`}
              >
                <span>Today</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  timelineFilter === 'today' ? 'bg-white text-aura-800' : 'bg-aura-200 text-aura-900'
                }`}>
                  {todayAppointments.length}
                </span>
              </button>

              <button
                onClick={() => setTimelineFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  timelineFilter === 'all'
                    ? 'bg-aura-700 text-white shadow-xs'
                    : 'text-gray-600 hover:text-aura-800'
                }`}
              >
                <span>All ({appointments.length})</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          {displayedList.length === 0 ? (
            <div className="text-center py-12 bg-aura-50/50 rounded-2xl border border-aura-100 space-y-2">
              <CalendarOutlined className="text-3xl text-aura-300" />
              <p className="text-gray-600 text-xs font-semibold">
                {timelineFilter === 'pending'
                  ? 'No pending requests at the moment! New client bookings will appear here instantly.'
                  : timelineFilter === 'today'
                  ? 'No appointments scheduled for today.'
                  : 'No appointments recorded yet.'}
              </p>
              <Button
                size="small"
                onClick={() => setShowAddApt(true)}
                className="!border-aura-300 !text-aura-700 !rounded-xl"
              >
                + Record Walk-in Booking
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedList.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    apt.status === 'Pending'
                      ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                      : 'bg-white border-aura-200/90 hover:border-aura-300'
                  }`}
                >
                  <div
                    className="flex items-start gap-3 cursor-pointer flex-1"
                    onClick={() => setSelectedReceiptApt(apt)}
                  >
                    <div className="px-2.5 py-1.5 rounded-xl bg-white border border-aura-200 text-center shrink-0 shadow-xs">
                      <ClockCircleOutlined className="text-aura-600 block text-xs" />
                      <span className="font-bold text-[11px] text-gray-800 block">{apt.time}</span>
                      <span className="text-[9px] text-gray-400 block">{apt.date}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-aura-dark hover:text-aura-700">{apt.clientName}</span>
                        <span className="font-mono text-[10px] text-aura-700 bg-aura-50 px-1.5 py-0.5 rounded border border-aura-200">
                          {apt.id}
                        </span>
                        {renderStatusBadge(apt.status)}
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-0.5">{apt.serviceName}</p>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{apt.phone}</span>
                        <span>•</span>
                        <span className="text-aura-800 font-bold">₱{apt.finalAmount?.toLocaleString()}</span>
                        {apt.voucherUsed && (
                          <Tag color="cyan" className="!text-[10px] !mr-0">Voucher: {apt.voucherUsed}</Tag>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <Tooltip title="View Official Slip">
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setSelectedReceiptApt(apt)}
                        className="text-xs !rounded-lg !border-aura-200"
                      />
                    </Tooltip>

                    {apt.status === 'Pending' && (
                      <>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'Confirmed');
                            message.success(`Approved request for ${apt.clientName}! Client notification ready.`);
                            setSmsModalApt({ ...apt, status: 'Confirmed' });
                          }}
                          className="!bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => setDeclineModalApt(apt)}
                          className="!rounded-lg text-xs"
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {apt.status === 'Confirmed' && (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          updateAppointmentStatus(apt.id, 'Completed');
                          message.success(`Completed appointment for ${apt.clientName}!`);
                        }}
                        className="!bg-emerald-600 !border-none !rounded-lg text-xs"
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Revenue Breakdown & Financial Overview */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real Financial Breakdown Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-aura-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-base font-bold text-aura-dark">
                  Revenue Breakdown
                </h3>
                <p className="text-xs text-gray-500">Live transaction pipeline</p>
              </div>
              <Tag color="green" className="!mr-0 font-bold text-xs">Live Synced</Tag>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                    Confirmed & Done Revenue
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">
                    {stats.confirmedCount + stats.completedCount} approved bookings
                  </span>
                </div>
                <div className="font-serif-luxury font-bold text-lg text-emerald-900">
                  ₱{stats.totalRevenue.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div>
                  <span className="text-[10px] text-amber-800 uppercase font-bold block">
                    Pending Requests Pipeline
                  </span>
                  <span className="text-xs text-amber-700 font-medium">
                    {stats.pendingCount} bookings awaiting approval
                  </span>
                </div>
                <div className="font-serif-luxury font-bold text-lg text-amber-900">
                  ₱{stats.pendingRevenue.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-aura-50/70 border border-aura-200">
                <div>
                  <span className="text-[10px] text-aura-800 uppercase font-bold block">
                    Total Gross Booking Value
                  </span>
                  <span className="text-xs text-aura-600 font-medium">
                    Combined total potential sales
                  </span>
                </div>
                <div className="font-serif-luxury font-bold text-lg text-aura-900">
                  ₱{stats.totalGrossBookingValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Voucher Status Summary */}
          <div className="bg-white p-5 rounded-2xl border border-aura-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-sm font-bold text-aura-dark">
                Voucher Tracker ({stats.totalVouchersSold} issued)
              </h3>
              <Button
                type="link"
                onClick={() => onNavigateTab('vouchers')}
                className="!text-aura-700 text-xs font-semibold !p-0"
              >
                View all →
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div
                onClick={() => onNavigateTab('vouchers', { statusFilter: 'Redeemed' })}
                className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 transition-all cursor-pointer"
              >
                <span className="text-gray-500 text-[10px] uppercase font-semibold block">Redeemed</span>
                <span className="font-bold text-emerald-800 text-lg">
                  {stats.redeemedVouchersCount}
                </span>
                <p className="text-[10px] text-emerald-600">Discounts claimed</p>
              </div>

              <div
                onClick={() => onNavigateTab('vouchers', { statusFilter: 'Unredeemed' })}
                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100/70 transition-all cursor-pointer"
              >
                <span className="text-gray-500 text-[10px] uppercase font-semibold block">Unredeemed</span>
                <span className="font-bold text-amber-800 text-lg">
                  {stats.activeUnredeemedVouchers}
                </span>
                <p className="text-[10px] text-amber-600">Active vouchers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAppointmentModal
        open={showAddApt}
        onClose={() => setShowAddApt(false)}
      />
      <CreateVoucherModal
        open={showCreateVoucher}
        onClose={() => setShowCreateVoucher(false)}
      />
      <QRCodeModal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
      <ReceiptModal
        open={!!selectedReceiptApt}
        onClose={() => setSelectedReceiptApt(null)}
        appointment={selectedReceiptApt}
      />
      <CancelAppointmentModal
        open={!!declineModalApt}
        onClose={() => setDeclineModalApt(null)}
        appointment={declineModalApt}
      />
      <SmsNotificationModal
        open={!!smsModalApt}
        onClose={() => setSmsModalApt(null)}
        appointment={smsModalApt}
      />
    </div>
  );
};

// Helper status badge
const renderStatusBadge = (status) => {
  switch (status) {
    case 'Confirmed':
      return <Tag color="green" className="!rounded-md !text-[10px] font-semibold">Approved</Tag>;
    case 'Completed':
      return <Tag color="default" className="!rounded-md !text-[10px]">Done</Tag>;
    case 'Cancelled':
      return <Tag color="red" className="!rounded-md !text-[10px]">Cancelled</Tag>;
    default:
      return <Tag color="gold" className="!rounded-md !text-[10px] font-bold">Pending</Tag>;
  }
};

export default OverviewTab;
