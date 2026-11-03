import React, { useState } from 'react';
import { Table, Tag, Input, Button, Card, Modal, Descriptions, Radio, Space, Popconfirm, message, Select, Alert, Tooltip, Badge } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  CrownOutlined,
  StopOutlined,
  CheckCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const PRESET_BLOCK_REASONS = [
  'Repeated bogus bookings & unconfirmed requests',
  'Multiple unexcused no-shows without prior notice',
  'Abusive or disrespectful behavior to clinic staff',
  'Suspected fraudulent voucher or payment attempt',
  'Other / Custom clinic policy violation'
];

const ClientDatabaseTab = () => {
  const { clients, appointments, blockClient, unblockClient } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED'
  const [selectedClient, setSelectedClient] = useState(null);

  // Block modal state
  const [blockModalTarget, setBlockModalTarget] = useState(null);
  const [blockReasonPreset, setBlockReasonPreset] = useState(PRESET_BLOCK_REASONS[0]);
  const [blockRemarks, setBlockRemarks] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  // Stats
  const totalCount = clients.length;
  const activeCount = clients.filter(c => c.status !== 'blocked').length;
  const blockedCount = clients.filter(c => c.status === 'blocked').length;

  // Filter clients
  const filteredClients = clients.filter(c => {
    // Status filter
    if (statusFilter === 'ACTIVE' && c.status === 'blocked') return false;
    if (statusFilter === 'BLOCKED' && c.status !== 'blocked') return false;

    // Search query
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      c.email?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q) ||
      c.skinType?.toLowerCase().includes(q) ||
      c.blockedReason?.toLowerCase().includes(q)
    );
  });

  // Handle Confirm Block
  const handleConfirmBlock = () => {
    if (!blockModalTarget) return;

    const fullReason = blockRemarks.trim()
      ? `${blockReasonPreset} — ${blockRemarks.trim()}`
      : blockReasonPreset;

    setBlockLoading(true);
    setTimeout(() => {
      blockClient(blockModalTarget.id, fullReason);
      setBlockLoading(false);
      message.success(`Account for ${blockModalTarget.name} is now BLOCKED.`);
      
      // Update selectedClient if currently viewing modal
      if (selectedClient && selectedClient.id === blockModalTarget.id) {
        setSelectedClient(prev => ({
          ...prev,
          status: 'blocked',
          blockedReason: fullReason,
          blockedAt: new Date().toISOString()
        }));
      }

      setBlockModalTarget(null);
      setBlockRemarks('');
    }, 400);
  };

  // Handle Unblock
  const handleConfirmUnblock = (client) => {
    unblockClient(client.id);
    message.success(`Account for ${client.name} has been UNBLOCKED and restored to Active status.`);
    
    if (selectedClient && selectedClient.id === client.id) {
      setSelectedClient(prev => ({
        ...prev,
        status: 'active',
        blockedReason: null,
        blockedAt: null
      }));
    }
  };

  // Get appointments for a specific client
  const getClientAppointments = (client) => {
    if (!client) return [];
    const cleanPhone = client.phone?.replace(/\D/g, '');
    const cleanEmail = client.email?.toLowerCase().trim();

    return appointments.filter(a => {
      const aPhone = a.phone?.replace(/\D/g, '');
      const aEmail = a.email?.toLowerCase().trim();
      return (
        (cleanPhone && aPhone && (cleanPhone === aPhone || cleanPhone.endsWith(aPhone) || aPhone.endsWith(cleanPhone))) ||
        (cleanEmail && cleanEmail !== 'n/a' && aEmail === cleanEmail) ||
        a.clientName?.toLowerCase() === client.name?.toLowerCase()
      );
    });
  };

  const columns = [
    {
      title: 'Client ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <span className="font-mono text-xs text-gray-500 font-medium">{id}</span>
    },
    {
      title: 'Client Profile & Contact',
      key: 'profile',
      render: (_, record) => {
        const isBlocked = record.status === 'blocked';
        return (
          <div className="flex items-start gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                isBlocked
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-aura-100 text-aura-800 border border-aura-200'
              }`}
            >
              {record.name ? record.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="font-bold text-xs text-aura-dark flex items-center gap-1.5 flex-wrap">
                <span>{record.name}</span>
                {record.tier?.includes('VIP') && (
                  <CrownOutlined className="text-amber-500 text-xs" />
                )}
                {isBlocked && (
                  <Tag color="error" className="!rounded-md text-[10px] font-semibold flex items-center gap-1 !mr-0">
                    <StopOutlined />
                    <span>BLOCKED</span>
                  </Tag>
                )}
              </div>
              <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-mono">{record.phone}</span>
                {record.email && record.email !== 'N/A' && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[160px]">{record.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const isBlocked = record.status === 'blocked';
        if (isBlocked) {
          return (
            <Tooltip title={record.blockedReason || 'Suspended by admin'}>
              <div>
                <Tag color="error" className="!rounded-lg text-xs font-semibold flex items-center gap-1 w-fit cursor-help">
                  <StopOutlined />
                  <span>Blocked</span>
                </Tag>
                <div className="text-[10px] text-rose-700 truncate max-w-[120px] mt-0.5 font-medium">
                  {record.blockedReason || 'Suspended'}
                </div>
              </div>
            </Tooltip>
          );
        }
        return (
          <Tag color="success" className="!rounded-lg text-xs font-semibold flex items-center gap-1 w-fit">
            <CheckCircleOutlined />
            <span>Active</span>
          </Tag>
        );
      }
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      width: 110,
      render: (tier) => {
        let color = 'default';
        if (tier === 'VIP Gold') color = 'gold';
        else if (tier === 'VIP') color = 'purple';
        else if (tier === 'Regular') color = 'blue';
        else if (tier === 'Suspended') color = 'error';
        return <Tag color={color} className="!rounded-md text-xs">{tier}</Tag>;
      }
    },
    {
      title: 'Visits',
      dataIndex: 'totalVisits',
      key: 'totalVisits',
      width: 90,
      sorter: (a, b) => (a.totalVisits || 0) - (b.totalVisits || 0),
      render: (visits) => (
        <span className="font-semibold text-xs text-gray-800">
          {visits || 0} session{visits === 1 ? '' : 's'}
        </span>
      )
    },
    {
      title: 'Total Spend',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 120,
      sorter: (a, b) => (a.totalSpent || 0) - (b.totalSpent || 0),
      render: (val) => (
        <span className="font-bold text-xs text-aura-700">
          ₱{(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => {
        const isBlocked = record.status === 'blocked';
        return (
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedClient(record)}
              className="text-xs !border-aura-300 !text-aura-700 hover:!border-aura-600 !rounded-lg"
            >
              View
            </Button>

            {isBlocked ? (
              <Popconfirm
                title="Unblock this client account?"
                description={`This will restore ${record.name}'s ability to book online appointments.`}
                onConfirm={() => handleConfirmUnblock(record)}
                okText="Yes, Unblock"
                cancelText="Cancel"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<UnlockOutlined />}
                  className="text-xs !bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-lg font-semibold"
                >
                  Unblock
                </Button>
              </Popconfirm>
            ) : (
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => {
                  setBlockModalTarget(record);
                  setBlockReasonPreset(PRESET_BLOCK_REASONS[0]);
                  setBlockRemarks('');
                }}
                className="text-xs !rounded-lg font-medium"
              >
                Block
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  const clientHistory = selectedClient ? getClientAppointments(selectedClient) : [];

  return (
    <div className="space-y-4">
      {/* Search Header & Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-aura-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-aura-dark">
              Client & Patient Database
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              View registered client profiles, booking history, lifetime spend, or restrict/block delinquent accounts.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-aura-50 p-1 rounded-xl border border-aura-200/80 self-start sm:self-center">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-aura-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-aura-800'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('BLOCKED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'BLOCKED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-rose-700'
              }`}
            >
              <StopOutlined />
              <span>Blocked ({blockedCount})</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by client name, mobile (09XX), email, client ID..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!rounded-xl !border-aura-200 w-full sm:w-96 text-xs !py-2"
            allowClear
          />
          {blockedCount > 0 && statusFilter !== 'BLOCKED' && (
            <Tag color="error" className="!rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer" onClick={() => setStatusFilter('BLOCKED')}>
              <StopOutlined />
              <span>{blockedCount} Suspended Account{blockedCount > 1 ? 's' : ''}</span>
            </Tag>
          )}
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-2xl border border-aura-200/90 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} client profiles` }}
          scroll={{ x: 'max-content' }}
          className="aura-antd-table"
        />
      </div>

      {/* Block Account Modal */}
      <Modal
        open={!!blockModalTarget}
        onCancel={() => {
          setBlockModalTarget(null);
          setBlockRemarks('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setBlockModalTarget(null);
              setBlockRemarks('');
            }}
            className="!rounded-xl text-xs"
          >
            Cancel
          </Button>,
          <Button
            key="block"
            type="primary"
            danger
            icon={<StopOutlined />}
            loading={blockLoading}
            onClick={handleConfirmBlock}
            className="!rounded-xl text-xs font-semibold"
          >
            Block Client Account
          </Button>
        ]}
        title={
          <div className="flex items-center gap-2 text-rose-600 font-serif-luxury text-lg">
            <StopOutlined />
            <span>Block Client Account</span>
          </div>
        }
        centered
        width={480}
      >
        {blockModalTarget && (
          <div className="py-2 space-y-4">
            <Alert
              type="warning"
              showIcon
              message={`You are about to block ${blockModalTarget.name}`}
              description="Once blocked, this client cannot book appointments online using this phone number or email address."
              className="!rounded-xl text-xs"
            />

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <div><strong>Client Name:</strong> {blockModalTarget.name}</div>
              <div><strong>Phone Number:</strong> {blockModalTarget.phone}</div>
              {blockModalTarget.email && <div><strong>Email:</strong> {blockModalTarget.email}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Reason for Blocking:
              </label>
              <Select
                value={blockReasonPreset}
                onChange={setBlockReasonPreset}
                className="w-full !rounded-xl"
                options={PRESET_BLOCK_REASONS.map(r => ({ label: r, value: r }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Internal Remarks / Staff Notes (Optional):
              </label>
              <Input.TextArea
                rows={3}
                placeholder="e.g. Client booked 3 times this week but phone cannot be reached upon confirmation..."
                value={blockRemarks}
                onChange={(e) => setBlockRemarks(e.target.value)}
                className="!rounded-xl text-xs"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Client Detail Profile Modal */}
      {selectedClient && (
        <Modal
          open={!!selectedClient}
          onCancel={() => setSelectedClient(null)}
          footer={[
            selectedClient.status === 'blocked' ? (
              <Button
                key="unblock"
                type="primary"
                icon={<UnlockOutlined />}
                onClick={() => handleConfirmUnblock(selectedClient)}
                className="!bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-xl text-xs font-semibold"
              >
                Unblock Account
              </Button>
            ) : (
              <Button
                key="block"
                danger
                icon={<StopOutlined />}
                onClick={() => {
                  setBlockModalTarget(selectedClient);
                  setBlockReasonPreset(PRESET_BLOCK_REASONS[0]);
                  setBlockRemarks('');
                }}
                className="!rounded-xl text-xs font-semibold"
              >
                Block Account
              </Button>
            ),
            <Button
              key="close"
              onClick={() => setSelectedClient(null)}
              className="!rounded-xl text-xs"
            >
              Close Profile
            </Button>
          ]}
          title={
            <div className="font-serif-luxury text-xl font-bold text-aura-dark flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <UserOutlined className="text-aura-600" />
                <span>{selectedClient.name}</span>
              </div>
              {selectedClient.status === 'blocked' ? (
                <Tag color="error" className="!rounded-md text-xs font-semibold flex items-center gap-1">
                  <StopOutlined />
                  <span>BLOCKED</span>
                </Tag>
              ) : (
                <Tag color="success" className="!rounded-md text-xs font-semibold flex items-center gap-1">
                  <CheckCircleOutlined />
                  <span>ACTIVE</span>
                </Tag>
              )}
            </div>
          }
          centered
          width={580}
        >
          <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {selectedClient.status === 'blocked' && (
              <Alert
                type="error"
                showIcon
                message="Account Restricted by Administration"
                description={
                  <div className="text-xs space-y-1 mt-1">
                    <div><strong>Reason:</strong> {selectedClient.blockedReason || 'Clinic policy violation'}</div>
                    {selectedClient.blockedAt && (
                      <div className="text-gray-500"><strong>Blocked On:</strong> {selectedClient.blockedAt}</div>
                    )}
                  </div>
                }
                className="!rounded-xl"
              />
            )}

            <Descriptions column={2} bordered size="small" className="text-xs">
              <Descriptions.Item label="Client ID">{selectedClient.id}</Descriptions.Item>
              <Descriptions.Item label="Membership Tier">
                <Tag color={selectedClient.tier?.includes('VIP') ? 'gold' : 'blue'}>
                  {selectedClient.tier}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Number">{selectedClient.phone}</Descriptions.Item>
              <Descriptions.Item label="Email Address">{selectedClient.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Total Visits">{selectedClient.totalVisits || 0} sessions</Descriptions.Item>
              <Descriptions.Item label="Lifetime Spend">
                <span className="font-bold text-aura-700">₱{(selectedClient.totalSpent || 0).toLocaleString()}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Skin Classification" span={2}>
                {selectedClient.skinType || 'Standard Consult'}
              </Descriptions.Item>
              <Descriptions.Item label="Clinic Notes" span={2}>
                {selectedClient.notes || 'None on file.'}
              </Descriptions.Item>
            </Descriptions>

            {/* Appointment History for this client */}
            <div>
              <h4 className="font-serif-luxury font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Booking History ({clientHistory.length} Record{clientHistory.length === 1 ? '' : 's'})
              </h4>
              {clientHistory.length === 0 ? (
                <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-100">
                  No previous online booking records found for this phone number.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {clientHistory.map(apt => (
                    <div
                      key={apt.id}
                      className="p-2.5 rounded-xl border border-aura-200/80 bg-aura-50/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-aura-dark flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-aura-700 bg-white px-1.5 py-0.2 rounded border border-aura-200">
                            {apt.id}
                          </span>
                          <span>{apt.serviceName}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                          <CalendarOutlined className="text-gray-400" />
                          <span>{apt.date} at {apt.time}</span>
                          <span>•</span>
                          <span className="font-bold text-aura-800">₱{apt.finalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <Tag
                          color={
                            apt.status === 'Confirmed' ? 'success' :
                            apt.status === 'Pending' ? 'warning' :
                            apt.status === 'Cancelled' ? 'error' : 'default'
                          }
                          className="!rounded-md text-[10px] font-semibold"
                        >
                          {apt.status === 'Confirmed' ? 'Approved' : apt.status}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientDatabaseTab;
