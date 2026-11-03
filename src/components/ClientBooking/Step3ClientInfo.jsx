import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Tag, Divider, message, Avatar, Modal, Tooltip } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TagOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  LeftOutlined,
  SafetyCertificateOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  GoogleOutlined,
  DisconnectOutlined,
  StopOutlined,
  DeleteOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import GoogleAuthModal from './GoogleAuthModal';
import AddChangeServicesModal from './AddChangeServicesModal';

const { TextArea } = Input;

const Step3ClientInfo = ({
  selectedServices = [],
  selectedService,
  onRemoveService,
  onUpdateServices,
  onGoToServices,
  selectedDate,
  selectedTime,
  onBack,
  onBookingComplete
}) => {
  const [form] = Form.useForm();
  const {
    validateVoucher,
    addAppointment,
    vouchers,
    googleUser,
    loginWithGoogle,
    logoutGoogle,
    isClientBlocked,
    clinicProfile
  } = useApp();

  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [blockedModalData, setBlockedModalData] = useState(null);
  const [changeServicesModalOpen, setChangeServicesModalOpen] = useState(false);

  const handleSaveServices = (newServices) => {
    if (onUpdateServices) {
      onUpdateServices(newServices);
    }
    // Re-check voucher against new total and new treatments
    if (appliedVoucher) {
      const newPrice = newServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const result = validateVoucher(appliedVoucher.voucher.code, newPrice, newServices);
      if (result.valid) {
        setAppliedVoucher(result);
      } else {
        setAppliedVoucher(null);
        setVoucherError(result.message || 'Voucher removed: requirements changed.');
      }
    }
    message.success('Appointment treatments updated!');
  };

  const currentList = Array.isArray(selectedServices) && selectedServices.length > 0
    ? selectedServices
    : (selectedService ? [selectedService] : []);

  const servicePrice = currentList.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const discount = appliedVoucher?.discount || 0;
  const finalPrice = Math.max(0, servicePrice - discount);

  // Auto-fill form if googleUser is connected or remembered on this device
  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('aura_client_phone');
      if (googleUser) {
        form.setFieldsValue({
          fullName: googleUser.name,
          email: googleUser.email,
          ...(savedPhone ? { phone: savedPhone } : {})
        });
      } else if (savedPhone) {
        form.setFieldsValue({ phone: savedPhone });
      }
    } catch (e) {
      console.error(e);
    }
  }, [googleUser, form]);

  const handleGoogleClick = () => {
    setGoogleModalVisible(true);
  };

  const handleGoogleConnect = (profile) => {
    loginWithGoogle(profile);
    form.setFieldsValue({
      fullName: profile.name,
      email: profile.email
    });
    message.success(`Connected as ${profile.name}! Contact details auto-filled.`);
  };

  const handleDisconnectGoogle = () => {
    logoutGoogle();
    form.setFieldsValue({
      fullName: '',
      email: ''
    });
    message.info('Disconnected Google account.');
  };

  // Apply Voucher
  const handleApplyVoucher = () => {
    setVoucherError('');
    if (!voucherCodeInput.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    const result = validateVoucher(voucherCodeInput, servicePrice, currentList);
    if (result.valid) {
      setAppliedVoucher(result);
      message.success(result.message);
      setVoucherError('');
    } else {
      setAppliedVoucher(null);
      setVoucherError(result.message);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    setVoucherError('');
  };

  // Submit Booking Form
  const handleSubmit = (values) => {
    // Check if client account is blocked
    const blockCheck = isClientBlocked(values.phone, values.email || googleUser?.email);
    if (blockCheck.isBlocked) {
      setBlockedModalData(blockCheck);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const bookingData = {
        clientName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email ? values.email.trim() : (googleUser?.email || ''),
        notes: values.notes ? values.notes.trim() : '',
        services: currentList,
        serviceId: currentList[0]?.id || 'srv-custom',
        serviceName: currentList.map(s => s.name).join(' & '),
        serviceCategory: currentList[0]?.category || 'General',
        date: selectedDate.format('YYYY-MM-DD'),
        time: typeof selectedTime === 'object' && selectedTime !== null ? (selectedTime.time || '') : selectedTime,
        totalPrice: servicePrice,
        discountApplied: discount,
        finalAmount: finalPrice,
        voucherUsed: appliedVoucher ? appliedVoucher.voucher.code : null,
        bookedVia: googleUser ? 'Google 1-Click' : 'Guest Booking (Option A)'
      };

      try {
        localStorage.setItem('aura_client_phone', values.phone.trim());
      } catch (e) {
        console.error(e);
      }

      const createdAppointment = addAppointment(bookingData);
      setSubmitting(false);

      if (createdAppointment?.error && createdAppointment?.blocked) {
        setBlockedModalData({ reason: createdAppointment.message });
        return;
      }

      onBookingComplete(createdAppointment);
    }, 600);
  };

  // Automatically scroll and focus to the invalid field if user misses anything
  const handleFinishFailed = (errorInfo) => {
    if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
      const firstError = errorInfo.errorFields[0];
      const fieldName = firstError.name[0];
      const errorMessage = firstError.errors[0] || 'Please complete the required details';

      message.warning(errorMessage);

      // Smooth scroll to the specific input box
      form.scrollToField(fieldName, {
        behavior: 'smooth',
        block: 'center',
        scrollMode: 'if-needed'
      });

      // Direct focus on the input box
      setTimeout(() => {
        const inputElem = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
        if (inputElem) {
          inputElem.focus();
        }
      }, 350);
    }
  };

  const sampleVouchers = (vouchers || [])
    .filter(v => {
      if (v.status === 'Redeemed') return false;
      const today = dayjs().format('YYYY-MM-DD');
      if (v.expiryDate && v.expiryDate < today) return false;

      // Only show vouchers valid for current treatments or all services
      if (!v.serviceCategory || v.serviceCategory === 'All Services') return true;
      if (v.serviceCategory.startsWith('Treatment: ')) {
        const reqName = v.serviceCategory.replace('Treatment: ', '').trim().toLowerCase();
        return currentList.some(s => (s.name || '').toLowerCase() === reqName);
      }
      return currentList.some(s => (s.category || '').toLowerCase() === v.serviceCategory.toLowerCase());
    })
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Client Form */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-aura-200 shadow-xs space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-serif-luxury text-lg sm:text-xl font-bold text-aura-dark">
                Client Information
              </h4>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                ⚡ Option A: Instant Booking
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500">
              No account creation or password needed. Provide contact details or 1-tap with Google.
            </p>
          </div>

          {/* 1-Click Continue with Google Button */}
          {!googleUser ? (
            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200 text-center space-y-2">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs py-2.5 px-4 rounded-xl border border-gray-300 shadow-xs hover:border-gray-400 transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Official Google multicolored G logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (1-Tap Auto-fill)</span>
              </button>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
                <span className="w-12 h-px bg-gray-200"></span>
                <span>or enter manually below</span>
                <span className="w-12 h-px bg-gray-200"></span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar src={googleUser.avatar} size="small" />
                <div>
                  <div className="font-bold text-blue-900 text-xs flex items-center gap-1">
                    <span>{googleUser.name}</span>
                    <Tag color="blue" className="!text-[9px] !mr-0">Google Verified</Tag>
                  </div>
                  <div className="text-[11px] text-blue-700">{googleUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="text-[11px] text-rose-500 hover:underline flex items-center gap-0.5"
              >
                <DisconnectOutlined /> Disconnect
              </button>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFinishFailed={handleFinishFailed}
            scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
            requiredMark={false}
            initialValues={{ phone: localStorage.getItem('aura_client_phone') || '09' }}
          >
            {/* Full Name */}
            <Form.Item
              name="fullName"
              label={<span className="text-xs font-semibold text-gray-700">Full Name *</span>}
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input
                prefix={<UserOutlined className="text-aura-400" />}
                placeholder="e.g. Maria Clara Santos"
                className="!rounded-xl !py-2.5 !border-aura-200 focus:!border-aura-600"
              />
            </Form.Item>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Form.Item
                name="phone"
                label={
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <span>Mobile Number *</span>
                    <span className="text-[10px] text-aura-700 font-normal bg-aura-50 px-1.5 py-0.5 rounded border border-aura-200">
                      09XX
                    </span>
                  </span>
                }
                normalize={(value) => {
                  if (!value) return '';
                  // Strips all letters and symbols, keeps only digits up to 12 max
                  return value.replace(/\D/g, '').slice(0, 12);
                }}
                rules={[
                  { required: true, message: 'Please enter your mobile number' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const digits = value.replace(/\D/g, '');
                      const is11PH = /^09\d{9}$/.test(digits);
                      const is12PH = /^639\d{9}$/.test(digits);
                      if (!is11PH && !is12PH) {
                        return Promise.reject(new Error('Please enter a valid PH mobile number (e.g. 09171234567 or 639171234567)'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-aura-400" />}
                  placeholder="09171234567"
                  maxLength={12}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="!rounded-xl !py-2.5 !border-aura-200 focus:!border-aura-600 font-mono tracking-wider"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <span>Email Address</span>
                    <span className="text-[11px] font-normal text-gray-400">(Optional)</span>
                  </span>
                }
                rules={[{ type: 'email', message: 'Please enter a valid email address (e.g. name@gmail.com)' }]}
              >
                <Input
                  prefix={<MailOutlined className="text-aura-400" />}
                  placeholder="e.g. maria.santos@gmail.com"
                  className="!rounded-xl !py-2.5 !border-aura-200 focus:!border-aura-600"
                />
              </Form.Item>
            </div>

            {/* Skin Concerns / Notes */}
            <Form.Item
              name="notes"
              label={<span className="text-xs font-semibold text-gray-700">Skin Concerns or Special Requests</span>}
            >
              <TextArea
                rows={3}
                placeholder="e.g., Sensitive skin, prefer female aesthetician, first time trying this treatment..."
                className="!rounded-xl !border-aura-200 focus:!border-aura-600 !p-3 text-xs"
              />
            </Form.Item>

            {/* Voucher Section */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <GiftOutlined className="text-aura-600" />
                  <span>Have a Promo Voucher / Gift Pass?</span>
                </span>
                {appliedVoucher && (
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-xs text-rose-500 hover:underline font-normal"
                  >
                    Remove
                  </button>
                )}
              </label>

              {!appliedVoucher ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      prefix={<TagOutlined className="text-aura-400" />}
                      placeholder="e.g. AURA-WELCOME-200"
                      value={voucherCodeInput}
                      onChange={(e) => {
                        setVoucherCodeInput(e.target.value.toUpperCase());
                        setVoucherError('');
                      }}
                      className="!rounded-xl !py-2 !border-aura-200 uppercase"
                    />
                    <Button
                      onClick={handleApplyVoucher}
                      className="!rounded-xl !border-aura-400 !text-aura-700 hover:!border-aura-600 !font-semibold px-4 shrink-0"
                    >
                      Apply
                    </Button>
                  </div>

                  {voucherError && (
                    <p className="text-xs text-rose-600 font-medium">
                      ⚠️ {voucherError}
                    </p>
                  )}

                  {/* Active Clinic Promo Codes */}
                  {sampleVouchers.length > 0 && (
                    <div className="text-[11px] text-gray-500 flex items-center gap-1 flex-wrap">
                      <span>Featured Promo Codes:</span>
                      {sampleVouchers.map(v => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setVoucherCodeInput(v.code)}
                          className="bg-aura-50 hover:bg-aura-100 text-aura-800 px-2 py-0.5 rounded border border-aura-200 text-[10px] font-mono transition-colors"
                        >
                          {v.code} (-₱{v.discountAmount})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleFilled className="text-emerald-600 text-base" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900 font-mono">
                        {appliedVoucher.voucher.code}
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        ₱{appliedVoucher.discount} off applied!
                      </div>
                    </div>
                  </div>
                  <Tag color="green" className="!mr-0">Applied</Tag>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
                size="large"
                className="!bg-gradient-to-r !from-aura-700 !to-aura-600 hover:!from-aura-800 hover:!to-aura-700 !border-none !text-white !font-bold !rounded-xl !h-12 shadow-md shadow-aura-700/25 text-sm sm:text-base"
              >
                Confirm & Book Now — ₱{finalPrice.toLocaleString()}
              </Button>
              <div className="text-center mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-500">
                <SafetyCertificateOutlined className="text-aura-600" />
                <span>Zero pre-payment. Pay at the clinic upon arrival.</span>
              </div>
            </div>
          </Form>
        </div>

        {/* Right: Appointment Summary Sticky Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-aura-50/70 to-white p-4 sm:p-5 rounded-2xl border border-aura-200/90 shadow-sm space-y-3.5">
          <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-aura-dark pb-2 border-b border-aura-200/60">
            Appointment Summary
          </h4>

          {/* Treatment Details List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-aura-800">
              <span className="flex items-center gap-1.5">
                <span>Selected Treatments</span>
                <span className="bg-aura-100 text-aura-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {currentList.length}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setChangeServicesModalOpen(true)}
                className="inline-flex items-center gap-1 text-aura-700 hover:text-aura-900 bg-aura-100 hover:bg-aura-200 border border-aura-300 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <PlusCircleOutlined className="text-xs" />
                <span>+ Add / Change</span>
              </button>
            </div>

            {currentList.map((srv, idx) => (
              <div
                key={`${srv.id}-${idx}`}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-aura-200 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {srv.image ? (
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-10 h-10 rounded-lg object-cover border border-aura-100 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-aura-100 text-aura-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-bold text-gray-800 text-xs block truncate">{srv.name}</span>
                    <span className="text-[10px] text-gray-500">{srv.category} • {srv.duration || 'Session'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-aura-800 text-xs">₱{Number(srv.price).toLocaleString()}</span>
                  {currentList.length > 1 ? (
                    <Tooltip title="Remove this treatment">
                      <button
                        type="button"
                        onClick={() => onRemoveService && onRemoveService(srv.id)}
                        className="text-gray-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Change or swap this treatment">
                      <button
                        type="button"
                        onClick={() => setChangeServicesModalOpen(true)}
                        className="text-aura-600 hover:text-aura-800 p-1 text-xs hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <EditOutlined className="text-[11px]" />
                        <span className="text-[10px]">Change</span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Date & Time pill */}
          <div className="bg-white p-3 rounded-xl border border-aura-200 space-y-1 text-xs">
            <div className="flex items-center gap-2 text-gray-700 truncate">
              <CalendarOutlined className="text-aura-600" />
              <span>{selectedDate?.format('dddd, MMMM DD, YYYY')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <ClockCircleOutlined className="text-aura-600" />
              <span className="font-semibold text-aura-800">
                {typeof selectedTime === 'object' && selectedTime !== null ? (selectedTime.time || '') : (selectedTime || '')}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-1.5 pt-1 border-t border-aura-200/60 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Standard Service Fee</span>
              <span>₱{servicePrice.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Voucher Discount</span>
                <span>-₱{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Sterile Treatment Kit</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>

            <Divider className="!my-2 border-aura-200" />

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-gray-800 text-xs sm:text-sm">Total Due at Clinic</span>
              <span className="font-serif-luxury text-lg sm:text-xl font-bold text-aura-700">
                ₱{finalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            block
            icon={<LeftOutlined />}
            onClick={onBack}
            className="!border-aura-200 !text-aura-700 hover:!border-aura-500 !rounded-xl text-xs !h-9"
          >
            Change Date or Time
          </Button>
        </div>
      </div>

      {/* Google Real Account Sign-in Modal */}
      <GoogleAuthModal
        open={googleModalVisible}
        onClose={() => setGoogleModalVisible(false)}
        onConnect={handleGoogleConnect}
      />

      {/* Blocked / Suspended Account Notice Modal */}
      <Modal
        open={!!blockedModalData}
        onCancel={() => setBlockedModalData(null)}
        footer={[
          <Button
            key="close"
            type="primary"
            danger
            onClick={() => setBlockedModalData(null)}
            className="!rounded-xl font-semibold !h-9 text-xs"
          >
            I Understand
          </Button>
        ]}
        centered
        width={440}
        title={
          <div className="flex items-center gap-2 text-rose-600 font-serif-luxury text-base sm:text-lg">
            <StopOutlined />
            <span>Booking Request Restricted</span>
          </div>
        }
      >
        <div className="py-2 space-y-3">
          <Alert
            type="error"
            showIcon
            message="Account Suspended"
            description={
              <div className="space-y-1.5 mt-1">
                <p className="text-xs text-rose-950">
                  We are unable to process online appointments for this mobile number or account.
                </p>
                <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-900">
                  <strong>Reason on record:</strong> {blockedModalData?.reason}
                </div>
              </div>
            }
            className="!rounded-2xl"
          />
          <p className="text-xs text-gray-500 leading-relaxed">
            If you believe this restriction is an error or wish to appeal with our medical staff, please contact our concierge hotline at{' '}
            <strong className="text-aura-800">{clinicProfile?.phone || '(02) 8812-AURA'}</strong> or email{' '}
            <strong className="text-aura-800">{clinicProfile?.email || 'concierge@auraclinic.ph'}</strong>.
          </p>
        </div>
      </Modal>

      {/* Add or Change Treatments Modal */}
      <AddChangeServicesModal
        open={changeServicesModalOpen}
        onClose={() => setChangeServicesModalOpen(false)}
        selectedServices={currentList}
        onSave={handleSaveServices}
        onGoToCatalog={onGoToServices}
      />
    </div>
  );
};

export default Step3ClientInfo;
