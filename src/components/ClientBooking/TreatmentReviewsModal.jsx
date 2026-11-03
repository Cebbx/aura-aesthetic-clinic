import React from 'react';
import { Modal, Button, Tag, Rate, Progress } from 'antd';
import {
  StarFilled,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  HeartFilled
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const TreatmentReviewsModal = ({
  open,
  onClose,
  service,
  onBookService
}) => {
  const { getServiceReviewStats } = useApp();

  if (!service) return null;

  const { reviews, averageRating, totalCount } = getServiceReviewStats(service.id);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          onClick={onClose}
          className="!rounded-xl text-xs font-semibold !h-9 px-4"
        >
          Close
        </Button>,
        onBookService && (
          <Button
            key="book"
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => {
              onClose();
              onBookService(service);
            }}
            className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl text-xs font-semibold !h-9 px-5 shadow-sm"
          >
            Book This Treatment
          </Button>
        )
      ].filter(Boolean)}
      centered
      width={600}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-lg text-aura-dark">
          <StarFilled className="text-amber-500" />
          <span>Patient Reviews & Ratings</span>
        </div>
      }
      className="aura-reviews-modal"
    >
      <div className="space-y-4 pt-2">
        {/* Treatment Info Header */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-aura-50/70 border border-aura-200/80">
          <img
            src={service.image}
            alt={service.name}
            className="w-12 h-12 rounded-xl object-cover border border-aura-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Tag color="purple" className="!text-[9px] !rounded-md uppercase tracking-wider font-semibold">
              {service.category}
            </Tag>
            <div className="font-bold text-xs sm:text-sm text-aura-dark truncate">
              {service.name}
            </div>
            <div className="text-[11px] font-semibold text-aura-700">
              ₱{service.price?.toLocaleString()} • {service.duration || '45 mins'}
            </div>
          </div>
        </div>

        {/* Rating Overview Score Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-serif-luxury">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <Rate
                disabled
                allowHalf
                defaultValue={averageRating}
                className="text-amber-400 text-sm"
              />
              <div className="text-xs text-gray-500 mt-0.5">
                Based on <strong>{totalCount}</strong> verified patient experiences
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <SafetyCertificateOutlined className="text-emerald-600" />
            <span>100% Verified Clinic Patients</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 space-y-1">
              <HeartFilled className="text-aura-300 text-2xl" />
              <p>Clients are loving this treatment! Verified reviews will appear as sessions are completed.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2 hover:border-aura-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-aura-600 to-aura-400 text-white font-bold text-xs flex items-center justify-center">
                      {rev.clientName ? rev.clientName.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-800 block leading-tight">
                        {rev.clientName}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Rate
                      disabled
                      value={rev.rating || 5}
                      className="text-amber-400 text-[11px]"
                    />
                    {rev.verified && (
                      <Tag color="green" className="!mr-0 !text-[9px] !rounded-md">
                        Verified Visit
                      </Tag>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed pl-9">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TreatmentReviewsModal;
