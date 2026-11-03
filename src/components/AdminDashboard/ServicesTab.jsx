import React, { useState } from 'react';
import { Table, Button, Input, Select, Tag, Switch, Popconfirm, message, Tooltip, Badge } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MedicineBoxOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import AddEditServiceModal from './AddEditServiceModal';

const { Option } = Select;

const CATEGORIES = [
  'All Services',
  'Hair Care & Scalp',
  'Facial',
  'Slimming',
  'Ingrown Removal',
  'Whitening',
  'Anti-Aging'
];

const ServicesTab = () => {
  const { services, toggleServiceStatus, deleteService } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesCat = selectedCategory === 'All Services' || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.category.toLowerCase().includes(search.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(search.toLowerCase()));

    const isActive = service.active !== false;
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = isActive;
    if (statusFilter === 'INACTIVE') matchesStatus = !isActive;

    return matchesCat && matchesSearch && matchesStatus;
  });

  const handleEdit = (service) => {
    setServiceToEdit(service);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setServiceToEdit(null);
    setModalOpen(true);
  };

  const handleDelete = (serviceId, name) => {
    deleteService(serviceId);
    message.success(`Deleted treatment "${name}"`);
  };

  const handleToggleActive = (serviceId, currentStatus, name) => {
    toggleServiceStatus(serviceId);
    if (currentStatus === false) {
      message.success(`"${name}" is now Active and available for booking!`);
    } else {
      message.info(`"${name}" is marked as Inactive (hidden from clients).`);
    }
  };

  const columns = [
    {
      title: 'Treatment Name',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image}
            alt={record.name}
            className="w-12 h-12 rounded-xl object-cover border border-aura-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-gray-900">{record.name}</span>
              {record.popular && (
                <Tag color="gold" className="!mr-0 text-[10px] font-bold px-1.5 py-0 rounded-full flex items-center gap-0.5">
                  <StarFilled className="text-[9px]" /> Top Treatment
                </Tag>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
              <Tag color="purple" className="!mr-0 text-[10px] !rounded-md">
                {record.category}
              </Tag>
              <span className="flex items-center gap-1">
                <ClockCircleOutlined /> {record.duration}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Pricing',
      key: 'price',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="font-serif-luxury font-bold text-sm text-aura-800">
            ₱{record.price.toLocaleString()}
          </div>
          {record.originalPrice && record.originalPrice > record.price && (
            <div className="text-[11px] text-gray-400 line-through">
              ₱{record.originalPrice.toLocaleString()}
            </div>
          )}
          {record.promoBadge && (
            <Tag color="rose" className="!bg-rose-50 !text-rose-600 !border-rose-200 text-[10px] !rounded-md mt-0.5">
              {record.promoBadge}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Booking Status',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const isActive = record.active !== false;
        return (
          <div className="flex items-center gap-2">
            <Switch
              size="small"
              checked={isActive}
              onChange={() => handleToggleActive(record.id, record.active, record.name)}
            />
            <span className={`text-xs font-semibold ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <Tooltip title="Edit Treatment Details & Price">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="!rounded-lg text-xs !border-aura-300 !text-aura-800"
            />
          </Tooltip>

          <Popconfirm
            title="Delete this service?"
            description="Are you sure you want to remove this treatment from clinic records?"
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Treatment">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="!rounded-lg text-xs"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      )
    }
  ];

  const activeCount = services.filter(s => s.active !== false).length;
  const inactiveCount = services.length - activeCount;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-aura-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-aura-100 text-aura-800 flex items-center justify-center text-base">
              <MedicineBoxOutlined />
            </div>
            <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-aura-dark">
              Services & Treatments Catalog
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Total {services.length} treatments • <strong className="text-emerald-600">{activeCount} active for booking</strong> • <strong className="text-gray-400">{inactiveCount} hidden/inactive</strong>
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold text-xs !h-9 shadow-xs w-full sm:w-auto"
        >
          Add New Treatment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-aura-200/90 shadow-xs space-y-3">
        {/* Category Pills (Swipeable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === category
                  ? 'bg-aura-700 text-white shadow-xs'
                  : 'bg-aura-50 text-gray-700 hover:bg-aura-100/60 border border-aura-200/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search & Status Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 border-t border-aura-100">
          <Input
            placeholder="Search treatment name, category, or description..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!rounded-xl !border-aura-200 w-full sm:w-80"
            allowClear
          />

          <div className="flex items-center gap-2 w-full sm:w-auto self-end">
            <span className="text-xs text-gray-400 hidden sm:inline">Status:</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="!rounded-xl w-full sm:w-40"
            >
              <Option value="ALL">All Treatments</Option>
              <Option value="ACTIVE">Active Only</Option>
              <Option value="INACTIVE">Inactive Only</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-aura-200/90 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} services` }}
          scroll={{ x: 650 }}
          className="aura-antd-table"
        />
      </div>

      {/* Add / Edit Modal */}
      <AddEditServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceToEdit={serviceToEdit}
      />
    </div>
  );
};

export default ServicesTab;
