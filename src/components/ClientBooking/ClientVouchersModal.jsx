import React, { useState } from 'react';
import { Modal, Button, Tag, Tooltip, message } from 'antd';
import {
  GiftOutlined,
  CopyOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  TagOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const ClientVouchersModal = ({ open, onClose, onSelectVoucher }) => {
  const { vouchers, services, currentView } = useApp();
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const today = dayjs().format('YYYY-MM-DD');

  // Filter only active, unredeemed and unexpired vouchers
  const activeVouchers = (vouchers || []).filter(v => {
    if (v.status === 'Redeemed') return false;
    const maxUses = Number(v.maxUses) || 1;
    const usedCount = Number(v.usedCount) || 0;
    if (usedCount >= maxUses) return false;
    if (v.expiryDate && v.expiryDate < today) return false;
    if (v.voucherType === 'personal') return false; // Private VIP passes not shown in public modal
    return true;
  });

  // Unique categories from active vouchers
  const categories = Array.from(new Set(
    activeVouchers
      .map(v => {
        if (!v.serviceCategory || v.serviceCategory === 'All Services') return 'All Services';
        if (v.serviceCategory.startsWith('Treatment: ')) return 'Specific Treatments';
        return v.serviceCategory;
      })
      .filter(Boolean)
  ));

  const filteredVouchers = activeVouchers.filter(v => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'All Services') return !v.serviceCategory || v.serviceCategory === 'All Services';
    if (selectedCategory === 'Specific Treatments') return v.serviceCategory?.startsWith('Treatment: ');
    return v.serviceCategory === selectedCategory;
  });

  const handleClaim = (voucher) => {
    navigator.clipboard.writeText(voucher.code);
    setCopiedCode(voucher.code);
    setTimeout(() => setCopiedCode(null), 2500);

    if (onSelectVoucher) {
      onSelectVoucher(voucher.code);
    }

    message.success({
      content: `🎉 Voucher ${voucher.code} claimed! ₱${voucher.discountAmount?.toLocaleString()} discount applied.`,
      duration: 3
    });

    onClose();
  };

  const handleCopyOnly = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      className="aura-vouchers-modal"
      title={
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aura-600 to-aura-800 text-white flex items-center justify-center shadow-xs">
            <GiftOutlined className="text-lg" />
          </div>
          <div>
            <div className="font-serif-luxury text-lg font-bold text-aura-dark leading-tight flex items-center gap-2">
              <span>Special Offers & Promo Vouchers</span>
              {currentView === 'admin' && (
                <span className="text-[10px] font-sans font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  Admin Preview
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500 font-normal">
              {currentView === 'admin'
                ? 'Active public promo vouchers available for client booking'
                : 'Claim limited promo codes for your aesthetic treatment'}
            </div>
          </div>
        </div>
      }
    >
      <div className="mt-3 space-y-3">
        {/* Banner note */}
        <div className="bg-gradient-to-r from-aura-50 via-rose-50/50 to-amber-50/60 p-3 rounded-xl border border-aura-200/80 flex items-center justify-between text-xs text-aura-900">
          <span className="flex items-center gap-1.5 font-medium">
            <ThunderboltOutlined className="text-amber-600" />
            <span>First-come, first-served • Slots are limited</span>
          </span>
          <span className="text-[11px] text-gray-500">
            {activeVouchers.length} active promo{activeVouchers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Category Pills Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-aura-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Promos ({activeVouchers.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-aura-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Vouchers List */}
        {filteredVouchers.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="text-3xl">🏷️</div>
            <div className="font-semibold text-gray-700 text-sm">
              All promotional vouchers are currently claimed!
            </div>
            <div className="text-xs text-gray-500 max-w-sm mx-auto">
              Please check back soon for our next seasonal flash promotion or ask our concierge desk upon clinic arrival.
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredVouchers.map(v => {
              const maxUses = Number(v.maxUses) || 1;
              const usedCount = Number(v.usedCount) || 0;
              const remainingSlots = Math.max(0, maxUses - usedCount);

              return (
                <div
                  key={v.code}
                  className="group relative bg-white hover:bg-aura-50/40 rounded-2xl border border-aura-200/90 hover:border-aura-400 p-3.5 transition-all shadow-xs hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Value & Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif-luxury font-black text-lg text-emerald-600 tracking-tight">
                          ₱{v.discountAmount?.toLocaleString()} OFF
                        </span>

                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-aura-100/70 text-aura-900 border border-aura-200 px-2 py-0.5 rounded-lg">
                          <TagOutlined className="text-aura-500" />
                          <span>{v.code}</span>
                        </span>

                        <Tooltip title="Copy code">
                          <button
                            type="button"
                            onClick={(e) => handleCopyOnly(v.code, e)}
                            className="text-gray-400 hover:text-aura-700 p-0.5 transition-colors cursor-pointer"
                          >
                            {copiedCode === v.code ? (
                              <CheckOutlined className="text-emerald-600 text-xs" />
                            ) : (
                              <CopyOutlined className="text-xs" />
                            )}
                          </button>
                        </Tooltip>
                      </div>

                      {/* Applicable Target */}
                      <div className="text-xs text-gray-700 font-medium">
                        {!v.serviceCategory || v.serviceCategory === 'All Services' ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span>✨</span>
                            <span>Valid on All Aesthetic Services</span>
                          </span>
                        ) : v.serviceCategory.startsWith('Treatment: ') ? (
                          <span className="text-purple-700 font-semibold flex items-center gap-1">
                            <span>💆‍♀️</span>
                            <span>Valid exclusively for: {v.serviceCategory.replace('Treatment: ', '')}</span>
                          </span>
                        ) : (
                          <span className="text-aura-800 font-semibold flex items-center gap-1">
                            <span>📂</span>
                            <span>Valid for all {v.serviceCategory} treatments</span>
                          </span>
                        )}
                      </div>

                      {/* Requirement & Expiry */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 pt-0.5">
                        <span>Min. spend: <strong>₱{v.minSpend?.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Expires: <strong>{v.expiryDate}</strong></span>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">
                          ⚡ {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} left
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="sm:self-center shrink-0">
                      {currentView === 'admin' ? (
                        <Button
                          type="default"
                          icon={<CopyOutlined />}
                          onClick={(e) => handleCopyOnly(v.code, e)}
                          className="!rounded-xl !border-aura-300 hover:!border-aura-600 !text-aura-900 font-semibold text-xs px-3 !h-9 shadow-xs w-full sm:w-auto"
                        >
                          Copy Code
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleClaim(v)}
                          className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl !text-white font-semibold text-xs px-4 !h-9 shadow-xs w-full sm:w-auto"
                        >
                          Claim & Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          {currentView === 'admin' ? (
            <>
              <span className="text-gray-500 text-left">
                💡 <em>Admin Note: Clients claim and apply these promo codes during online booking.</em>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('aura:navigate-admin-tab', { detail: 'vouchers' }));
                }}
                className="text-aura-700 hover:text-aura-900 font-bold hover:underline cursor-pointer shrink-0"
              >
                Go to Voucher Manager & Editor →
              </button>
            </>
          ) : (
            <span className="w-full text-center">
              Discounts are automatically deducted from your total bill at Step 3.
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ClientVouchersModal;
