import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import {
  MobileOutlined,
  AppleOutlined,
  AndroidOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  ShareAltOutlined,
  PlusSquareOutlined,
  ExportOutlined
} from '@ant-design/icons';

const InstallAppModal = ({ open, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isAppleDevice);

    // Listen for native Android/Chrome install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      title={
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aura-700 to-aura-900 text-white flex items-center justify-center shadow-xs">
            <MobileOutlined className="text-lg" />
          </div>
          <div>
            <div className="font-serif-luxury text-lg font-bold text-aura-dark leading-tight">
              Install Aura Clinic App
            </div>
            <div className="text-[11px] text-gray-500 font-normal">
              Works seamlessly on iOS (iPhone) and Android
            </div>
          </div>
        </div>
      }
    >
      <div className="mt-3 space-y-4">
        {/* App Showcase Preview Card */}
        <div className="p-3.5 bg-gradient-to-br from-aura-50 via-rose-50/50 to-white rounded-2xl border border-aura-200/90 flex items-center gap-3">
          <img
            src="/pwa-icon-192.png"
            alt="Aura Clinic App Icon"
            className="w-14 h-14 rounded-2xl shadow-sm border border-aura-200 shrink-0"
          />
          <div className="flex-1">
            <div className="font-serif-luxury font-bold text-sm text-aura-dark">
              Aura Aesthetic Clinic
            </div>
            <div className="text-[11px] text-gray-600">
              HairCare Specialist & Medical Aesthetics
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-700 font-medium">
              <CheckCircleFilled className="text-emerald-600" />
              <span>Full Screen • Offline Ready • Zero App Store Fee</span>
            </div>
          </div>
        </div>

        {/* If already running in App Mode */}
        {isStandalone ? (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
            <CheckCircleFilled className="text-emerald-600 text-xl" />
            <div className="text-xs font-bold text-emerald-900">
              You're already using the Aura Clinic App!
            </div>
            <div className="text-[11px] text-emerald-700">
              This portal is running directly in standalone mobile application mode.
            </div>
          </div>
        ) : isIOS ? (
          /* iOS (iPhone / iPad) Step-by-Step Guide */
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-aura-200">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 pb-2 border-b border-gray-100">
              <AppleOutlined className="text-base text-gray-900" />
              <span>How to Install on iPhone / iPad (Safari):</span>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-aura-100 text-aura-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  Tap the <strong>Share</strong> button <ExportOutlined className="text-aura-700 inline-block mx-0.5" /> at the bottom bar of Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-aura-100 text-aura-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  Scroll down the menu and tap <strong>"Add to Home Screen"</strong> <PlusSquareOutlined className="text-aura-700 inline-block mx-0.5" />.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-aura-100 text-aura-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  Tap <strong>"Add"</strong> in the top-right corner. The official <strong>Aura Clinic</strong> app icon will now appear on your home screen!
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Chrome / Windows / Mac */
          <div className="space-y-3">
            {deferredPrompt ? (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleNativeInstall}
                block
                size="large"
                className="!bg-aura-800 hover:!bg-aura-900 !border-none !text-white !font-bold !rounded-xl !h-11 shadow-sm"
              >
                Install App on This Device
              </Button>
            ) : (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-aura-200 text-xs text-gray-700">
                <div className="flex items-center gap-2 font-bold text-gray-800 pb-2 border-b border-gray-100">
                  <AndroidOutlined className="text-emerald-600 text-base" />
                  <span>How to Install (Android & Chrome):</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-aura-100 text-aura-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>Tap the <strong>three dots (⋮)</strong> menu in Chrome or browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-aura-100 text-aura-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-aura-100 text-aura-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Confirm <strong>"Install"</strong>. The app will launch with its own icon!</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-gray-100">
          Once installed, the app opens full-screen without web browser address bars.
        </div>
      </div>
    </Modal>
  );
};

export default InstallAppModal;
