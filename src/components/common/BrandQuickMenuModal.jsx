import React from 'react';
import { Modal, Tag, Tooltip, Button } from 'antd';
import {
  BgColorsOutlined,
  CheckCircleFilled,
  MoonOutlined,
  SunOutlined,
  CrownOutlined,
  GiftOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  PhoneOutlined,
  LockOutlined,
  UnlockOutlined,
  EnvironmentOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  RightOutlined,
  HeartFilled
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const THEMES = [
  {
    key: 'rose',
    name: 'Aura Rose',
    subtitle: 'Signature Blush Luxury',
    icon: '🌸',
    accentColor: '#b76e79',
    bgColor: '#fdf8f8',
    previewBg: 'bg-[#faf7f7]',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  {
    key: 'dark',
    name: 'Midnight Noir',
    subtitle: 'Luxury Obsidian Dark Mode',
    icon: '🌙',
    accentColor: '#e28896',
    bgColor: '#130f12',
    previewBg: 'bg-[#181316]',
    badgeBg: 'bg-zinc-800 text-zinc-100 border-zinc-700'
  },
  {
    key: 'champagne',
    name: 'Royal Champagne',
    subtitle: 'Holiday & VIP Gold Edition',
    icon: '👑',
    accentColor: '#c5a059',
    bgColor: '#faf6ee',
    previewBg: 'bg-[#faf6ee]',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    key: 'diamond',
    name: 'Pure Diamond',
    subtitle: 'Crisp Minimalist Platinum',
    icon: '💎',
    accentColor: '#0f766e',
    bgColor: '#f8fafc',
    previewBg: 'bg-[#ffffff]',
    badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300'
  }
];

const BrandQuickMenuModal = ({
  open,
  onClose,
  onOpenVouchers,
  onOpenTrack,
  onOpenAbout,
  onOpenInstall,
  onOpenAdminAuth
}) => {
  const { clinicProfile, themeMode, changeThemeMode, isAdminAuthenticated } = useApp();

  const handleSelectTheme = (key) => {
    if (changeThemeMode) {
      changeThemeMode(key);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      className="aura-brand-menu-modal"
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-aura-200">
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-aura-800 via-aura-700 to-aura-900 text-white p-5">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aura-500 via-amber-400 to-white flex items-center justify-center text-white shadow-md text-xl font-serif-luxury font-bold shrink-0">
              {clinicProfile?.clinicName ? clinicProfile.clinicName.trim().charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  {clinicProfile?.clinicName || 'Aura Aesthetic Clinic'}
                </h3>
              </div>
              <p className="text-[11px] text-aura-200 line-clamp-1 mt-0.5">
                {clinicProfile?.tagline || 'HairCare Specialist & Medical Aesthetics'}
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Open Today: 9:00 AM – 7:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Visual Aesthetic Themes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-aura-800 flex items-center gap-1.5">
                <BgColorsOutlined className="text-aura-600" />
                <span>Aesthetic Visual Theme</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Click to apply</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => {
                const isActive = (themeMode || 'rose') === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => handleSelectTheme(t.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                      isActive
                        ? 'border-aura-700 bg-aura-50/80 shadow-xs ring-2 ring-aura-600/20'
                        : 'border-gray-200 hover:border-aura-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full mb-1">
                      <span className="text-base">{t.icon}</span>
                      {isActive ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                          <CheckCircleFilled className="text-[9px]" /> Active
                        </span>
                      ) : (
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: t.accentColor }}
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900 group-hover:text-aura-800">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-1 leading-tight">
                        {t.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Quick Concierge Shortcuts */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs font-bold uppercase tracking-wider text-aura-800 mb-2 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Quick Concierge Hub</span>
            </div>

            <div className="space-y-1.5">
              {/* Vouchers */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenVouchers) onOpenVouchers();
                }}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-aura-50/80 border border-gray-200/80 hover:border-aura-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
                    🎁
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 group-hover:text-aura-800">
                      Promo Vouchers & Privilege Offers
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Save up to ₱600 on active clinic treatments
                    </div>
                  </div>
                </div>
                <RightOutlined className="text-[10px] text-gray-400 group-hover:text-aura-700 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Track Booking */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenTrack) onOpenTrack();
                }}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-aura-50/80 border border-gray-200/80 hover:border-aura-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                    🔍
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 group-hover:text-aura-800">
                      Track My Appointment
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Live status, print slip, or cancel slot
                    </div>
                  </div>
                </div>
                <RightOutlined className="text-[10px] text-gray-400 group-hover:text-aura-700 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Install App */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenInstall) onOpenInstall();
                }}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-aura-50/80 border border-gray-200/80 hover:border-aura-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    📲
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 group-hover:text-aura-800">
                      Install as Mobile App (iOS & Android)
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Add icon to phone home screen with 1 tap
                    </div>
                  </div>
                </div>
                <RightOutlined className="text-[10px] text-gray-400 group-hover:text-aura-700 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* About Clinic */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAbout) onOpenAbout();
                }}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-aura-50/80 border border-gray-200/80 hover:border-aura-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs">
                    ✨
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 group-hover:text-aura-800">
                      Specialist Aura Diaz Cano & Clinic Story
                    </div>
                    <div className="text-[10px] text-gray-500">
                      View medical credentials, suite photos & services
                    </div>
                  </div>
                </div>
                <RightOutlined className="text-[10px] text-gray-400 group-hover:text-aura-700 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Section 3: Concierge Hotline & Location */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-aura-50 via-white to-aura-100/50 border border-aura-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-aura-900 flex items-center gap-1.5">
                <PhoneOutlined className="text-aura-600" />
                <span>Concierge Hotline</span>
              </span>
              <a
                href="tel:09178829912"
                className="font-bold text-aura-700 hover:text-aura-900 underline"
              >
                0917-882-9912
              </a>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-gray-600">
              <EnvironmentOutlined className="text-aura-600 mt-0.5 shrink-0" />
              <span>3F Promenade Wing, Bonifacio High Street, Taguig & Cagayan</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              if (onOpenAdminAuth) onOpenAdminAuth();
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-aura-700 cursor-pointer transition-colors"
          >
            {isAdminAuthenticated ? (
              <>
                <UnlockOutlined className="text-xs text-emerald-600" />
                <span className="text-emerald-700 font-bold">Open Admin Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </>
            ) : (
              <>
                <LockOutlined className="text-xs text-gray-400" />
                <span>Staff / Admin Portal</span>
              </>
            )}
          </button>

          <Button
            size="small"
            onClick={onClose}
            className="!rounded-lg text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BrandQuickMenuModal;
