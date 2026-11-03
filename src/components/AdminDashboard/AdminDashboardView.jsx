import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Tag } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  TagOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
  UnlockOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import OverviewTab from './OverviewTab';
import AppointmentsTab from './AppointmentsTab';
import VoucherTrackerTab from './VoucherTrackerTab';
import ClientDatabaseTab from './ClientDatabaseTab';
import ServicesTab from './ServicesTab';
import SettingsTab from './SettingsTab';
import StaffSecurityTab from './StaffSecurityTab';
import AdminAuthModal from '../common/AdminAuthModal';

const { Sider, Content } = Layout;

const AdminDashboardView = () => {
  const {
    stats,
    setCurrentView,
    isAdminAuthenticated,
    logoutAdmin,
    authRole,
    currentStaffUser,
    otpRequests
  } = useApp();
  const [selectedKey, setSelectedKey] = useState('overview');
  const [tabParams, setTabParams] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavigateTab = (tabKey, params = {}) => {
    setTabParams(params);
    setSelectedKey(tabKey);
    setMobileDrawerOpen(false);
  };

  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail) {
        setSelectedKey(e.detail);
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('aura:navigate-admin-tab', handleNavigate);
    return () => window.removeEventListener('aura:navigate-admin-tab', handleNavigate);
  }, []);

  // If not authenticated, render locked protection screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-aura-50/50">
        <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-aura-200 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-aura-100 flex items-center justify-center text-aura-700 text-3xl shadow-inner">
            <LockOutlined />
          </div>
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark">
            Admin Area Protected
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            This dashboard contains sensitive clinic revenues, appointments, and patient records. Please enter your Security PIN to continue.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="primary"
              size="large"
              icon={<UnlockOutlined />}
              onClick={() => setShowAuthModal(true)}
              className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !h-12 !font-bold text-sm"
            >
              Enter Clinic Security PIN
            </Button>
            <Button
              size="large"
              onClick={() => setCurrentView('client')}
              className="!rounded-xl !border-aura-200 !text-gray-600 text-xs"
            >
              Return to Client Booking
            </Button>
          </div>
        </div>

        <AdminAuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // Navigation Items
  const now = Date.now();
  const pendingOtpCount = (otpRequests || []).filter(r => r.status === 'pending' && r.expiresAt > now).length;

  const navItems = [
    {
      key: 'overview',
      icon: <DashboardOutlined />,
      label: 'Overview'
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Bookings',
      badge: stats.pendingCount > 0 ? stats.pendingCount : null,
      badgeColor: 'bg-amber-400 text-amber-950'
    },
    {
      key: 'services',
      icon: <MedicineBoxOutlined />,
      label: 'Services'
    },
    {
      key: 'vouchers',
      icon: <TagOutlined />,
      label: 'Vouchers',
      badge: stats.activeUnredeemedVouchers,
      badgeColor: 'bg-aura-100 text-aura-800'
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: 'Clients'
    },
    ...(authRole !== 'staff' ? [{
      key: 'staff',
      icon: <SafetyCertificateOutlined className="text-amber-600" />,
      label: 'Staff & Security',
      badge: pendingOtpCount > 0 ? pendingOtpCount : null,
      badgeColor: 'bg-amber-400 text-amber-950 font-bold animate-pulse'
    }] : []),
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    }
  ];

  // Menu items for Desktop Sider & Mobile Drawer
  const menuItems = navItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: (
      <div className="flex items-center justify-between w-full">
        <span>{item.label}</span>
        {item.badge !== null && item.badge !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-2 ${item.badgeColor}`}>
            {item.badge}
          </span>
        )}
      </div>
    )
  }));

  return (
    <div className="min-h-screen bg-aura-50/40">
      {/* Staff Mode Co-Admin Header Banner */}
      {authRole === 'staff' && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold flex items-center gap-1">
              <span>👥 Co-Admin Duty:</span>
              <span className="underline">{currentStaffUser?.name || 'Staff Member'}</span>
            </span>
            <span className="text-amber-200 hidden sm:inline">({currentStaffUser?.roleTitle || 'Duty Staff'})</span>
            <Tag color="gold" className="!mr-0 text-[10px] font-bold">OTP Authorized</Tag>
          </div>
          <span className="text-[11px] text-amber-200">
            Clinic Director Dr. Aura Approved
          </span>
        </div>
      )}

      {/* Mobile Top Navigation Bar (Shown on Mobile screens < lg) */}
      <div className="lg:hidden bg-white border-b border-aura-200/80 sticky top-16 z-30 px-3 py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Scrollable Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavigateTab(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedKey === item.key
                    ? 'bg-aura-700 text-white shadow-xs'
                    : 'bg-aura-50 text-gray-700 hover:bg-aura-100/60 border border-aura-200/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-bold ${
                      selectedKey === item.key ? 'bg-white text-aura-800' : 'bg-aura-200 text-aura-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <Button
            icon={<MenuOutlined className="text-aura-700" />}
            onClick={() => setMobileDrawerOpen(true)}
            className="!rounded-xl !border-aura-200 shrink-0 !h-8 !px-2.5"
          />
        </div>
      </div>

      {/* Mobile Drawer (Slide-out panel for phone users) */}
      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        placement="left"
        width={280}
        title={
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-[10px] uppercase font-bold text-aura-600 tracking-wider block">
                Clinic Management
              </span>
              <h3 className="font-serif-luxury font-bold text-base text-aura-dark">
                Owner Portal
              </h3>
            </div>
          </div>
        }
      >
        <div className="flex flex-col justify-between h-full">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => handleNavigateTab(key)}
            items={menuItems}
            className="!border-none text-xs font-semibold"
          />

          <div className="space-y-3 pt-6 border-t border-aura-100">
            <Button
              block
              danger
              icon={<LockOutlined />}
              onClick={() => {
                setMobileDrawerOpen(false);
                logoutAdmin();
              }}
              className="!rounded-xl text-xs font-semibold !h-10"
            >
              Lock Admin Portal
            </Button>

            <Button
              block
              icon={<EyeOutlined />}
              onClick={() => {
                setMobileDrawerOpen(false);
                setCurrentView('client');
              }}
              className="!rounded-xl !border-aura-300 !text-aura-800 text-xs font-semibold !h-10"
            >
              Switch to Client Booking
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Main Responsive Layout */}
      <div className="flex w-full">
        {/* Desktop Sider (Hidden on Mobile screens, visible only on lg screens >= 1024px) */}
        <div className="hidden lg:block shrink-0">
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={240}
            className="!bg-white border-r border-aura-200/90 shadow-xs min-h-[calc(100vh-80px)] sticky top-20"
            theme="light"
            trigger={null}
          >
            <div className="p-4 flex items-center justify-between border-b border-aura-100">
              {!collapsed && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-aura-600 tracking-wider">
                    Clinic Management
                  </span>
                  <h3 className="font-serif-luxury font-bold text-sm text-aura-dark">
                    Owner Portal
                  </h3>
                </div>
              )}
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-500 hover:text-aura-700"
              />
            </div>

            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={({ key }) => handleNavigateTab(key)}
              items={menuItems}
              className="!border-none !pt-2 text-xs font-medium aura-admin-menu"
            />

            {!collapsed && (
              <div className="p-3 mx-3 mt-6 space-y-2">
                <Button
                  block
                  danger
                  size="small"
                  icon={<LockOutlined />}
                  onClick={logoutAdmin}
                  className="!rounded-xl text-xs font-medium"
                >
                  Lock Admin Portal
                </Button>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-aura-50 to-aura-100/60 border border-aura-200 text-xs text-aura-900 space-y-2">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-aura-700">
                    Client View
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Switch to customer self-booking screen.
                  </p>
                  <Button
                    block
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setCurrentView('client')}
                    className="!bg-white !border-aura-300 !text-aura-800 hover:!border-aura-600 text-xs !rounded-xl"
                  >
                    Go to Client View
                  </Button>
                </div>
              </div>
            )}
          </Sider>
        </div>

        {/* Content Area - 100% Full Width on Mobile */}
        <main className="flex-1 w-full min-w-0 p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
          {selectedKey === 'overview' && (
            <OverviewTab onNavigateTab={handleNavigateTab} />
          )}

          {selectedKey === 'appointments' && (
            <AppointmentsTab initialFilters={tabParams} />
          )}

          {selectedKey === 'services' && (
            <ServicesTab />
          )}

          {selectedKey === 'vouchers' && (
            <VoucherTrackerTab initialFilters={tabParams} />
          )}

          {selectedKey === 'clients' && (
            <ClientDatabaseTab />
          )}

          {selectedKey === 'staff' && (
            <StaffSecurityTab />
          )}

          {selectedKey === 'settings' && (
            <SettingsTab />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardView;
