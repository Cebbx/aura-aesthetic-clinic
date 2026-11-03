import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Tag, Badge, Tooltip } from 'antd';
import {
  SearchOutlined,
  CheckCircleFilled,
  PlusOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  CloseOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const CATEGORIES = ['All Services', 'Facial', 'Hair Care & Scalp', 'Slimming', 'Ingrown Removal', 'Whitening', 'Anti-Aging'];

const AddChangeServicesModal = ({
  open,
  onClose,
  selectedServices = [],
  onSave,
  onGoToCatalog
}) => {
  const { services } = useApp();
  const [tempSelected, setTempSelected] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tempSelected with selectedServices when modal opens
  useEffect(() => {
    if (open) {
      setTempSelected(Array.isArray(selectedServices) ? [...selectedServices] : []);
      setSelectedCategory('All Services');
      setSearchQuery('');
    }
  }, [open, selectedServices]);

  const handleToggle = (service) => {
    if (!service || !service.id) return;
    setTempSelected(prev => {
      const exists = prev.some(s => s && s.id === service.id);
      if (exists) {
        return prev.filter(s => s && s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleApply = () => {
    if (tempSelected.length === 0) {
      return;
    }
    if (onSave) {
      onSave(tempSelected);
    }
    onClose();
  };

  const activeServices = (services || []).filter(s => s && s.active !== false);

  const filteredServices = activeServices.filter(s => {
    const matchesCat = selectedCategory === 'All Services' || s.category === selectedCategory;
    const nameStr = (s.name || '').toLowerCase();
    const catStr = (s.category || '').toLowerCase();
    const search = searchQuery.toLowerCase();
    const matchesSearch = nameStr.includes(search) || catStr.includes(search);
    return matchesCat && matchesSearch;
  });

  const totalTempPrice = tempSelected.reduce((sum, s) => sum + (Number(s?.price) || 0), 0);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className="aura-modal"
      title={null}
      destroyOnClose
    >
      <div className="space-y-4 pt-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-aura-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-aura-100 text-aura-800 text-[11px] font-semibold mb-1">
              <AppstoreOutlined />
              <span>Customize Treatments</span>
            </div>
            <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-aura-dark">
              Add or Change Treatments
            </h3>
            <p className="text-xs text-gray-500">
              Select one or multiple services to include in this appointment session.
            </p>
          </div>

          {onGoToCatalog && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToCatalog();
              }}
              className="text-xs font-semibold text-aura-600 hover:text-aura-800 flex items-center gap-1 hover:underline cursor-pointer shrink-0 pt-1"
            >
              <span>Full Catalog</span>
              <RightOutlined className="text-[10px]" />
            </button>
          )}
        </div>

        {/* Categories & Search */}
        <div className="space-y-2.5">
          <Input
            placeholder="Search treatment name..."
            prefix={<SearchOutlined className="text-aura-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="rounded-full !border-aura-200 py-1.5 text-xs"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-aura-700 text-white shadow-xs'
                    : 'bg-white hover:bg-aura-50 border border-aura-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredServices.map(srv => {
            const isChecked = tempSelected.some(s => s.id === srv.id);

            return (
              <div
                key={srv.id}
                onClick={() => handleToggle(srv)}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-aura-50/80 border-aura-600 ring-1 ring-aura-600/40 shadow-xs'
                    : 'bg-white border-aura-200/80 hover:border-aura-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-aura-100 shrink-0 border border-aura-200">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-full h-full object-cover"
                    />
                    {isChecked && (
                      <div className="absolute inset-0 bg-aura-900/40 flex items-center justify-center text-white">
                        <CheckCircleFilled className="text-sm" />
                      </div>
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-aura-dark truncate">
                        {srv.name}
                      </span>
                      {srv.popular && (
                        <Tag color="gold" className="!text-[9px] !leading-3 !px-1.5 !rounded-full !m-0">
                          Popular
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>{srv.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ClockCircleOutlined className="text-[10px]" />
                        {srv.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Toggle Checkbox */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm text-aura-800 block">
                      ₱{Number(srv.price).toLocaleString()}
                    </span>
                    {srv.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₱{Number(srv.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all text-xs ${
                      isChecked
                        ? 'bg-aura-600 border-aura-600 text-white shadow-xs'
                        : 'border-aura-300 bg-white text-transparent hover:border-aura-500'
                    }`}
                  >
                    <CheckCircleFilled className={isChecked ? 'opacity-100' : 'opacity-0'} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-xs">
              No treatments found matching your filter.
            </div>
          )}
        </div>

        {/* Footer Summary & Save Bar */}
        <div className="pt-3 border-t border-aura-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Selected:</span>
              <span className="font-bold text-xs text-aura-800 bg-aura-100 px-2 py-0.5 rounded-full">
                {tempSelected.length} {tempSelected.length === 1 ? 'treatment' : 'treatments'}
              </span>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-xs text-gray-600">Total: </span>
              <span className="font-serif-luxury font-bold text-sm sm:text-base text-aura-800">
                ₱{totalTempPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onClose}
              className="!rounded-xl text-xs flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={tempSelected.length === 0}
              onClick={handleApply}
              className="!bg-aura-700 hover:!bg-aura-800 !border-aura-700 !rounded-xl text-xs font-bold !px-5 flex-1 sm:flex-initial"
            >
              Confirm ({tempSelected.length})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddChangeServicesModal;
