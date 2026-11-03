import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Badge,
  Tooltip,
  Alert
} from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  KeyOutlined,
  CrownOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CopyOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  LinkOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { testRealEmailConnection } from '../../utils/otpMailer';

const StaffSecurityTab = () => {
  const {
    ownerProfile,
    updateOwnerProfile,
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    otpRequests,
    generateShiftPass,
    adminPin,
    changeAdminPin
  } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(null);
  const [generatedPassModal, setGeneratedPassModal] = useState(null);

  // Live Gmail Webhook state
  const [webhookUrl, setWebhookUrl] = useState(() => {
    try {
      return localStorage.getItem('aura_email_webhook_url') || '';
    } catch {
      return '';
    }
  });
  const [testingEmail, setTestingEmail] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const googleScriptTemplate = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = data.to || "edwarddufale3@gmail.com";
    var subject = data.subject || ("Aura Clinic OTP Code: " + data.otpCode);
    var otp = data.otpCode || "------";
    var staff = data.staffName || "Clinic Staff";
    var role = data.roleTitle || "Front Desk Co-Admin";
    var body = data.message || ("Aura Clinic Access OTP: " + otp);

    var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2d9d0; border-radius: 16px; padding: 24px; background: #ffffff;">' +
      '<div style="text-align: center; margin-bottom: 16px;">' +
        '<h2 style="color: #64313e; margin: 0; font-size: 22px; font-weight: bold;">AURA AESTHETIC CLINIC</h2>' +
        '<div style="font-size: 11px; color: #a38f85; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Security Access Alert</div>' +
      '</div>' +
      '<div style="background: #faf6f0; border-radius: 12px; padding: 14px; margin-bottom: 16px; border-left: 4px solid #b76e79;">' +
        '<div style="font-size: 13px; color: #444; margin-bottom: 4px;">Staff Login Authorization Request:</div>' +
        '<div style="font-size: 15px; font-weight: bold; color: #1f2937;">' + staff + '</div>' +
        '<div style="font-size: 12px; color: #6b7280;">' + role + '</div>' +
      '</div>' +
      '<div style="text-align: center; padding: 18px; background: #fff5f6; border-radius: 12px; border: 1px dashed #b76e79; margin-bottom: 16px;">' +
        '<div style="font-size: 11px; text-transform: uppercase; color: #881337; font-weight: bold; letter-spacing: 1px;">Your 6-Digit Staff Access Code</div>' +
        '<div style="font-size: 36px; font-family: monospace; font-weight: 900; color: #64313e; letter-spacing: 8px; margin: 10px 0;">' + otp + '</div>' +
        '<div style="font-size: 11px; color: #9f1239;">Valid for 10 minutes • Share only with duty staff</div>' +
      '</div>' +
      '<div style="font-size: 11px; color: #9ca3af; text-align: center;">Aura Aesthetic Medical Group • Owner Master System</div>' +
    '</div>';

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success", to: to }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleScriptTemplate);
    setCopiedScript(true);
    message.success('Google Apps Script code copied to clipboard!');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveWebhook = (url) => {
    const clean = (url || '').trim();
    setWebhookUrl(clean);
    try {
      localStorage.setItem('aura_email_webhook_url', clean);
      message.success('Gmail Webhook URL saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestEmail = async () => {
    if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
      message.warning('Please enter your Google Apps Script Web App URL first!');
      return;
    }
    setTestingEmail(true);
    try {
      const res = await testRealEmailConnection(webhookUrl, ownerProfile?.email || 'edwarddufale3@gmail.com');
      if (res.success) {
        message.success(res.message, 6);
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error(`Test failed: ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [ownerForm] = Form.useForm();

  // Active pending OTP requests
  const now = Date.now();
  const pendingRequests = (otpRequests || []).filter(
    r => r.status === 'pending' && r.expiresAt > now
  );

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(code);
    message.success(`Copied OTP Code: ${code}`);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const handleCreateStaff = (values) => {
    addStaffAccount(values);
    message.success(`Staff account for ${values.name} created!`);
    addForm.resetFields();
    setAddModalOpen(false);
  };

  const handleUpdateStaff = (values) => {
    if (!editStaff) return;
    updateStaffAccount(editStaff.id, values);
    message.success(`Staff account updated!`);
    setEditStaff(null);
  };

  const handleGeneratePass = (staffId) => {
    const pass = generateShiftPass(staffId);
    if (pass) {
      setGeneratedPassModal(pass);
      message.success(`12-Hour Shift Pass generated for ${pass.staffName}!`);
    }
  };

  const staffColumns = [
    {
      title: 'Staff Member',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aura-700 to-aura-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
            {record.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-xs sm:text-sm">{record.name}</div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <MailOutlined className="text-gray-400" />
              <span>{record.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Role & Department',
      key: 'roleTitle',
      render: (_, record) => (
        <div>
          <span className="font-semibold text-aura-900 text-xs">{record.roleTitle}</span>
          <div className="text-[10px] text-gray-400">Clinical Duty Access</div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag
          color={record.active ? 'success' : 'default'}
          className="!rounded-md text-[11px] font-semibold cursor-pointer"
          onClick={() => {
            updateStaffAccount(record.id, { active: !record.active });
            message.info(`${record.name} is now ${!record.active ? 'Active' : 'Deactivated'}`);
          }}
        >
          {record.active ? 'Active Staff' : 'Deactivated'}
        </Tag>
      )
    },
    {
      title: 'Daily Shift Pass',
      key: 'shiftPass',
      render: (_, record) => (
        <Button
          size="small"
          icon={<ThunderboltOutlined className="text-amber-600" />}
          onClick={() => handleGeneratePass(record.id)}
          className="!rounded-xl text-xs !border-amber-300 hover:!border-amber-500 !bg-amber-50/70 hover:!bg-amber-100 !text-amber-950 font-semibold"
        >
          Generate Shift OTP
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditStaff(record);
              editForm.setFieldsValue(record);
            }}
            className="!rounded-lg text-xs"
          />
          <Popconfirm
            title={`Delete ${record.name}?`}
            description="This will remove their clinical staff access."
            onConfirm={() => {
              deleteStaffAccount(record.id);
              message.success(`Staff removed.`);
            }}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="!rounded-lg text-xs"
            />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Controller Summary */}
      <div className="p-4 sm:p-6 rounded-3xl bg-aura-800 bg-gradient-to-r from-aura-900 via-aura-800 to-aura-700 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              👑
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Clinical Staff & Security Hub
                </h2>
                <Tag color="gold" className="!rounded-full font-bold text-[10px] !m-0">
                  Owner Master Control
                </Tag>
              </div>
              <p className="text-xs text-aura-100/90 mt-0.5">
                Manage clinic staff logins, approve real-time OTP requests, and generate duty access passes.
              </p>
            </div>
          </div>

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setAddModalOpen(true)}
            className="!bg-amber-400 hover:!bg-amber-500 !text-amber-950 !border-none !rounded-xl font-bold !h-10 px-5 shadow-md self-start sm:self-center shrink-0"
          >
            Add Specialist / Staff
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
            <span className="text-aura-300 block text-[11px]">Primary Clinic Director</span>
            <strong className="text-sm text-white font-bold block mt-0.5">
              {ownerProfile?.name || 'Dr. Aura Diaz Cano'}
            </strong>
            <span className="text-[10px] text-aura-200">{ownerProfile?.email}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
            <span className="text-aura-300 block text-[11px]">Authorized Staff Accounts</span>
            <strong className="text-sm text-white font-bold block mt-0.5">
              {staffAccounts.length} Registered ({staffAccounts.filter(s => s.active).length} Active)
            </strong>
            <span className="text-[10px] text-emerald-300">Authorized clinical role</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
            <span className="text-aura-300 block text-[11px]">Pending Login Requests</span>
            <strong className="text-sm text-white font-bold block mt-0.5 flex items-center gap-1.5">
              {pendingRequests.length > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-300">{pendingRequests.length} Waiting for Approval</span>
                </>
              ) : (
                <span className="text-emerald-300 font-normal">All clear (0 pending)</span>
              )}
            </strong>
            <span className="text-[10px] text-aura-200">Owner-only OTP validation</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: REAL-TIME PENDING STAFF OTP REQUESTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-aura-dark">
              Live Staff Login Requests (Awaiting Your OTP)
            </h3>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                Action Required
              </span>
            )}
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 text-center space-y-1">
            <div className="text-2xl">🛡️</div>
            <div className="text-xs font-bold text-gray-700">No Pending Staff Requests</div>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
              When a staff member attempts to log in from the clinic computer or phone, their one-time access code will appear here in real time for you to approve.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map(req => {
              const minutesLeft = Math.ceil((req.expiresAt - now) / 60000);
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        <strong className="text-sm text-gray-900">{req.staffName}</strong>
                      </div>
                      <div className="text-xs text-gray-500">{req.roleTitle} • {req.staffEmail}</div>
                    </div>
                    <Tag color="orange" className="font-mono text-xs font-bold">
                      Expires in {minutesLeft}m
                    </Tag>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-amber-50 to-aura-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                        Dr. Aura's Access Code for Staff:
                      </span>
                      <strong className="font-mono text-2xl font-black text-aura-900 tracking-widest">
                        {req.otpCode}
                      </strong>
                    </div>

                    <Button
                      type="primary"
                      icon={copiedOtp === req.otpCode ? <CheckOutlined /> : <CopyOutlined />}
                      onClick={() => handleCopyCode(req.otpCode)}
                      className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl font-bold text-xs !h-9 shadow-xs"
                    >
                      {copiedOtp === req.otpCode ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <span>💡 Give this 6-digit code to {req.staffName} via chat or text to grant duty access.</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: CLINICAL SPECIALISTS & STAFF DIRECTORY */}
      <Card
        className="!rounded-3xl border-aura-200 shadow-sm"
        title={
          <div className="flex items-center gap-2 font-serif-luxury text-base text-aura-dark">
            <TeamOutlined className="text-aura-700" />
            <span>Authorized Clinic Specialists & Duty Staff</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => setAddModalOpen(true)}
            className="!bg-aura-800 hover:!bg-aura-900 !rounded-xl font-semibold text-xs !h-8"
          >
            Add Staff
          </Button>
        }
      >
        <Table
          dataSource={staffAccounts}
          columns={staffColumns}
          rowKey="id"
          pagination={false}
          className="aura-antd-table"
        />
      </Card>

      {/* SECTION 3: DIRECT GMAIL INBOX DELIVERY */}
      <Card
        className="!rounded-3xl border-aura-200 shadow-sm overflow-hidden"
        title={
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 font-serif-luxury text-base text-aura-dark">
              <MailOutlined className="text-rose-600 shrink-0" />
              <span>Direct Gmail Inbox Delivery System</span>
            </div>
            {webhookUrl ? (
              <Tag color="success" className="!rounded-full font-bold text-[10px] !m-0 flex items-center gap-1 shrink-0">
                <CheckCircleFilled />
                <span>Live Inbox Webhook Active</span>
              </Tag>
            ) : (
              <Tag color="processing" className="!rounded-full font-bold text-[10px] !m-0 shrink-0">
                In-App Live Sync Active
              </Tag>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-aura-50/60 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  Recipient Gmail:
                </span>
                <Tag color="purple" className="font-mono font-bold text-xs !m-0">
                  {ownerProfile?.email || 'edwarddufale3@gmail.com'}
                </Tag>
              </div>
              <p className="text-[11px] text-gray-500">
                Whenever any staff member requests a login OTP, the 6-digit code will be delivered straight to this personal Gmail account.
              </p>
            </div>

            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={testingEmail}
              onClick={handleTestEmail}
              disabled={!webhookUrl}
              className="!bg-rose-700 hover:!bg-rose-800 !rounded-xl font-bold text-xs !h-9 shadow-xs shrink-0"
            >
              Send Test Real Email
            </Button>
          </div>

          {/* Webhook Configuration Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Google Apps Script Web App URL:
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="!rounded-xl font-mono text-xs"
                prefix={<LinkOutlined className="text-gray-400" />}
              />
              <Button
                type="primary"
                onClick={() => handleSaveWebhook(webhookUrl)}
                className="!bg-aura-800 hover:!bg-aura-900 !rounded-xl font-bold text-xs !h-9"
              >
                Save URL
              </Button>
            </div>
            <p className="text-[10px] text-gray-400">
              * Saved securely in your browser's private local clinic storage.
            </p>
          </div>

          {/* Setup Guide Collapsible */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <strong className="text-xs text-gray-800">
                  1-Minute Setup Guide: Free Google Apps Script Webhook
                </strong>
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="!text-aura-700 !font-bold text-xs"
              >
                {showSetupGuide ? 'Hide Instructions ▲' : 'Show 3-Step Setup ▼'}
              </Button>
            </div>

            {showSetupGuide && (
              <div className="space-y-3 pt-2 text-xs text-gray-600 border-t border-gray-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-aura-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong>Open Google Apps Script:</strong>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-aura-700 underline font-semibold">script.google.com</a> using your account (<code>{ownerProfile?.email || 'edwarddufale3@gmail.com'}</code>). Click <strong>"New project"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-aura-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong>Paste this 12-line script:</strong>
                      <Button
                        size="small"
                        icon={copiedScript ? <CheckOutlined /> : <CopyOutlined />}
                        onClick={handleCopyScript}
                        className="!rounded-lg text-[11px] font-bold !bg-white"
                      >
                        {copiedScript ? 'Copied Code!' : 'Copy Script Code'}
                      </Button>
                    </div>
                    <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
                      {googleScriptTemplate}
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-aura-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong>Deploy as Web App:</strong>
                    <ul className="text-[11px] text-gray-500 list-disc list-inside mt-0.5 space-y-0.5">
                      <li>Click <strong>Deploy → New deployment</strong></li>
                      <li>Click the gear icon (⚙️) next to "Select type" → choose <strong>Web app</strong></li>
                      <li>Set <em>Execute as:</em> <strong>Me ({ownerProfile?.email || 'edwarddufale3@gmail.com'})</strong></li>
                      <li>Set <em>Who has access:</em> <strong>Anyone</strong></li>
                      <li>Click <strong>Deploy</strong> → Authorize access → Copy the <strong>Web app URL</strong></li>
                      <li>Paste the URL above and click <strong>Save URL</strong>!</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 4: CLINIC DIRECTOR MASTER SETTINGS */}
      <Card
        className="!rounded-3xl border-aura-200 shadow-sm"
        title={
          <div className="flex items-center gap-2 font-serif-luxury text-base text-aura-dark">
            <CrownOutlined className="text-amber-600" />
            <span>Clinic Director Master Credentials</span>
          </div>
        }
      >
        <div className="max-w-xl space-y-4">
          <div className="p-3 rounded-2xl bg-aura-50/60 border border-aura-200 text-xs text-gray-600 space-y-1">
            <strong>Owner Authority Notice:</strong>
            <p>
              As Clinic Director, your Gmail and Master PIN have full override capabilities. Duty staff cannot view confidential revenue, delete records, or access this security tab.
            </p>
          </div>

          <Form
            layout="vertical"
            initialValues={ownerProfile}
            onFinish={(vals) => {
              updateOwnerProfile(vals);
              message.success('Clinic Director credentials updated!');
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                label={<span className="text-xs font-semibold">Director Full Name</span>}
                name="name"
                rules={[{ required: true }]}
              >
                <Input className="!rounded-xl" size="large" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold">Director Official Gmail</span>}
                name="email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input className="!rounded-xl" size="large" />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              className="!bg-aura-800 hover:!bg-aura-900 !rounded-xl font-bold !h-10 text-xs"
            >
              Save Director Profile
            </Button>
          </Form>
        </div>
      </Card>

      {/* MODAL: ADD STAFF ACCOUNT */}
      <Modal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        title={
          <div className="font-serif-luxury text-base font-bold text-aura-dark flex items-center gap-2">
            <UserAddOutlined className="text-aura-700" />
            <span>Register New Clinic Specialist / Staff</span>
          </div>
        }
        footer={null}
        centered
        width={440}
      >
        <Form form={addForm} layout="vertical" onFinish={handleCreateStaff} className="pt-2">
          <Form.Item
            label="Staff Full Name *"
            name="name"
            rules={[{ required: true, message: 'Please enter staff name' }]}
          >
            <Input placeholder="e.g., Jennifer Cruz" className="!rounded-xl" size="large" />
          </Form.Item>

          <Form.Item
            label="Staff Email *"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
          >
            <Input placeholder="e.g., jennifer.reception@auraclinic.com" className="!rounded-xl" size="large" />
          </Form.Item>

          <Form.Item
            label="Contact Number (Optional)"
            name="phone"
          >
            <Input placeholder="0917-000-0000" className="!rounded-xl" size="large" />
          </Form.Item>

          <Form.Item
            label="Role & Position *"
            name="roleTitle"
            initialValue="Front Desk Receptionist"
            rules={[{ required: true }]}
          >
            <Select size="large" className="w-full !rounded-xl">
              <Select.Option value="Front Desk Receptionist">Front Desk Receptionist</Select.Option>
              <Select.Option value="Senior Aesthetic Nurse">Senior Aesthetic Nurse</Select.Option>
              <Select.Option value="Aesthetician & Therapist">Aesthetician & Therapist</Select.Option>
              <Select.Option value="Clinic Supervisor">Clinic Supervisor</Select.Option>
            </Select>
          </Form.Item>

          <Alert
            message="Security Notice: New staff accounts can only log in when Dr. Aura provides a one-time OTP code."
            type="info"
            showIcon
            className="!rounded-xl text-xs mb-3"
          />

          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => setAddModalOpen(false)} className="!rounded-xl">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl font-bold"
            >
              Register Staff Member
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL: EDIT STAFF ACCOUNT */}
      <Modal
        open={Boolean(editStaff)}
        onCancel={() => setEditStaff(null)}
        title={
          <div className="font-serif-luxury text-base font-bold text-aura-dark flex items-center gap-2">
            <EditOutlined className="text-aura-700" />
            <span>Edit Staff Account</span>
          </div>
        }
        footer={null}
        centered
        width={440}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateStaff} className="pt-2">
          <Form.Item label="Staff Full Name" name="name" rules={[{ required: true }]}>
            <Input className="!rounded-xl" size="large" />
          </Form.Item>

          <Form.Item label="Staff Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input className="!rounded-xl" size="large" />
          </Form.Item>

          <Form.Item label="Contact Number" name="phone">
            <Input className="!rounded-xl" size="large" />
          </Form.Item>

          <Form.Item label="Role Title" name="roleTitle" rules={[{ required: true }]}>
            <Select size="large" className="w-full !rounded-xl">
              <Select.Option value="Front Desk Receptionist">Front Desk Receptionist</Select.Option>
              <Select.Option value="Senior Aesthetic Nurse">Senior Aesthetic Nurse</Select.Option>
              <Select.Option value="Aesthetician & Therapist">Aesthetician & Therapist</Select.Option>
              <Select.Option value="Clinic Supervisor">Clinic Supervisor</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button onClick={() => setEditStaff(null)} className="!rounded-xl">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl font-bold"
            >
              Update Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL: SHIFT PASS GENERATED */}
      <Modal
        open={Boolean(generatedPassModal)}
        onCancel={() => setGeneratedPassModal(null)}
        title={
          <div className="font-serif-luxury text-base font-bold text-aura-dark flex items-center gap-2">
            <ThunderboltOutlined className="text-amber-600" />
            <span>12-Hour Shift Pass Generated</span>
          </div>
        }
        footer={null}
        centered
        width={420}
      >
        {generatedPassModal && (
          <div className="space-y-4 pt-1 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-aura-50 border border-amber-200 space-y-2">
              <span className="text-xs text-gray-500 block">Duty Staff:</span>
              <strong className="text-base text-gray-900 block font-bold">
                {generatedPassModal.staffName}
              </strong>
              <div className="text-[10px] text-gray-400 font-mono">
                {generatedPassModal.staffEmail}
              </div>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                  Today's Shift Access OTP:
                </span>
                <strong className="font-mono text-3xl font-black text-aura-900 tracking-widest block py-1">
                  {generatedPassModal.otpCode}
                </strong>
                <span className="text-[10px] text-amber-700">
                  Valid for 12 hours from now
                </span>
              </div>
            </div>

            <Button
              type="primary"
              icon={copiedOtp === generatedPassModal.otpCode ? <CheckOutlined /> : <CopyOutlined />}
              onClick={() => handleCopyCode(generatedPassModal.otpCode)}
              block
              size="large"
              className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl font-bold text-sm !h-11 shadow-md"
            >
              {copiedOtp === generatedPassModal.otpCode ? 'Copied Code!' : 'Copy Code for Staff'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffSecurityTab;
