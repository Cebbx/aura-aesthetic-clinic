import React, { useState } from 'react';
import { Table, Tag, Badge, Button, Input, Select, Space, Tooltip, Popconfirm, message } from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  PlusOutlined,
  FilterOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import AddAppointmentModal from './AddAppointmentModal';
import EditAppointmentModal from './EditAppointmentModal';
import ReceiptModal from '../ClientBooking/ReceiptModal';
import CancelAppointmentModal from './CancelAppointmentModal';
import SmsNotificationModal from './SmsNotificationModal';

const { Option } = Select;

const AppointmentsTab = ({ initialFilters }) => {
  const { appointments, updateAppointmentStatus, deleteAppointment } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.statusFilter || 'ALL');
  const [dateFilter, setDateFilter] = useState(initialFilters?.dateFilter || 'ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceiptApt, setSelectedReceiptApt] = useState(null);
  const [cancelModalApt, setCancelModalApt] = useState(null);
  const [smsModalApt, setSmsModalApt] = useState(null);
  const [smsModalMode, setSmsModalMode] = useState('approval');
  const [editModalApt, setEditModalApt] = useState(null);

  const todayStr = dayjs().format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

  // Filtered appointments
  const filteredData = appointments.filter(apt => {
    const matchesSearch =
      apt.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.phone?.includes(search) ||
      apt.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.id?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      matchesDate = apt.date === todayStr;
    } else if (dateFilter === 'TOMORROW') {
      matchesDate = apt.date === tomorrowStr;
    } else if (dateFilter === 'UPCOMING') {
      matchesDate = apt.date >= todayStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort: Latest / Newest transactions always at the top
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  // Columns definition using Antd Table
  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <span className="font-mono text-xs font-semibold text-aura-800 bg-aura-50 px-2 py-1 rounded border border-aura-200 whitespace-nowrap inline-block tracking-wider">
          {id}
        </span>
      )
    },
    {
      title: 'Client Information',
      key: 'client',
      render: (_, record) => (
        <div>
          <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
            <UserOutlined className="text-aura-500" />
            <span>{record.clientName}</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">{record.phone}</div>
          {record.notes && (
            <div className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 max-w-xs truncate border border-amber-200/60">
              Note: {record.notes}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Service Booked',
      key: 'service',
      render: (_, record) => (
        <div>
          <div className="font-medium text-xs text-gray-800">{record.serviceName}</div>
          <div className="text-[11px] text-aura-700 font-semibold mt-0.5">
            ₱{record.finalAmount?.toLocaleString()}
            {record.discountApplied > 0 && (
              <span className="text-emerald-600 font-normal ml-1 text-[10px]">
                (Saved ₱{record.discountApplied})
              </span>
            )}
          </div>
          {record.voucherUsed && (
            <Tag color="cyan" className="!text-[10px] !mt-1">
              Voucher: {record.voucherUsed}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Date & Time',
      key: 'schedule',
      render: (_, record) => {
        const isToday = record.date === todayStr;
        const isTomorrow = record.date === tomorrowStr;

        return (
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-800 font-medium">
              <CalendarOutlined className="text-aura-600" />
              <span>{record.date}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
              <ClockCircleOutlined className="text-gray-400" />
              <span className="font-semibold text-aura-800">{record.time}</span>
            </div>
            {isToday && (
              <Tag color="magenta" className="!text-[10px] !mt-1 font-bold animate-pulse block w-fit">
                ⏰ TODAY ({record.time})
              </Tag>
            )}
            {isTomorrow && (
              <Tag color="orange" className="!text-[10px] !mt-1 font-semibold block w-fit">
                📅 TOMORROW
              </Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status, record) => {
        let badgeStatus = 'default';
        let text = status;
        let color = '#d9d9d9';

        if (status === 'Confirmed') {
          badgeStatus = 'success';
          color = '#059669';
          text = 'Approved';
        } else if (status === 'Completed') {
          badgeStatus = 'default';
          color = '#64748b';
          text = 'Done';
        } else if (status === 'Cancelled') {
          badgeStatus = 'error';
          color = '#ef4444';
          text = 'Cancelled';
        } else {
          badgeStatus = 'warning';
          color = '#d97706';
          text = 'Pending';
        }

        return (
          <div>
            <Badge
              status={badgeStatus}
              text={
                <span className="text-xs font-semibold" style={{ color }}>
                  {text}
                </span>
              }
            />
            {status === 'Cancelled' && record.cancellationReason && (
              <Tooltip title={record.cancellationReason}>
                <div className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1 max-w-[130px] truncate cursor-help">
                  Reason: {record.cancellationReason}
                </div>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.status === 'Pending' && (
            <Button
              size="small"
              type="primary"
              className="!bg-emerald-600 hover:!bg-emerald-700 !border-none text-xs !rounded-lg font-semibold shadow-xs"
              onClick={() => {
                updateAppointmentStatus(record.id, 'Confirmed');
                message.success(`Appointment ${record.id} Approved! Client notification ready.`);
                setSmsModalMode('approval');
                setSmsModalApt({ ...record, status: 'Confirmed' });
              }}
            >
              Approve
            </Button>
          )}

          {record.status === 'Confirmed' && (
            <Button
              size="small"
              type="primary"
              className="!bg-slate-700 hover:!bg-slate-800 text-xs !rounded-lg"
              onClick={() => {
                updateAppointmentStatus(record.id, 'Completed');
                message.success(`Appointment ${record.id} marked as completed!`);
              }}
            >
              Mark Done
            </Button>
          )}

          <Tooltip title="Send 24-Hour / Today's Reminder to Client">
            <Button
              size="small"
              icon={<BellOutlined />}
              onClick={() => {
                setSmsModalMode('reminder');
                setSmsModalApt(record);
              }}
              className="!rounded-lg text-xs !border-amber-400 !text-amber-700 hover:!bg-amber-50"
            />
          </Tooltip>

          <Tooltip title="Notify Client (Gmail / SMS / Viber)">
            <Button
              size="small"
              icon={<MessageOutlined />}
              onClick={() => {
                setSmsModalMode('approval');
                setSmsModalApt(record);
              }}
              className="!rounded-lg text-xs !border-emerald-300 !text-emerald-700 hover:!bg-emerald-50"
            />
          </Tooltip>

          <Tooltip title="Edit Booking (Add or Remove Services, Reschedule)">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditModalApt(record)}
              className="!rounded-lg text-xs !border-aura-400 !text-aura-800 hover:!bg-aura-50"
            >
              Edit
            </Button>
          </Tooltip>

          <Tooltip title="View or Print Slip">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => setSelectedReceiptApt(record)}
              className="!rounded-lg text-xs !border-aura-300"
            />
          </Tooltip>

          {record.status !== 'Cancelled' && record.status !== 'Completed' && (
            <Button
              size="small"
              danger
              onClick={() => setCancelModalApt(record)}
              className="text-xs !rounded-lg"
            >
              Cancel
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="bg-white p-4 rounded-2xl border border-aura-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Input
            placeholder="Search client, phone, treatment..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!rounded-xl !border-aura-200 w-full sm:w-64"
            allowClear
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="!rounded-xl w-36"
          >
            <Option value="ALL">All Statuses</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Confirmed">Confirmed</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>

          <Select
            value={dateFilter}
            onChange={setDateFilter}
            className="!rounded-xl w-36"
          >
            <Option value="ALL">All Dates</Option>
            <Option value="TODAY">Today Only</Option>
            <Option value="TOMORROW">Tomorrow</Option>
            <Option value="UPCOMING">Upcoming</Option>
          </Select>
        </div>

        {/* Add Walk-in Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
          className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold text-xs !h-9 shadow-xs w-full sm:w-auto"
        >
          Add Walk-in Booking
        </Button>
      </div>

      {/* Appointments Antd Table */}
      <div className="bg-white rounded-2xl border border-aura-200/90 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={sortedData}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} appointments` }}
          scroll={{ x: 'max-content' }}
          className="aura-antd-table"
        />
      </div>

      {/* Modals */}
      <AddAppointmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditAppointmentModal
        open={Boolean(editModalApt)}
        onClose={() => setEditModalApt(null)}
        appointment={editModalApt}
      />

      <ReceiptModal
        open={!!selectedReceiptApt}
        onClose={() => setSelectedReceiptApt(null)}
        appointment={selectedReceiptApt}
      />

      <CancelAppointmentModal
        open={!!cancelModalApt}
        onClose={() => setCancelModalApt(null)}
        appointment={cancelModalApt}
      />

      <SmsNotificationModal
        open={!!smsModalApt}
        onClose={() => setSmsModalApt(null)}
        appointment={smsModalApt}
        defaultMode={smsModalMode}
      />
    </div>
  );
};

export default AppointmentsTab;
