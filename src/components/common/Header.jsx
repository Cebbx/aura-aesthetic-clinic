import React, { useState, useEffect } from 'react';
import { Button, Tooltip, message, Popover, Badge, Dropdown } from 'antd';
import {
  QrcodeOutlined,
  CalendarOutlined,
  LockOutlined,
  UnlockOutlined,
  BellOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  CrownOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import QRCodeModal from './QRCodeModal';
import AdminAuthModal from './AdminAuthModal';
import ReceiptModal from '../ClientBooking/ReceiptModal';
import TrackBookingModal from '../ClientBooking/TrackBookingModal';
import SmsNotificationModal from '../AdminDashboard/SmsNotificationModal';
import InstallAppModal from './InstallAppModal';
import BrandQuickMenuModal from './BrandQuickMenuModal';
import ClientVouchersModal from '../ClientBooking/ClientVouchersModal';

const Header = () => {
  const {
    currentView,
    setCurrentView,
    stats,
    appointments,
    isAdminAuthenticated,
    logoutAdmin,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    updateAppointmentStatus,
    clinicProfile,
    openAboutModal,
    isStandalone
  } = useApp();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const [vouchersModalVisible, setVouchersModalVisible] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedAptDetails, setSelectedAptDetails] = useState(null);
  const [reminderModalApt, setReminderModalApt] = useState(null);

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setAuthModalVisible(true);
    }
  };

  useEffect(() => {
    const handleOpenAdminAuth = () => {
      handleAdminClick();
    };
    window.addEventListener('aura:open-admin-auth', handleOpenAdminAuth);
    return () => window.removeEventListener('aura:open-admin-auth', handleOpenAdminAuth);
  }, [isAdminAuthenticated, setCurrentView]);

  const mobileAdminMenuItems = [
    ...(!isStandalone ? [{
      key: 'install',
      icon: <MobileOutlined className="text-aura-600" />,
      label: 'Install Mobile App',
      onClick: () => setInstallModalVisible(true)
    }] : []),
    {
      key: 'qr',
      icon: <QrcodeOutlined className="text-aura-600" />,
      label: 'Reception QR Pass',
      onClick: () => setQrModalVisible(true)
    },
    {
      key: 'lock',
      icon: <LockOutlined className="text-rose-500" />,
      label: 'Lock Admin Portal',
      onClick: logoutAdmin,
      danger: true
    }
  ];

  const unreadNotifs = notifications.filter(n => !n.read);

  // Notification Popover Content for Admin
  const notifContent = (
    <div className="w-72 sm:w-80 max-h-96 overflow-y-auto space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <span className="font-bold text-xs text-gray-800">
          Booking Notifications ({unreadNotifs.length} new)
        </span>
        {unreadNotifs.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-[11px] text-aura-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-400">
          No notifications yet.
        </div>
      ) : (
        notifications.slice(0, 6).map(n => {
          const targetApt = (appointments || []).find(a => a.id === n.appointmentId);

          return (
            <div
              key={n.id}
              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                n.read ? 'bg-gray-50/60 border-gray-200/60' : 'bg-aura-50 border-aura-200'
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  if (targetApt) {
                    setSelectedAptDetails(targetApt);
                    setNotifOpen(false);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-bold text-gray-800 text-xs hover:text-aura-700">{n.title}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5">{n.desc}</p>
                {targetApt?.phone && (
                  <div className="text-[10px] text-aura-600 font-medium mt-0.5">
                    📞 {targetApt.phone}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-aura-100/80">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    if (targetApt) {
                      setSelectedAptDetails(targetApt);
                      setNotifOpen(false);
                    } else {
                      message.info('Appointment details not found.');
                    }
                  }}
                  className="!rounded-lg text-[10px] !h-6 !border-aura-300 !text-aura-700 hover:!border-aura-500 font-medium"
                >
                  View Slip
                </Button>

                {n.isReminder ? (
                  <Button
                    size="small"
                    type="primary"
                    icon={<BellOutlined />}
                    onClick={() => {
                      if (targetApt) {
                        setReminderModalApt(targetApt);
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                      }
                    }}
                    className="!bg-amber-600 hover:!bg-amber-700 !border-none !rounded-lg text-[10px] !h-6 font-semibold"
                  >
                    Send Reminder
                  </Button>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      updateAppointmentStatus(n.appointmentId, 'Confirmed');
                      markNotificationRead(n.id);
                      message.success(`Confirmed appointment ${n.appointmentId}!`);
                    }}
                    className="!bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-lg text-[10px] !h-6 font-semibold"
                  >
                    Approve
                  </Button>
                )}

                <Button
                  size="small"
                  onClick={() => markNotificationRead(n.id)}
                  className="!rounded-lg text-[10px] !h-6 text-gray-500"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-aura-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-1 sm:gap-3">
            {/* Logo and Clinic Branding with Interactive Theme & Quick Hub */}
            <div 
              className="flex items-center gap-1.5 sm:gap-3 cursor-pointer select-none shrink-0 group"
              onClick={() => setBrandMenuVisible(true)}
              title="Click to customize Theme or open Clinic Quick Hub"
            >
              <div className="relative w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-aura-700 via-aura-500 to-aura-300 flex items-center justify-center text-white shadow-xs overflow-hidden group-hover:scale-105 transition-transform duration-300">
                {clinicProfile?.logoUrl ? (
                  <img src={clinicProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs sm:text-xl font-serif-luxury tracking-widest font-bold">
                    {clinicProfile?.clinicName ? clinicProfile.clinicName.trim().charAt(0).toUpperCase() : 'A'}
                  </span>
                )}
                {/* Subtle sparkle indicator badge */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-tl-md flex items-center justify-center text-[6px] text-black">
                  ✨
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-serif-luxury text-xs sm:text-2xl font-bold tracking-tight text-aura-dark whitespace-nowrap group-hover:text-aura-700 transition-colors">
                    <span className="sm:hidden">Aura</span>
                    <span className="hidden sm:inline">{clinicProfile?.clinicName || 'Aura Aesthetic Clinic'}</span>
                  </span>
                  <span className="text-[10px] text-aura-400 group-hover:text-aura-700 transition-colors">
                    ▾
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-aura-700/80 tracking-wide hidden md:block">
                  {clinicProfile?.tagline || 'Skin • Slimming • Precision Care • Wellness'}
                </p>
              </div>
            </div>

            {/* Context Actions / Staff Indicator */}
            {currentView === 'admin' && (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-aura-100/90 border border-aura-200 text-aura-900 text-xs font-bold shadow-2xs">
                  <CrownOutlined className="text-amber-600" />
                  <span>Admin Portal</span>
                </div>

                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setCurrentView('client')}
                  className="!border-aura-300 hover:!border-aura-500 !bg-white hover:!bg-aura-50 !h-7 sm:!h-9 !px-2.5 sm:!px-3.5 text-xs font-semibold text-aura-900 !rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <span className="hidden sm:inline">Return to Client Booking</span>
                  <span className="sm:hidden">Client View</span>
                </Button>
              </div>
            )}

            {/* Action Tools: Track for Clients; Notifications & Admin Controls for Authenticated Clinic Staff */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 pr-0.5 sm:pr-1">
              {/* About Clinic Button - HIDDEN IN ADMIN VIEW (Removed as requested!) */}
              {currentView !== 'admin' && (
                <Tooltip title="View Clinic Story, Doctors & Services Menu">
                  <Button
                    icon={<InfoCircleOutlined className="text-aura-700 text-xs sm:text-sm" />}
                    onClick={openAboutModal}
                    className="!border-aura-200 hover:!border-aura-400 !bg-aura-50/50 hover:!bg-white !px-2 sm:!px-3 !h-7 sm:!h-9 !text-aura-800 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>About Us</span>
                  </Button>
                </Tooltip>
              )}

              {/* Track My Booking Button */}
              {currentView !== 'admin' ? (
                <Tooltip title="Track your appointment status with your Reference ID or Phone number">
                  <Button
                    icon={<SearchOutlined className="text-aura-700 text-xs sm:text-sm" />}
                    onClick={() => setTrackModalVisible(true)}
                    className="!border-aura-200 hover:!border-aura-400 !bg-aura-50/50 hover:!bg-white !px-2 sm:!px-3 !h-7 sm:!h-9 !text-aura-800 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>Track</span>
                  </Button>
                </Tooltip>
              ) : (
                <div className="hidden sm:block">
                  <Tooltip title="Track appointment Reference ID">
                    <Button
                      icon={<SearchOutlined className="text-aura-700 text-xs sm:text-sm" />}
                      onClick={() => setTrackModalVisible(true)}
                      className="!border-aura-200 hover:!border-aura-400 !bg-aura-50/50 hover:!bg-white !px-2.5 !h-7 sm:!h-9 !text-aura-800 text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <span>Track</span>
                    </Button>
                  </Tooltip>
                </div>
              )}

              {/* Install App Button (iPhone & Android) - Automatically hidden if running inside installed app */}
              {!isStandalone && (
                <Tooltip title="Install Aura Clinic as a native app on iOS or Android">
                  <Button
                    icon={<MobileOutlined className="text-aura-700 text-xs sm:text-sm" />}
                    onClick={() => setInstallModalVisible(true)}
                    className="!border-aura-300 hover:!border-aura-500 !bg-gradient-to-r !from-aura-50 !to-white hover:!bg-white !px-2 sm:!px-3 !h-7 sm:!h-9 !text-aura-900 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shrink-0 shadow-2xs"
                  >
                    <span className="hidden sm:inline">Install App</span>
                    <span className="sm:hidden">App</span>
                  </Button>
                </Tooltip>
              )}

              {/* Clinic Staff Only: Notification Bell & Admin Controls */}
              {isAdminAuthenticated && currentView === 'admin' && (
                <>
                  {/* Notification Bell with Badge */}
                  <Popover
                    content={notifContent}
                    trigger="click"
                    open={notifOpen}
                    onOpenChange={setNotifOpen}
                    placement="bottomRight"
                  >
                    <Badge count={unreadNotifs.length} offset={[-2, 3]} size="small">
                      <Button
                        icon={<BellOutlined className="text-aura-700 text-xs sm:text-base" />}
                        className="!border-aura-200 hover:!border-aura-400 !bg-aura-50/50 hover:!bg-white !w-7 sm:!w-auto !px-0 sm:!px-2.5 !h-7 sm:!h-9 flex items-center justify-center shrink-0"
                      />
                    </Badge>
                  </Popover>

                  {/* Desktop-Only Tools: Reception QR Pass & Lock Admin */}
                  <div className="hidden md:flex items-center gap-1.5">
                    <Tooltip title="Show Client QR Code for Reception">
                      <Button
                        icon={<QrcodeOutlined className="text-aura-600 text-sm" />}
                        onClick={() => setQrModalVisible(true)}
                        className="!border-aura-200 hover:!border-aura-400 !bg-aura-50/50 hover:!bg-white !px-2.5 sm:!px-3 !h-8 sm:!h-9"
                      >
                        <span className="text-xs font-medium text-aura-800">
                          QR
                        </span>
                      </Button>
                    </Tooltip>

                    <Tooltip title="Lock Admin Portal">
                      <Button
                        size="small"
                        icon={<LockOutlined />}
                        onClick={logoutAdmin}
                        className="!rounded-lg text-xs !border-rose-200 !text-rose-600 hover:!bg-rose-50 !h-8 sm:!h-9"
                      >
                        <span>Lock</span>
                      </Button>
                    </Tooltip>
                  </div>

                  {/* Mobile-Only Admin Menu (...) */}
                  <div className="md:hidden shrink-0">
                    <Dropdown
                      menu={{ items: mobileAdminMenuItems }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        icon={<EllipsisOutlined className="text-aura-800 text-sm" />}
                        className="!border-aura-200 hover:!border-aura-400 !bg-aura-50/50 hover:!bg-white !w-7 !h-7 !p-0 flex items-center justify-center shrink-0"
                      />
                    </Dropdown>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QR Code Modal for Client Site Access */}
      <QRCodeModal
        open={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
      />

      {/* Admin Security PIN Authentication Modal */}
      <AdminAuthModal
        open={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* Track Booking Status Modal */}
      <TrackBookingModal
        open={trackModalVisible}
        onClose={() => setTrackModalVisible(false)}
      />

      {/* Appointment Detail / Slip Modal from Notification */}
      <ReceiptModal
        open={!!selectedAptDetails}
        onClose={() => setSelectedAptDetails(null)}
        appointment={selectedAptDetails}
      />

      {/* Reminder Dispatch Modal */}
      <SmsNotificationModal
        open={!!reminderModalApt}
        onClose={() => setReminderModalApt(null)}
        appointment={reminderModalApt}
        defaultMode="reminder"
      />

      {/* PWA Install Guide Modal for iOS & Android */}
      <InstallAppModal
        open={installModalVisible}
        onClose={() => setInstallModalVisible(false)}
      />

      {/* Brand Interactive Logo Menu & Aesthetic Theme Switcher */}
      <BrandQuickMenuModal
        open={brandMenuVisible}
        onClose={() => setBrandMenuVisible(false)}
        onOpenVouchers={() => {
          if (currentView === 'admin') {
            window.dispatchEvent(new CustomEvent('aura:navigate-admin-tab', { detail: 'vouchers' }));
            message.info('Opened Vouchers & Promos Manager');
          } else {
            setVouchersModalVisible(true);
          }
        }}
        onOpenTrack={() => setTrackModalVisible(true)}
        onOpenAbout={openAboutModal}
        onOpenInstall={() => setInstallModalVisible(true)}
        onOpenAdminAuth={handleAdminClick}
      />

      {/* Vouchers Modal Triggered from Brand Hub */}
      <ClientVouchersModal
        open={vouchersModalVisible}
        onClose={() => setVouchersModalVisible(false)}
        onSelectVoucher={(code) => {
          message.success(`Voucher ${code} selected!`);
          setCurrentView('client');
        }}
      />
    </>
  );
};

export default Header;
