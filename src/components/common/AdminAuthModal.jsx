import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Alert, Tabs, Select, Tag, message } from 'antd';
import {
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined,
  UserOutlined,
  MailOutlined,
  CrownOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  RightOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const AdminAuthModal = ({ open, onClose }) => {
  const {
    ownerProfile,
    loginOwner,
    staffAccounts,
    requestStaffOtp,
    verifyStaffOtp,
    adminPin
  } = useApp();

  const [activeTab, setActiveTab] = useState('owner'); // 'owner' | 'staff'

  // Owner form state
  const [ownerEmail, setOwnerEmail] = useState(ownerProfile?.email || 'edwarddufale3@gmail.com');
  const [ownerPin, setOwnerPin] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);

  // Staff form state
  const [selectedStaffEmail, setSelectedStaffEmail] = useState('');
  const [staffOtpCode, setStaffOtpCode] = useState('');
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [dispatchedOtpPreview, setDispatchedOtpPreview] = useState('');
  const [staffError, setStaffError] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(600); // 10 minutes

  // Auto-select first active staff member
  useEffect(() => {
    if (staffAccounts && staffAccounts.length > 0 && !selectedStaffEmail) {
      const firstActive = staffAccounts.find(s => s.active) || staffAccounts[0];
      if (firstActive) {
        setSelectedStaffEmail(firstActive.email);
      }
    }
  }, [staffAccounts, selectedStaffEmail]);

  // Reset states when modal closes or opens
  useEffect(() => {
    if (open) {
      setOwnerEmail(ownerProfile?.email || 'edwarddufale3@gmail.com');
      setOwnerPin('');
      setOwnerError('');
      setStaffError('');
      setStaffOtpCode('');
      setOtpDispatched(false);
      setDispatchedOtpPreview('');
    }
  }, [open, ownerProfile]);

  // Handle countdown timer
  useEffect(() => {
    let timer = null;
    if (otpDispatched && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpDispatched, otpCountdown]);

  // Handle Owner Login
  const handleOwnerUnlock = (e) => {
    if (e) e.preventDefault();
    setOwnerError('');

    if (!ownerPin.trim()) {
      setOwnerError('Please enter your Master Security PIN');
      return;
    }

    setOwnerLoading(true);
    setTimeout(() => {
      const res = loginOwner(ownerEmail, ownerPin.trim());
      setOwnerLoading(false);
      if (res.success) {
        setOwnerPin('');
        setOwnerError('');
        message.success(`Welcome back, ${ownerProfile?.name || 'Clinic Director Dr. Aura'}!`);
        onClose();
      } else {
        setOwnerError(res.message);
      }
    }, 350);
  };

  // Staff Step 1: Request OTP
  const handleRequestStaffOtp = () => {
    setStaffError('');
    if (!selectedStaffEmail) {
      setStaffError('Please select or enter your staff email');
      return;
    }

    setStaffLoading(true);
    setTimeout(() => {
      const res = requestStaffOtp(selectedStaffEmail);
      setStaffLoading(false);
      if (res.success) {
        setOtpDispatched(true);
        setDispatchedOtpPreview(res.otpCode);
        setOtpCountdown(600);
        message.success(`OTP code dispatched to Clinic Director Dr. Aura!`);
      } else {
        setStaffError(res.message);
      }
    }, 400);
  };

  // Staff Step 2: Verify OTP
  const handleVerifyStaffOtp = (e) => {
    if (e) e.preventDefault();
    setStaffError('');

    if (!staffOtpCode.trim() || staffOtpCode.trim().length < 6) {
      setStaffError('Please enter the complete 6-digit OTP code provided by Dr. Aura');
      return;
    }

    setStaffLoading(true);
    setTimeout(() => {
      const res = verifyStaffOtp(selectedStaffEmail, staffOtpCode.trim());
      setStaffLoading(false);
      if (res.success) {
        message.success(`Staff access verified for ${res.staff.name}!`);
        onClose();
      } else {
        setStaffError(res.message);
      }
    }, 400);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 460 }}
      className="aura-auth-modal"
    >
      <div className="p-3 sm:p-5 text-center space-y-4">
        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-aura-800 via-aura-700 to-aura-900 flex items-center justify-center text-white text-2xl shadow-lg shadow-aura-700/25">
          {activeTab === 'owner' ? <CrownOutlined className="text-amber-300" /> : <TeamOutlined />}
        </div>

        <div>
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark">
            Aura Clinic Portal
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Authorized clinic access only. Select your account type below.
          </p>
        </div>

        {/* Tab Switcher: Owner vs Staff */}
        <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'owner'
                ? 'bg-white text-aura-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <CrownOutlined className={activeTab === 'owner' ? 'text-amber-600' : ''} />
            <span>Clinic Director (Owner)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-aura-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <TeamOutlined className={activeTab === 'staff' ? 'text-aura-700' : ''} />
            <span>Duty Specialist / Staff</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CLINIC DIRECTOR / OWNER ACCESS                          */}
        {/* ============================================================== */}
        {activeTab === 'owner' && (
          <div className="space-y-3 pt-1 text-left">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/80 via-white to-aura-50/50 border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                  👑
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {ownerProfile?.name || 'Dr. Aura Diaz Cano'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {ownerProfile?.email || 'aura.director@gmail.com'}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleOwnerUnlock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Master Security PIN
                </label>
                <Input.Password
                  prefix={<KeyOutlined className="text-amber-600" />}
                  placeholder="Enter Master Security PIN..."
                  maxLength={10}
                  value={ownerPin}
                  onChange={(e) => {
                    setOwnerPin(e.target.value);
                    setOwnerError('');
                  }}
                  autoFocus
                  className="!rounded-xl !py-2.5 !text-center !text-lg !tracking-widest font-mono !border-aura-300 focus:!border-aura-600"
                />
              </div>

              {ownerError && (
                <Alert
                  message={ownerError}
                  type="error"
                  showIcon
                  className="!rounded-xl !py-1.5 text-xs"
                />
              )}

              <Button
                type="primary"
                htmlType="submit"
                loading={ownerLoading}
                block
                size="large"
                icon={<UnlockOutlined />}
                className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl !h-11 !font-bold text-sm shadow-md"
              >
                Sign In as Clinic Director
              </Button>
            </form>

            <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <SafetyCertificateOutlined className="text-emerald-500" />
                <span>Authorized Clinic Director Session</span>
              </span>
              <span className="text-[10px] text-gray-400">
                Encrypted Master Access
              </span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CLINICAL SPECIALIST / DUTY STAFF WITH DR. AURA OTP     */}
        {/* ============================================================== */}
        {activeTab === 'staff' && (
          <div className="space-y-3 pt-1 text-left">
            {!otpDispatched ? (
              // Step 1: Select Staff Account & Request OTP
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select Duty Specialist / Staff *
                  </label>
                  <Select
                    value={selectedStaffEmail}
                    onChange={(val) => {
                      setSelectedStaffEmail(val);
                      setStaffError('');
                    }}
                    className="w-full !rounded-xl"
                    size="large"
                    placeholder="Choose attending specialist..."
                  >
                    {staffAccounts.map(s => (
                      <Select.Option key={s.id} value={s.email}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{s.name}</span>
                          <span className="text-[10px] text-gray-400">({s.roleTitle})</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <LockOutlined className="text-amber-700" />
                    <span>Director-Authorized Clinical Access</span>
                  </div>
                  <p className="text-gray-600">
                    To safeguard patient medical charts, clinical logins require a one-time authorization code generated by <strong>Dr. Aura</strong>.
                  </p>
                </div>

                {staffError && (
                  <Alert
                    message={staffError}
                    type="error"
                    showIcon
                    className="!rounded-xl !py-1.5 text-xs"
                  />
                )}

                <Button
                  type="primary"
                  onClick={handleRequestStaffOtp}
                  loading={staffLoading}
                  block
                  size="large"
                  icon={<MailOutlined />}
                  className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl !h-11 !font-bold text-sm shadow-md"
                >
                  Request Access OTP from Dr. Aura
                </Button>
              </div>
            ) : (
              // Step 2: Enter 6-digit OTP code given by Dr. Aura
              <form onSubmit={handleVerifyStaffOtp} className="space-y-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start justify-between">
                  <div>
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircleFilled className="text-emerald-600" />
                      <span>Security OTP Dispatched</span>
                    </div>
                    <div className="text-[11px] text-gray-600 mt-0.5">
                      Requester: <strong>{selectedStaffEmail}</strong>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                      Delivered to: <strong>{ownerProfile?.email || 'edwarddufale3@gmail.com'}</strong>
                    </div>
                  </div>
                  <Tag color="orange" className="!mr-0 font-mono text-[10px]">
                    ⏱️ {formatTimer(otpCountdown)}
                  </Tag>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Enter 6-digit Security OTP *
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Obtain code from Dr. Aura
                    </span>
                  </div>
                  <Input
                    prefix={<KeyOutlined className="text-aura-500" />}
                    placeholder="Enter 6-digit OTP (e.g. 849201)..."
                    maxLength={6}
                    value={staffOtpCode}
                    onChange={(e) => {
                      setStaffOtpCode(e.target.value);
                      setStaffError('');
                    }}
                    autoFocus
                    className="!rounded-xl !py-2.5 !text-center !text-xl !tracking-widest font-mono !font-bold !border-aura-300 focus:!border-aura-600"
                  />
                </div>

                {/* Director Security Notice (shows code for in-clinic local authorization) */}
                {dispatchedOtpPreview && (
                  <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[11px] text-purple-900">Clinic Director Authorization Notice:</span>
                      <div className="text-[11px] text-purple-800">
                        Active Access Code: <strong className="font-mono text-base text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-300 ml-1">{dispatchedOtpPreview}</strong>
                      </div>
                    </div>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => setStaffOtpCode(dispatchedOtpPreview)}
                      className="!text-purple-700 !font-bold text-xs"
                    >
                      Authorize Code
                    </Button>
                  </div>
                )}

                {staffError && (
                  <Alert
                    message={staffError}
                    type="error"
                    showIcon
                    className="!rounded-xl !py-1.5 text-xs"
                  />
                )}

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={staffLoading}
                  block
                  size="large"
                  icon={<UnlockOutlined />}
                  className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl !h-11 !font-bold text-sm shadow-md"
                >
                  Verify OTP & Enter Staff Portal
                </Button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDispatched(false);
                      setStaffOtpCode('');
                      setStaffError('');
                    }}
                    className="text-gray-500 hover:text-aura-800 underline cursor-pointer"
                  >
                    ← Change Staff Account
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestStaffOtp}
                    className="text-aura-700 hover:underline font-bold cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-1">
          <SafetyCertificateOutlined className="text-emerald-500" />
          <span>Aura Aesthetic Medical Group • Encrypted Session</span>
        </div>
      </div>
    </Modal>
  );
};

export default AdminAuthModal;
