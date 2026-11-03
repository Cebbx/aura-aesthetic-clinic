import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Divider, Tag, Alert, Popconfirm, Modal } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FacebookFilled,
  InstagramOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import PhotoUploadBox from '../common/PhotoUploadBox';

const SettingsTab = () => {
  const {
    clinicProfile,
    updateClinicProfile,
    adminPin,
    changeAdminPin,
    appointments,
    clients,
    services,
    vouchers
  } = useApp();

  const [profileForm] = Form.useForm();
  const [pinForm] = Form.useForm();

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // Save Clinic Details
  const handleSaveProfile = (values) => {
    setSavingProfile(true);
    setTimeout(() => {
      updateClinicProfile(values);
      setSavingProfile(false);
      message.success('Clinic Profile updated successfully!');
    }, 400);
  };

  // Change Security PIN
  const handleChangePin = (values) => {
    setPinSuccessMsg('');
    setPinErrorMsg('');

    if (values.newPin !== values.confirmPin) {
      setPinErrorMsg('New PIN and confirmation PIN do not match.');
      return;
    }

    if (values.newPin.length < 4) {
      setPinErrorMsg('New PIN must be at least 4 digits.');
      return;
    }

    setChangingPin(true);
    setTimeout(() => {
      const res = changeAdminPin(values.currentPin, values.newPin);
      setChangingPin(false);
      if (res.success) {
        setPinSuccessMsg('Clinic Security PIN changed successfully! Please remember your new PIN.');
        pinForm.resetFields();
        message.success('Security PIN changed successfully!');
      } else {
        setPinErrorMsg(res.message);
      }
    }, 400);
  };

  // Export Full Clinic Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      clinicProfile,
      exportedAt: new Date().toISOString(),
      version: '2.0-production',
      appointments,
      clients,
      services,
      vouchers
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aura_clinic_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    message.success('Clinic database backup downloaded successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-aura-200/60 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark tracking-tight">
            Clinic Settings & Profile
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your clinic branding, Medical Director contact details, and Admin security PIN.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tag color="gold" className="!rounded-lg !px-2.5 !py-1 text-xs font-semibold flex items-center gap-1 border-amber-300">
            <SafetyCertificateOutlined />
            <span>PIN Protected Admin Area</span>
          </Tag>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinic Profile Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            className="!rounded-2xl !border-aura-200 shadow-xs overflow-hidden"
            title={
              <div className="flex items-center gap-2 py-1">
                <ShopOutlined className="text-aura-700 text-lg" />
                <span className="font-serif-luxury font-bold text-aura-dark text-base">
                  Clinic & Medical Director Information
                </span>
              </div>
            }
          >
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={clinicProfile}
              onFinish={handleSaveProfile}
              requiredMark={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Form.Item name="logoUrl">
                    <PhotoUploadBox
                      label="Clinic Brand Logo or Doctor Profile Photo (Upload from Phone)"
                      aspect="square"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Clinic Name</span>}
                  name="clinicName"
                  rules={[{ required: true, message: 'Please enter clinic name' }]}
                >
                  <Input
                    prefix={<ShopOutlined className="text-aura-400" />}
                    placeholder="e.g. Aura Aesthetic Clinic"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Medical Director</span>}
                  name="directorName"
                  rules={[{ required: true, message: 'Please enter director name' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-aura-400" />}
                    placeholder="e.g. Dr. Aura Diaz Cano, MD, FPDS"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Clinic Concierge Landline</span>}
                  name="phone"
                >
                  <Input
                    prefix={<PhoneOutlined className="text-aura-400" />}
                    placeholder="e.g. (02) 8812-AURA"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Official Mobile Hotline</span>}
                  name="mobile"
                  rules={[{ required: true, message: 'Please enter mobile number' }]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-aura-400" />}
                    placeholder="e.g. 0917-882-9912"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Official Concierge Email</span>}
                  name="email"
                  rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                >
                  <Input
                    prefix={<MailOutlined className="text-aura-400" />}
                    placeholder="e.g. concierge@auraclinic.ph"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Operating Schedule</span>}
                  name="hours"
                >
                  <Input
                    prefix={<ClockCircleOutlined className="text-aura-400" />}
                    placeholder="e.g. Monday – Sunday: 9:00 AM – 7:30 PM"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <div className="sm:col-span-2">
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Clinic Branch Address</span>}
                    name="address"
                    rules={[{ required: true, message: 'Please enter clinic address' }]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="e.g. 3F Promenade Wing, Bonifacio High Street, BGC Taguig City"
                      className="!rounded-xl !py-2"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Clinic Tagline & Subtitle</span>}
                  name="tagline"
                >
                  <Input
                    placeholder="e.g. Medical Concierge (or Skin • Slimming • Precision Care)"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Footer Appointment Policy & Advisory Note</span>}
                  name="appointmentAdvisory"
                >
                  <Input
                    placeholder="e.g. Strictly by Scheduled Appointment"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                  <div className="font-serif-luxury font-bold text-aura-dark text-sm mb-3">
                    Social Media & Customer Support Concierge
                  </div>
                </div>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Official Facebook Page Link</span>}
                  name="facebookUrl"
                >
                  <Input
                    prefix={<FacebookFilled className="text-blue-600" />}
                    placeholder="e.g. https://facebook.com/auraclinicph"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Official Instagram Handle or Link</span>}
                  name="instagramHandle"
                >
                  <Input
                    prefix={<InstagramOutlined className="text-pink-600" />}
                    placeholder="e.g. @auraclinicph or https://instagram.com/auraclinicph"
                    className="!rounded-xl !py-2"
                  />
                </Form.Item>

                <div className="sm:col-span-2">
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Clinic About Story & Philosophy</span>}
                    name="aboutStory"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Share your clinic background, doctor certifications, and medical philosophy with your clients..."
                      className="!rounded-xl !py-2 text-xs"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Live Footer Preview Box */}
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Live Footer Preview (How it appears to clients)
                </div>
                <div className="max-w-md mx-auto space-y-1.5 py-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    <span className="w-4 h-4 rounded bg-aura-700 text-white font-serif-luxury font-bold text-[9px] inline-flex items-center justify-center">
                      {clinicProfile?.clinicName ? clinicProfile.clinicName.trim().charAt(0).toUpperCase() : 'A'}
                    </span>
                    <span className="font-serif-luxury font-bold text-gray-900">
                      {clinicProfile?.clinicName?.toUpperCase() || 'AURA AESTHETIC CLINIC'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600 text-[11px]">
                      {clinicProfile?.tagline || 'Medical Concierge'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {clinicProfile?.address || '3F Promenade Wing, Bonifacio High Street, BGC Taguig City'} • Concierge: {clinicProfile?.phone || '(02) 8812-AURA'}
                  </p>
                  <div className="pt-1.5 border-t border-gray-200/80 flex items-center justify-between text-[9px] text-gray-400">
                    <span>© {new Date().getFullYear()} {clinicProfile?.clinicName || 'Aura Aesthetic Clinic'}. All rights reserved.</span>
                    <span className="text-aura-700 font-medium">
                      {clinicProfile?.appointmentAdvisory || 'Strictly by Scheduled Appointment'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={savingProfile}
                  className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl !h-10 !px-6 !font-semibold text-sm shadow-sm"
                >
                  Save Clinic Profile
                </Button>
              </div>
            </Form>
          </Card>

          {/* System Data Safety & Records Backup */}
          <Card
            className="!rounded-2xl !border-aura-200 shadow-xs"
            title={
              <div className="flex items-center gap-2 py-1">
                <SafetyCertificateOutlined className="text-emerald-600 text-lg" />
                <span className="font-serif-luxury font-bold text-aura-dark text-base">
                  Database & System Safety
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-aura-50/70 border border-aura-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-aura-dark flex items-center gap-1.5">
                    <CheckCircleOutlined className="text-emerald-500" />
                    <span>Real-Time Local Storage Persistence</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    All client appointments ({appointments.length}), registered clients ({clients.length}), and vouchers are safely saved on your device.
                  </p>
                </div>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportBackup}
                  className="!rounded-xl !border-aura-300 !text-aura-800 hover:!border-aura-600 font-medium text-xs shrink-0"
                >
                  Export Backup JSON
                </Button>
              </div>

              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <SafetyCertificateOutlined className="text-emerald-600 text-sm" />
                  <span>Accidental Deletion Lock: Active & Protected</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Patient transaction records cannot be bulk-wiped to prevent accidental data loss.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Security PIN Change (1 col) */}
        <div className="space-y-6">
          <Card
            className="!rounded-2xl !border-aura-200 shadow-xs"
            title={
              <div className="flex items-center gap-2 py-1">
                <KeyOutlined className="text-aura-700 text-lg" />
                <span className="font-serif-luxury font-bold text-aura-dark text-base">
                  Change Security PIN
                </span>
              </div>
            }
          >
            <p className="text-xs text-gray-500 mb-4">
              Update the 4-digit secret PIN used to unlock this Admin Dashboard.
            </p>

            <Form
              form={pinForm}
              layout="vertical"
              onFinish={handleChangePin}
              requiredMark={false}
              className="space-y-3"
            >
              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Current Security PIN</span>}
                name="currentPin"
                rules={[{ required: true, message: 'Enter your current PIN' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="e.g. 1234"
                  maxLength={10}
                  className="!rounded-xl !py-2 font-mono text-center tracking-widest"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">New Security PIN</span>}
                name="newPin"
                rules={[
                  { required: true, message: 'Enter new 4-digit PIN' },
                  { min: 4, message: 'PIN must be at least 4 digits' }
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined className="text-aura-500" />}
                  placeholder="Enter 4-digit PIN"
                  maxLength={10}
                  className="!rounded-xl !py-2 font-mono text-center tracking-widest"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Confirm New Security PIN</span>}
                name="confirmPin"
                rules={[{ required: true, message: 'Confirm your new PIN' }]}
              >
                <Input.Password
                  prefix={<KeyOutlined className="text-aura-500" />}
                  placeholder="Re-enter new PIN"
                  maxLength={10}
                  className="!rounded-xl !py-2 font-mono text-center tracking-widest"
                />
              </Form.Item>

              {pinErrorMsg && (
                <Alert
                  type="error"
                  message={pinErrorMsg}
                  showIcon
                  className="!rounded-xl !py-1 text-xs"
                />
              )}

              {pinSuccessMsg && (
                <Alert
                  type="success"
                  message={pinSuccessMsg}
                  showIcon
                  className="!rounded-xl !py-1 text-xs"
                />
              )}

              <Button
                type="primary"
                htmlType="submit"
                block
                icon={<LockOutlined />}
                loading={changingPin}
                className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl !h-10 !font-semibold text-xs shadow-sm mt-2"
              >
                Update Security PIN
              </Button>
            </Form>

            <Divider className="!my-4" />

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1 text-amber-800 mb-1">
                <ExclamationCircleOutlined />
                <span>Emergency Recovery Code</span>
              </div>
              In case you forget your custom PIN, the clinic emergency override code is{' '}
              <span className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-950">aura2026</span>.
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <Card className="!rounded-2xl !border-aura-200 shadow-xs bg-gradient-to-br from-aura-50/50 to-white">
            <h4 className="font-serif-luxury font-bold text-aura-dark text-sm mb-2">
              System Environment
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono font-bold text-aura-800">2.0 Official</span>
              </div>
              <div className="flex justify-between">
                <span>Active Services:</span>
                <span className="font-bold text-gray-800">{services.filter(s => s.status === 'active').length} Treatments</span>
              </div>
              <div className="flex justify-between">
                <span>Client Database:</span>
                <span className="font-bold text-gray-800">{clients.length} Profiles</span>
              </div>
              <div className="flex justify-between">
                <span>Data Security:</span>
                <span className="text-emerald-600 font-bold">Encrypted & Persisted</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
