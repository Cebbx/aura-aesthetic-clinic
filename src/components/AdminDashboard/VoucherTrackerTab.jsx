import React, { useState } from 'react';
import { Table, Tag, Button, Input, Select, Space, Tooltip, message, Popconfirm, Typography } from 'antd';
import {
  TagOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckOutlined,
  CopyOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import CreateVoucherModal from './CreateVoucherModal';

const { Option } = Select;
const { Text } = Typography;

const VoucherTrackerTab = ({ initialFilters }) => {
  const { vouchers, markVoucherAsRedeemed } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.statusFilter || 'ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter vouchers
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch =
      v.code?.toLowerCase().includes(search.toLowerCase()) ||
      v.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      v.serviceCategory?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRedeem = (code) => {
    markVoucherAsRedeemed(code);
    message.success(`Voucher ${code} successfully marked as REDEEMED!`);
  };

  const columns = [
    {
      title: 'Voucher Code',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-aura-800 bg-aura-50/90 px-2.5 py-1 rounded-lg border border-aura-200">
            {code}
          </span>
          <Tooltip title="Copy Voucher Code">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined className="text-gray-400 hover:text-aura-600" />}
              onClick={() => {
                navigator.clipboard.writeText(code);
                message.success(`Copied: ${code}`);
              }}
            />
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Client Name',
      key: 'client',
      render: (_, record) => (
        <div>
          <div className="font-bold text-xs text-gray-800">{record.clientName}</div>
          <div className="text-[11px] text-gray-400">{record.clientPhone}</div>
        </div>
      )
    },
    {
      title: 'Applicable Treatment',
      dataIndex: 'serviceCategory',
      key: 'serviceCategory',
      render: (cat) => (
        <span className="text-xs font-medium text-aura-700 bg-aura-100/50 px-2 py-0.5 rounded border border-aura-200">
          {cat}
        </span>
      )
    },
    {
      title: 'Discount & Min Spend',
      key: 'value',
      render: (_, record) => (
        <div>
          <div className="font-bold text-xs text-emerald-600">
            ₱{record.discountAmount?.toLocaleString()} OFF
          </div>
          <div className="text-[10px] text-gray-400">
            Min spend: ₱{record.minSpend?.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: 'Purchase & Expiry Date',
      key: 'dates',
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-gray-600">Issued: {record.purchaseDate}</div>
          <div className="text-[11px] text-gray-400">Valid til: {record.expiryDate}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status, record) => {
        if (status === 'Redeemed') {
          return (
            <div>
              <Tag color="green" className="!rounded-md !text-xs font-medium">
                Redeemed
              </Tag>
              {record.redeemedDate && (
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {record.redeemedDate}
                </div>
              )}
            </div>
          );
        }
        return (
          <Tag color="gold" className="!rounded-md !text-xs font-medium">
            Unredeemed
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 170,
      render: (_, record) => {
        if (record.status === 'Redeemed') {
          return (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <CheckCircleFilled className="text-emerald-500" />
              <span>Already Used</span>
            </span>
          );
        }

        return (
          <Popconfirm
            title="Mark Voucher as Redeemed"
            description={`Verify that client ${record.clientName} is redeeming voucher ${record.code} now in the clinic?`}
            onConfirm={() => handleRedeem(record.code)}
            okText="Yes, Mark Redeemed"
            cancelText="Cancel"
            okButtonProps={{ className: '!bg-aura-700' }}
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-lg text-xs font-semibold shadow-xs"
            >
              Mark as Redeemed
            </Button>
          </Popconfirm>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Tracker Controls */}
      <div className="bg-white p-4 rounded-2xl border border-aura-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Input
            placeholder="Search code, client name, service..."
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
            <Option value="ALL">All Vouchers</Option>
            <Option value="Unredeemed">Unredeemed Only</Option>
            <Option value="Redeemed">Redeemed Only</Option>
          </Select>
        </div>

        {/* Issue New Voucher Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
          className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold text-xs !h-9 shadow-xs w-full sm:w-auto"
        >
          Issue Promo Voucher
        </Button>
      </div>

      {/* Vouchers Antd Table */}
      <div className="bg-white rounded-2xl border border-aura-200/90 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredVouchers}
          rowKey="code"
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} vouchers` }}
          scroll={{ x: 800 }}
          className="aura-antd-table"
        />
      </div>

      {/* Create Voucher Modal */}
      <CreateVoucherModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default VoucherTrackerTab;
