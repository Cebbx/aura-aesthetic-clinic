import React, { useState } from 'react';
import { Card, Tag, Input, Badge, Button, Tooltip } from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  StarOutlined,
  StarFilled,
  FireOutlined,
  InfoCircleOutlined,
  ZoomInOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import PhotoViewerModal from '../common/PhotoViewerModal';
import TreatmentReviewsModal from './TreatmentReviewsModal';

const CATEGORIES = [
  'All Services',
  '🔥 Book & Buy Privilege (Up to 66% OFF)',
  'Hair Care & Scalp',
  'Facial',
  'Slimming',
  'Ingrown Removal',
  'Whitening',
  'Anti-Aging'
];

const Step1SelectService = ({
  selectedServices = [],
  selectedService,
  onToggleService,
  onSelectService,
  onNext
}) => {
  const { services, getServiceReviewStats } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [photoModalService, setPhotoModalService] = useState(null);
  const [reviewsModalService, setReviewsModalService] = useState(null);

  const currentSelectedList = Array.isArray(selectedServices) && selectedServices.length > 0
    ? selectedServices
    : (selectedService ? [selectedService] : []);

  const totalCombinedPrice = currentSelectedList.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  const handleServiceClick = (service) => {
    if (onToggleService) {
      onToggleService(service);
    } else if (onSelectService) {
      onSelectService(service);
    }
  };

  const filteredServices = services.filter(service => {
    // Only show active services to clients
    const isAvailable = service.active !== false;
    const matchesCategory =
      selectedCategory === 'All Services' ||
      (selectedCategory.includes('Book & Buy') && service.bookAndBuy) ||
      service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.tags && service.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return isAvailable && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Horizontal Swipe List */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 scroll-smooth">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                selectedCategory === category
                  ? 'bg-aura-700 text-white shadow-sm shadow-aura-700/30'
                  : 'bg-white text-gray-600 hover:text-aura-700 hover:bg-aura-50 border border-aura-200/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search treatment..."
            prefix={<SearchOutlined className="text-aura-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="rounded-full !border-aura-200 focus:!border-aura-500 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* 👑 Official Book & Buy Privilege Promo Showcase Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#270e14] via-[#3a131e] to-[#1a0a10] text-white p-4 sm:p-5 border border-amber-500/40 shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[11px] font-black px-3 py-0.5 rounded-full shadow-sm tracking-wide uppercase">
                👑 Privilege Promo
              </span>
              <span className="bg-white/15 text-amber-200 border border-amber-300/30 text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                🔥 Book & Buy: Up to 66% OFF
              </span>
              <span className="text-[11px] text-amber-200/90 font-medium hidden sm:inline">
                Lean Season Lock-In • Peak Season Avail
              </span>
            </div>

            <h3 className="font-serif-luxury text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
              Lock In Exclusive Lean Season Rates Today — Avail Anytime During Holiday Peak Rush with Zero Surcharge!
            </h3>

            <p className="text-xs sm:text-[13px] text-rose-100/90 leading-relaxed">
              During peak season (December rush), treatment rates typically range from <strong>₱3,000 – ₱5,000</strong>. With our <strong>Book & Buy Privilege</strong>, secure your appointment slot today starting from just <strong>₱299 – ₱1,499 (up to 66% OFF)</strong> and redeem anytime at your convenience — including <strong>Christmas holidays, January 2027, or February</strong> — with zero surge pricing!
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-amber-300/95 font-medium">
              <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">✨ Rebond from ₱799</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">❄️ Cryo-Iron ₱699</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">💆‍♀️ Cysteine & Keratin ₱999</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">🌟 Facials & BB Glow from ₱499</span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="text-left md:text-right">
              <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">15 Exclusive Deals</div>
              <div className="font-serif-luxury text-lg sm:text-2xl font-bold text-amber-300">₱299 – ₱1,499</div>
            </div>

            <Button
              type="primary"
              onClick={() => {
                setSelectedCategory('🔥 Book & Buy Privilege (Up to 66% OFF)');
                setSearchQuery('');
              }}
              className="!bg-gradient-to-r !from-amber-400 !via-amber-500 !to-amber-600 hover:!from-amber-500 hover:!to-amber-700 !text-black !font-bold !border-none !rounded-xl !h-9 sm:!h-10 !px-4 shadow-md text-xs transition-transform active:scale-95"
            >
              {selectedCategory.includes('Book & Buy') ? '✓ Viewing Book & Buy' : '🔥 View 15 Book & Buy Deals →'}
            </Button>
          </div>
        </div>
      </div>

      {/* Multi-Treatment Booking Info Banner */}
      <div className="bg-gradient-to-r from-aura-50 via-white to-aura-100/50 border border-aura-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-aura-100 text-aura-700 flex items-center justify-center font-bold text-sm shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-aura-900">
                Multi-Treatment Selection
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Available
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              You can select 1 or more treatments in a single appointment session (e.g. Facial + Whitening + Laser).
            </p>
          </div>
        </div>

        {currentSelectedList.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-aura-800 font-bold bg-white border border-aura-300 px-3 py-1 rounded-full shadow-2xs">
              {currentSelectedList.length} {currentSelectedList.length === 1 ? 'Treatment Selected' : 'Treatments Selected'}
            </span>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredServices.map(service => {
          const isSelected = currentSelectedList.some(s => s.id === service.id);

          return (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className={`group relative rounded-2xl bg-white border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-aura-600 ring-2 ring-aura-600/30 shadow-lg shadow-aura-200 scale-[1.01]'
                  : 'border-aura-200/80 hover:border-aura-400 hover:shadow-md'
              }`}
            >
              {/* Image & Badges */}
              <div
                className="relative h-40 sm:h-44 overflow-hidden bg-aura-100 group/img cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoModalService(service);
                }}
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Popular or Promo Badge */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  {service.bookAndBuy && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                      👑 Book & Buy Slot
                    </span>
                  )}
                  {service.popular && !service.bookAndBuy && (
                    <span className="inline-flex items-center gap-1 bg-amber-500/95 text-white text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs">
                      <StarFilled /> Top Treatment
                    </span>
                  )}
                  {service.promoBadge && (
                    <span className="inline-flex items-center gap-1 bg-aura-700/90 text-white text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs">
                      <StarOutlined /> {service.promoBadge}
                    </span>
                  )}
                </div>

                {/* Duration & Tap to View Pill */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-medium drop-shadow-md">
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    <span>{service.duration}</span>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white flex items-center gap-1 group-hover/img:bg-aura-700/90 transition-colors">
                    <ZoomInOutlined />
                    <span>View Photo</span>
                  </div>
                </div>

                {/* Selection Check Circle / Badge */}
                {isSelected ? (
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-aura-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-md animate-in fade-in zoom-in duration-200">
                    <CheckCircleFilled className="text-xs" />
                    <span>Selected</span>
                  </div>
                ) : (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 shadow-xs transition-colors">
                    <PlusOutlined className="text-[9px]" />
                    <span>Add</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-aura-600">
                      {service.category}
                    </span>

                    {/* Star Rating & Reviews Badge */}
                    {(() => {
                      const stats = getServiceReviewStats(service.id);
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewsModalService(service);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] sm:text-[11px] font-bold text-amber-800 transition-colors cursor-pointer"
                        >
                          <StarFilled className="text-amber-500 text-[10px]" />
                          <span>{stats.averageRating.toFixed(1)}</span>
                          <span className="text-gray-400 font-normal">({stats.totalCount})</span>
                        </button>
                      );
                    })()}
                  </div>

                  <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-aura-dark leading-snug mb-1">
                    {service.name}
                  </h4>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-2.5">
                    {service.description}
                  </p>

                  {/* Inclusions pill */}
                  {service.includes && (
                    <div className="bg-aura-50/60 rounded-lg p-2 mb-3 border border-aura-100">
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-600">
                        {service.includes.slice(0, 4).map((inc, i) => (
                          <div key={i} className="flex items-center gap-1 truncate">
                            <span className="w-1 h-1 rounded-full bg-aura-500 shrink-0"></span>
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Selection Button */}
                <div className="pt-2.5 border-t border-aura-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif-luxury text-lg sm:text-xl font-bold text-aura-800">
                        ₱{service.price.toLocaleString()}
                      </span>
                      {service.originalPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₱{service.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium block">
                      Free sterile kit
                    </span>
                  </div>

                  <Button
                    type={isSelected ? 'primary' : 'default'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(service);
                    }}
                    className={`!rounded-xl text-xs font-semibold !h-9 transition-all cursor-pointer ${
                      isSelected
                        ? '!bg-aura-700 hover:!bg-aura-800 !border-aura-700 text-white shadow-xs'
                        : '!border-aura-300 !text-aura-700 hover:!border-aura-600 hover:!bg-aura-50'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : '+ Add Treatment'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-aura-200 p-6">
          <p className="text-gray-400 text-xs mb-2">No services found matching "{searchQuery}"</p>
          <Button
            size="small"
            onClick={() => {
              setSelectedCategory('All Services');
              setSearchQuery('');
            }}
            className="!border-aura-300 !text-aura-700 text-xs"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Floating Bottom Bar for Mobile & Desktop */}
      {currentSelectedList.length > 0 && (
        <div className="fixed sm:sticky bottom-3 left-3 right-3 sm:bottom-4 z-40 bg-aura-dark/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-white/10 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-aura-500/30 border border-aura-400/40 flex items-center justify-center text-aura-200 shrink-0 font-bold text-sm">
              {currentSelectedList.length}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-aura-300 uppercase tracking-wider font-semibold">
                  {currentSelectedList.length === 1 ? '1 Treatment Selected' : `${currentSelectedList.length} Treatments Selected (Combined)`}
                </p>
                <span className="text-[10px] text-amber-300 hidden sm:inline">
                  {currentSelectedList.length === 1 ? '• Tap other cards to add more' : '• Ready to schedule'}
                </span>
              </div>
              <h5 className="font-medium text-white text-xs sm:text-sm truncate">
                {currentSelectedList.map(s => s.name).join(' + ')}
              </h5>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-aura-300 block">Total Due</span>
              <span className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                ₱{totalCombinedPrice.toLocaleString()}
              </span>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={onNext}
              className="!bg-gradient-to-r !from-aura-500 !to-aura-400 hover:!from-aura-600 hover:!to-aura-500 !border-none !text-white !font-bold !rounded-xl !px-4 sm:!px-6 !h-10 sm:!h-11 shadow-md shadow-aura-500/20 text-xs sm:text-sm shrink-0"
            >
              Proceed to Schedule ({currentSelectedList.length}) →
            </Button>
          </div>
        </div>
      )}

      {/* Full Resolution Photo Viewer Modal */}
      <PhotoViewerModal
        open={!!photoModalService}
        onClose={() => setPhotoModalService(null)}
        service={photoModalService}
        onBookService={(srv) => {
          onSelectService(srv);
          onNext();
        }}
      />

      {/* Treatment Verified Reviews Modal */}
      <TreatmentReviewsModal
        open={!!reviewsModalService}
        onClose={() => setReviewsModalService(null)}
        service={reviewsModalService}
        onBookService={(srv) => {
          onSelectService(srv);
          onNext();
        }}
      />
    </div>
  );
};

export default Step1SelectService;
