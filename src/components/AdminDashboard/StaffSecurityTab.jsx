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
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

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
          <div className="text-[10px] text-gray-400">Co-Admin Access</div>
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
            description="This will remove their co-admin access."
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
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-aura-900 via-aura-800 to-aura-950 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Staff & Co-Admin Security Hub
                </h2>
                <Tag color="gold" className="!rounded-full font-bold text-[10px]">
                  Owner Master Control
                </Tag>
              </div>
              <p className="text-xs text-aura-200 mt-0.5">
                Manage clinic staff logins, approve real-time OTP requests, and generate duty access passes.
              </p>
            </div>
          </div>

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setAddModalOpen(true)}
            className="!bg-amber-400 hover:!bg-amber-500 !text-amber-950 !border-none !rounded-xl font-bold !h-10 shadow-md sm:self-center shrink-0"
          >
            + Add Staff Member
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
            <span className="text-[10px] text-emerald-300">Co-admin access role</span>
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

      {/* SECTION 2: STAFF & CO-ADMIN DIRECTORY */}
      <Card
        className="!rounded-3xl border-aura-200 shadow-sm"
        title={
          <div className="flex items-center gap-2 font-serif-luxury text-base text-aura-dark">
            <TeamOutlined className="text-aura-700" />
            <span>Authorized Clinic Staff & Co-Admins</span>
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

      {/* SECTION 3: CLINIC DIRECTOR MASTER SETTINGS */}
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
              As Clinic Director, your Gmail and Master PIN have full override capabilities. Co-admins cannot view confidential revenue, delete records, or access this security tab.
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
            <span>Add New Co-Admin Staff Account</span>
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
