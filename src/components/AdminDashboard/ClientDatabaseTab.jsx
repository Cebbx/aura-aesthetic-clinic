import React, { useState } from 'react';
import {
  Table,
  Tag,
  Input,
  Button,
  Card,
  Modal,
  Descriptions,
  Space,
  Popconfirm,
  message,
  Select,
  Alert,
  Tooltip,
  Badge,
  Form,
  DatePicker
} from 'antd';
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
  EyeOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  PlusOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { TextArea } = Input;

const PRESET_BLOCK_REASONS = [
  'Repeated bogus bookings & unconfirmed requests',
  'Multiple unexcused no-shows without prior notice',
  'Abusive or disrespectful behavior to clinic staff',
  'Suspected fraudulent voucher or payment attempt',
  'Other / Custom clinic policy violation'
];

const ClientDatabaseTab = () => {
  const {
    clients,
    appointments,
    blockClient,
    unblockClient,
    addClinicalNote,
    services,
    currentStaffUser,
    ownerProfile
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED'
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('emr'); // 'overview' | 'emr' | 'history'

  // Block modal state
  const [blockModalTarget, setBlockModalTarget] = useState(null);
  const [blockReasonPreset, setBlockReasonPreset] = useState(PRESET_BLOCK_REASONS[0]);
  const [blockRemarks, setBlockRemarks] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  // New Clinical Note Modal State
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteForm] = Form.useForm();

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
      setBlockModalTarget(null);
      setBlockRemarks('');
      message.error(`Account of ${blockModalTarget.name} has been restricted/blocked.`);

      if (selectedClient && selectedClient.id === blockModalTarget.id) {
        setSelectedClient(prev => ({
          ...prev,
          status: 'blocked',
          blockedReason: fullReason,
          blockedAt: dayjs().format('YYYY-MM-DD HH:mm')
        }));
      }
    }, 300);
  };

  // Handle Confirm Unblock
  const handleConfirmUnblock = (client) => {
    unblockClient(client.id);
    message.success(`Account of ${client.name} has been restored to Active.`);
    if (selectedClient && selectedClient.id === client.id) {
      setSelectedClient(prev => ({
        ...prev,
        status: 'active',
        blockedReason: null,
        blockedAt: null
      }));
    }
  };

  // Handle Save Clinical Note
  const handleSaveClinicalNote = (values) => {
    if (!selectedClient) return;

    const payload = {
      ...values,
      nextSessionDate: values.nextSessionDate ? values.nextSessionDate.format('YYYY-MM-DD') : ''
    };

    const res = addClinicalNote(selectedClient.id, payload);
    if (res.success) {
      message.success('Clinical treatment note documented into EMR!');
      // Update local selected client state
      setSelectedClient(prev => ({
        ...prev,
        clinicalNotes: [res.note, ...(prev.clinicalNotes || [])]
      }));
      noteForm.resetFields();
      setIsAddNoteModalOpen(false);
    }
  };

  // Helper to get matching appointments for client
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
      title: 'Patient ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <span className="font-mono text-xs text-gray-500 font-medium">{id}</span>
    },
    {
      title: 'Patient Profile & Medical Contact',
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
              {record.name ? record.name.charAt(0).toUpperCase() : 'P'}
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
      title: 'EMR Notes',
      key: 'clinicalNotes',
      width: 110,
      render: (_, record) => {
        const noteCount = record.clinicalNotes?.length || 0;
        return (
          <Tag
            color={noteCount > 0 ? 'purple' : 'default'}
            className="!rounded-md text-[11px] font-semibold"
          >
            🩺 {noteCount} {noteCount === 1 ? 'Note' : 'Notes'}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const isBlocked = record.status === 'blocked';
        return isBlocked ? (
          <Tag color="error" className="!rounded-md text-xs font-semibold flex items-center gap-1 w-fit">
            <StopOutlined />
            <span>Restricted</span>
          </Tag>
        ) : (
          <Tag color="success" className="!rounded-md text-xs font-semibold flex items-center gap-1 w-fit">
            <CheckCircleOutlined />
            <span>Active</span>
          </Tag>
        );
      }
    },
    {
      title: 'Skin Assessment',
      dataIndex: 'skinType',
      key: 'skinType',
      render: (skin) => (
        <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
          {skin || 'Consult Pending'}
        </span>
      )
    },
    {
      title: 'Total Visits',
      dataIndex: 'totalVisits',
      key: 'totalVisits',
      width: 100,
      render: (v) => <span className="font-semibold text-xs text-gray-700">{v || 0} visits</span>
    },
    {
      title: 'Lifetime Value',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 130,
      render: (spent) => (
        <span className="font-bold text-xs text-aura-800">
          ₱{(spent || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => {
        const isBlocked = record.status === 'blocked';
        return (
          <Space size="small">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedClient(record);
                setActiveDetailTab('emr');
              }}
              className="text-xs !rounded-lg font-semibold !border-aura-300 hover:!border-aura-700 !text-aura-900"
            >
              EMR Chart
            </Button>
            {isBlocked ? (
              <Popconfirm
                title={`Restore ${record.name}?`}
                description="This client will be allowed to book treatments again."
                onConfirm={() => handleConfirmUnblock(record)}
                okText="Restore"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<UnlockOutlined />}
                  className="text-xs !rounded-lg font-medium !bg-emerald-600 hover:!bg-emerald-700 !border-none"
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
  const clientNotes = selectedClient?.clinicalNotes || [];

  return (
    <div className="space-y-4">
      {/* Search Header & Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-aura-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-luxury text-lg font-bold text-aura-dark">
                Patients & EMR Records Hub
              </h3>
              <Tag color="purple" className="!rounded-full font-bold text-[10px]">
                Medical EMR
              </Tag>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive Electronic Medical Records (EMR), Clinical Treatment Notes, Skin Diagnoses, and Lifetime Patient History.
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
              All Patients ({totalCount})
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
              <span>Restricted ({blockedCount})</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by patient name, mobile (09XX), email, patient ID, or skin type..."
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

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-aura-200/90 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} patient medical profiles` }}
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
            Restrict Patient Access
          </Button>
        ]}
        title={
          <div className="flex items-center gap-2 text-rose-600 font-serif-luxury text-lg">
            <StopOutlined />
            <span>Restrict Patient Account</span>
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
              message={`You are about to restrict ${blockModalTarget.name}`}
              description="Once restricted, this patient cannot book appointments online using this phone number or email address."
              className="!rounded-xl text-xs"
            />

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <div><strong>Patient Name:</strong> {blockModalTarget.name}</div>
              <div><strong>Phone Number:</strong> {blockModalTarget.phone}</div>
              {blockModalTarget.email && <div><strong>Email:</strong> {blockModalTarget.email}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Reason for Restriction:
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
                Internal Remarks / Clinical Notes (Optional):
              </label>
              <TextArea
                rows={3}
                placeholder="Add confidential clinic remarks (visible only to Dr. Aura and duty staff)..."
                value={blockRemarks}
                onChange={(e) => setBlockRemarks(e.target.value)}
                className="!rounded-xl text-xs"
                maxLength={200}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>

      {/* PATIENT EMR & MEDICAL CHART MODAL */}
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
                Restore Account
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
                Restrict Account
              </Button>
            ),
            <Button
              key="close"
              onClick={() => setSelectedClient(null)}
              className="!rounded-xl text-xs"
            >
              Close Chart
            </Button>
          ]}
          title={
            <div className="font-serif-luxury text-base sm:text-xl font-bold text-aura-dark flex flex-wrap items-center justify-between gap-2 pr-8">
              <div className="flex items-center gap-2">
                <MedicineBoxOutlined className="text-aura-700 shrink-0" />
                <span>Patient Medical Chart: {selectedClient.name}</span>
              </div>
              {selectedClient.status === 'blocked' ? (
                <Tag color="error" className="!rounded-md text-xs font-semibold !m-0 flex items-center gap-1 shrink-0">
                  <StopOutlined />
                  <span>RESTRICTED</span>
                </Tag>
              ) : (
                <Tag color="success" className="!rounded-md text-xs font-semibold !m-0 flex items-center gap-1 shrink-0">
                  <CheckCircleOutlined />
                  <span>ACTIVE PATIENT</span>
                </Tag>
              )}
            </div>
          }
          centered
          width={680}
        >
          <div className="mt-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {selectedClient.status === 'blocked' && (
              <Alert
                type="error"
                showIcon
                message="Account Restricted by Administration"
                description={
                  <div className="text-xs space-y-1 mt-1">
                    <div><strong>Reason:</strong> {selectedClient.blockedReason || 'Clinic policy violation'}</div>
                    {selectedClient.blockedAt && (
                      <div className="text-gray-500"><strong>Restricted On:</strong> {selectedClient.blockedAt}</div>
                    )}
                  </div>
                }
                className="!rounded-xl"
              />
            )}

            {/* Segmented Tab Navigation for Modal */}
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveDetailTab('emr')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'emr'
                    ? 'bg-white text-aura-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <MedicineBoxOutlined className={activeDetailTab === 'emr' ? 'text-aura-700' : ''} />
                <span>Clinical Notes ({clientNotes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('overview')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'overview'
                    ? 'bg-white text-aura-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserOutlined className={activeDetailTab === 'overview' ? 'text-aura-700' : ''} />
                <span>Patient Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('history')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'history'
                    ? 'bg-white text-aura-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <HistoryOutlined className={activeDetailTab === 'history' ? 'text-aura-700' : ''} />
                <span>Appointments ({clientHistory.length})</span>
              </button>
            </div>

            {/* TAB 1: CLINICAL TREATMENT NOTES (EMR) */}
            {activeDetailTab === 'emr' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif-luxury font-bold text-sm text-gray-900">
                      Attending Specialist Treatment Logs
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Document machine settings, skin reactions, and prescribed aftercare protocols.
                    </p>
                  </div>

                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      noteForm.resetFields();
                      setIsAddNoteModalOpen(true);
                    }}
                    className="!bg-aura-800 hover:!bg-aura-900 !rounded-xl font-bold text-xs !h-8"
                  >
                    Log Session Note
                  </Button>
                </div>

                {clientNotes.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-2">
                    <div className="text-3xl">🩺</div>
                    <div className="text-xs font-bold text-gray-700">No Clinical Treatment Notes Yet</div>
                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                      Attending physicians and duty nurses can document laser joules, needle depths, chemical concentrations, and patient tolerance here.
                    </p>
                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => setIsAddNoteModalOpen(true)}
                      className="!rounded-xl text-xs font-semibold"
                    >
                      Document First Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientNotes.map(note => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-white to-aura-50/30 border border-aura-200/90 shadow-xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-aura-100 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Tag color="purple" className="!rounded-md font-bold text-[10px]">
                                {note.sessionNumber || 'Session Log'}
                              </Tag>
                              <strong className="text-xs text-gray-900">{note.procedureName}</strong>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Clinician: <strong>{note.specialistName}</strong> ({note.specialistRole})
                            </div>
                          </div>
                          <Tag color="default" className="font-mono text-[10px] self-start sm:self-center">
                            ⏱️ {note.date}
                          </Tag>
                        </div>

                        {/* Machine Parameters */}
                        {note.machineSettings && (
                          <div className="p-2 rounded-xl bg-cyan-50/70 border border-cyan-200 text-[11px] text-cyan-950 flex items-start gap-1.5">
                            <span className="font-bold shrink-0">⚙️ Protocol & Settings:</span>
                            <span>{note.machineSettings}</span>
                          </div>
                        )}

                        {/* Observations */}
                        {note.skinObservations && (
                          <div className="text-xs text-gray-700 space-y-0.5">
                            <span className="font-semibold text-gray-500 text-[11px] block">Skin Response & Clinical Observations:</span>
                            <p className="text-[11px] bg-white p-2 rounded-xl border border-gray-200 text-gray-800 leading-relaxed">
                              {note.skinObservations}
                            </p>
                          </div>
                        )}

                        {/* Prescribed Care & Next Session */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px]">
                          {note.prescribedCare && (
                            <div className="text-emerald-900 font-medium">
                              💊 <strong>Prescribed Homecare:</strong> {note.prescribedCare}
                            </div>
                          )}
                          {note.nextSessionDate && (
                            <Tag color="gold" className="!rounded-lg text-[10px] font-semibold self-start sm:self-center">
                              📅 Next Recommended: {note.nextSessionDate}
                            </Tag>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PATIENT OVERVIEW */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-4">
                <Descriptions column={2} bordered size="small" className="text-xs">
                  <Descriptions.Item label="Patient ID">{selectedClient.id}</Descriptions.Item>
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
                    <span className="font-semibold text-aura-900">{selectedClient.skinType || 'Standard Consult'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="General Medical Notes" span={2}>
                    {selectedClient.notes || 'None on file.'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* TAB 3: APPOINTMENT HISTORY */}
            {activeDetailTab === 'history' && (
              <div>
                <h4 className="font-serif-luxury font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Booking History ({clientHistory.length} Record{clientHistory.length === 1 ? '' : 's'})
                </h4>
                {clientHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-100">
                    No previous online booking records found for this phone number.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
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
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: DOCUMENT NEW CLINICAL NOTE */}
      <Modal
        open={isAddNoteModalOpen}
        onCancel={() => setIsAddNoteModalOpen(false)}
        title={
          <div className="font-serif-luxury text-base font-bold text-aura-dark flex items-center gap-2">
            <MedicineBoxOutlined className="text-aura-700" />
            <span>Document Clinical Treatment Session Note</span>
          </div>
        }
        footer={null}
        centered
        width={500}
      >
        <Form
          form={noteForm}
          layout="vertical"
          onFinish={handleSaveClinicalNote}
          initialValues={{
            sessionNumber: 'Session 1',
            specialistName: currentStaffUser?.name || ownerProfile?.name || 'Dr. Aura Diaz Cano',
            specialistRole: currentStaffUser?.roleTitle || 'Clinic Director'
          }}
          className="pt-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label="Attending Specialist"
              name="specialistName"
              rules={[{ required: true }]}
            >
              <Input className="!rounded-xl" />
            </Form.Item>

            <Form.Item
              label="Specialist Role"
              name="specialistRole"
              rules={[{ required: true }]}
            >
              <Input className="!rounded-xl" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label="Procedure Performed *"
              name="procedureName"
              rules={[{ required: true, message: 'Please select or enter procedure' }]}
            >
              <Select
                showSearch
                placeholder="Choose treatment..."
                className="w-full !rounded-xl"
              >
                {services.map(s => (
                  <Select.Option key={s.id} value={s.name}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Session Tracking *"
              name="sessionNumber"
              rules={[{ required: true }]}
            >
              <Select className="w-full !rounded-xl">
                <Select.Option value="Consultation & Assessment">Consultation & Assessment</Select.Option>
                <Select.Option value="Session 1">Session 1</Select.Option>
                <Select.Option value="Session 2">Session 2</Select.Option>
                <Select.Option value="Session 3">Session 3</Select.Option>
                <Select.Option value="Session 4">Session 4</Select.Option>
                <Select.Option value="Session 5 (Final)">Session 5 (Final)</Select.Option>
                <Select.Option value="Maintenance / Touch-up">Maintenance / Touch-up</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Machine Parameters & Energy Settings"
            name="machineSettings"
            tooltip="Laser fluence, needle depth, chemical percentage, passes"
          >
            <Input
              placeholder="e.g., Pico 1064nm, 2.4J energy, 10Hz, 3 passes"
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item
            label="Clinical Observations & Skin Tolerance *"
            name="skinObservations"
            rules={[{ required: true, message: 'Please record skin reaction/tolerance' }]}
          >
            <TextArea
              rows={3}
              placeholder="Record patient skin erythema, tolerance, target pigmentation response, pain level..."
              className="!rounded-xl text-xs"
            />
          </Form.Item>

          <Form.Item
            label="Prescribed Aftercare & Home Regimen"
            name="prescribedCare"
          >
            <Input
              placeholder="e.g., Barrier Relief Balm 2x daily, strict SPF 50+, avoid retinol for 5 days"
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item
            label="Next Recommended Session Date"
            name="nextSessionDate"
          >
            <DatePicker className="w-full !rounded-xl" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button onClick={() => setIsAddNoteModalOpen(false)} className="!rounded-xl">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl font-bold"
            >
              Save to Patient EMR
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientDatabaseTab;
