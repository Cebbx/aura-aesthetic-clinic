import React from 'react';
import { Modal, Button, Tag } from 'antd';
import {
  CalendarOutlined,
  CloseOutlined,
  CheckCircleFilled,
  ZoomInOutlined
} from '@ant-design/icons';

const PhotoViewerModal = ({
  open,
  onClose,
  service,
  onBookService
}) => {
  if (!service) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={680}
      className="aura-photo-modal"
      styles={{ body: { padding: 0, overflow: 'hidden', borderRadius: 24 } }}
    >
      <div className="bg-white rounded-3xl overflow-hidden flex flex-col">
        {/* Full Image Container */}
        <div className="relative bg-black flex items-center justify-center max-h-[65vh] overflow-hidden group">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-auto max-h-[65vh] object-contain"
          />
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <CloseOutlined className="text-sm" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium flex items-center gap-1.5">
            <ZoomInOutlined />
            <span>High Resolution Treatment Photo</span>
          </div>
        </div>

        {/* Treatment Info Bar */}
        <div className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Tag color="purple" className="!text-[10px] !rounded-md uppercase tracking-wider font-semibold">
                {service.category}
              </Tag>
              <h3 className="font-serif-luxury text-base sm:text-xl font-bold text-aura-dark mt-1">
                {service.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {service.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-base sm:text-xl text-aura-700">
                ₱{service.price?.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-400">
                ⏱️ {service.duration || '45 mins'}
              </div>
            </div>
          </div>

          {service.includes && service.includes.length > 0 && (
            <div className="bg-aura-50/70 p-3 rounded-xl border border-aura-200/60 text-xs text-gray-700">
              <span className="font-bold text-aura-900 block mb-1.5 text-[11px]">Included Steps in this Session:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                {service.includes.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-gray-600">
                    <CheckCircleFilled className="text-aura-600 text-[10px]" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="!rounded-xl text-xs font-semibold !h-9 px-4"
            >
              Close
            </Button>
            {onBookService && (
              <Button
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
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PhotoViewerModal;
