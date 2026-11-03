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
  EyeOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import PhotoViewerModal from '../common/PhotoViewerModal';
import TreatmentReviewsModal from './TreatmentReviewsModal';

const CATEGORIES = ['All Services', 'Facial', 'Hair Care & Scalp', 'Slimming', 'Ingrown Removal', 'Whitening', 'Anti-Aging'];

const Step1SelectService = ({ selectedService, onSelectService, onNext }) => {
  const { services, getServiceReviewStats } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [photoModalService, setPhotoModalService] = useState(null);
  const [reviewsModalService, setReviewsModalService] = useState(null);

  const filteredServices = services.filter(service => {
    // Only show active services to clients
    const isAvailable = service.active !== false;
    const matchesCategory = selectedCategory === 'All Services' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.category.toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredServices.map(service => {
          const isSelected = selectedService?.id === service.id;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
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
                  {service.popular && (
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

                {/* Selection Check Circle */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-aura-600 text-white flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                    <CheckCircleFilled className="text-sm sm:text-base" />
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
                    className={`!rounded-xl text-xs font-semibold !h-9 ${
                      isSelected
                        ? '!bg-aura-700 hover:!bg-aura-800 !border-aura-700 text-white'
                        : '!border-aura-300 !text-aura-700 hover:!border-aura-600'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
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
      {selectedService && (
        <div className="fixed sm:sticky bottom-3 left-3 right-3 sm:bottom-4 z-40 bg-aura-dark/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-aura-500/30 border border-aura-400/40 flex items-center justify-center text-aura-200 shrink-0">
              <StarOutlined className="text-base sm:text-lg" />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-aura-300 uppercase tracking-wider font-semibold">
                Selected
              </p>
              <h5 className="font-medium text-white text-xs sm:text-sm truncate">
                {selectedService.name}
              </h5>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={onNext}
            className="!bg-gradient-to-r !from-aura-500 !to-aura-400 hover:!from-aura-600 hover:!to-aura-500 !border-none !text-white !font-bold !rounded-xl !px-4 sm:!px-6 !h-10 sm:!h-11 shadow-md shadow-aura-500/20 text-xs sm:text-sm shrink-0 ml-2"
          >
            Schedule →
          </Button>
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
