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
  DollarOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import CreateVoucherModal from './CreateVoucherModal';
import EditVoucherModal from './EditVoucherModal';

const { Option } = Select;
const { Text } = Typography;

const VoucherTrackerTab = ({ initialFilters }) => {
  const { vouchers, markVoucherAsRedeemed, updateVoucher, deleteVoucher } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.statusFilter || 'ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTargetVoucher, setEditTargetVoucher] = useState(null);

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
      title: 'Voucher Recipient / Mode',
      key: 'client',
      render: (_, record) => {
        const isPublic = record.voucherType === 'public' || record.clientName?.includes('Open to All') || record.clientPhone === 'Public Promo';
        const isClaimed = record.usedCount > 0 || record.status === 'Redeemed' || record.clientName?.includes('(Claimed)');

        if (isPublic && !isClaimed) {
          return (
            <div>
              <div className="flex items-center gap-1">
                <Tag color="blue" className="!rounded-md text-[11px] font-semibold !m-0">
                  ⚡ Public Promo
                </Tag>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
                Open to All • {record.maxUses || 1} {record.maxUses > 1 ? 'slots' : 'slot'}
              </div>
            </div>
          );
        }

        if (isPublic && isClaimed) {
          return (
            <div>
              <div className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                <span>🏆</span>
                <span>{record.clientName.replace(' (Claimed)', '')}</span>
              </div>
              <div className="text-[11px] text-gray-400">{record.clientPhone}</div>
              <Tag color="green" className="!rounded text-[10px] !mt-0.5 !mr-0">
                Claimed ({record.usedCount || 1}/{record.maxUses || 1})
              </Tag>
            </div>
          );
        }

        return (
          <div>
            <div className="font-bold text-xs text-gray-800">{record.clientName}</div>
            <div className="text-[11px] text-gray-400">{record.clientPhone}</div>
            <Tag color="purple" className="!rounded text-[10px] !mt-0.5 !mr-0">
              💎 Exclusive VIP
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'Applicable Treatment',
      dataIndex: 'serviceCategory',
      key: 'serviceCategory',
      render: (cat) => {
        if (!cat || cat === 'All Services') {
          return (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✨ All Services
            </span>
          );
        }
        if (cat.startsWith('Treatment: ')) {
          return (
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block max-w-[200px] truncate" title={cat}>
              💆‍♀️ {cat.replace('Treatment: ', '')}
            </span>
          );
        }
        return (
          <span className="text-xs font-medium text-aura-700 bg-aura-100/50 px-2 py-0.5 rounded border border-aura-200">
            📂 {cat}
          </span>
        );
      }
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
      width: 150,
      render: (status, record) => {
        const maxUses = record.maxUses || 1;
        const usedCount = record.usedCount || (status === 'Redeemed' ? 1 : 0);
        const isExhausted = status === 'Redeemed' || usedCount >= maxUses;

        if (isExhausted) {
          return (
            <div>
              <Tag color="default" className="!rounded-md !text-xs font-semibold bg-gray-100 text-gray-600 border-gray-300">
                Fully Claimed
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
          <div>
            <Tag color="gold" className="!rounded-md !text-xs font-medium">
              Available ({maxUses - usedCount} {maxUses - usedCount > 1 ? 'slots' : 'slot'})
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 230,
      render: (_, record) => (
        <Space size={6} wrap>
          {record.status !== 'Redeemed' ? (
            <Popconfirm
              title="Mark Voucher as Redeemed"
              description={`Verify that client ${record.clientName} is redeeming voucher ${record.code} now in the clinic?`}
              onConfirm={() => handleRedeem(record.code)}
              okText="Yes, Redeem"
              cancelText="Cancel"
              okButtonProps={{ className: '!bg-emerald-600' }}
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                className="!bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-lg text-xs font-semibold shadow-xs"
              >
                Redeem
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Reactivate Voucher"
              description={`Reopen voucher ${record.code} so clients can claim it again?`}
              onConfirm={() => {
                updateVoucher(record.code, { status: 'Unredeemed', usedCount: 0, redeemedDate: null });
                message.success(`Voucher ${record.code} reactivated and now available!`);
              }}
              okText="Yes, Reactivate"
              cancelText="Cancel"
            >
              <Button
                size="small"
                icon={<ReloadOutlined />}
                className="!border-emerald-600 !text-emerald-700 hover:!bg-emerald-50 !rounded-lg text-xs font-semibold"
              >
                Reactivate
              </Button>
            </Popconfirm>
          )}

          <Tooltip title="Edit Voucher (Discount Amount, Min Spend, Expiry)">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditTargetVoucher(record)}
              className="!rounded-lg text-xs !border-aura-400 !text-aura-800 hover:!bg-aura-50"
            >
              Edit
            </Button>
          </Tooltip>

          <Popconfirm
            title="Delete Voucher"
            description={`Are you sure you want to delete voucher ${record.code}?`}
            onConfirm={() => {
              deleteVoucher(record.code);
              message.success(`Voucher ${record.code} deleted.`);
            }}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Voucher">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="!rounded-lg text-xs hover:!bg-rose-50"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
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

      {/* Edit Voucher Modal */}
      <EditVoucherModal
        open={Boolean(editTargetVoucher)}
        onClose={() => setEditTargetVoucher(null)}
        voucher={editTargetVoucher}
      />
    </div>
  );
};

export default VoucherTrackerTab;
