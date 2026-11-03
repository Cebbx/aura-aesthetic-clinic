import React from 'react';
import { Modal, QRCode, Button, message, Space, Typography } from 'antd';
import {
  CopyOutlined,
  MobileOutlined,
  PrinterOutlined,
  CheckCircleFilled,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const QRCodeModal = ({ open, onClose }) => {
  const officialDomain = 'https://aura-aesthetic-clinic.onrender.com';
  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.')
  );

  // Default to live official Render domain so printed/scanned QR codes work everywhere
  const bookingUrl = (isLocal ? officialDomain : window.location.origin) + '?mode=client';

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    message.success('Booking URL copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 420 }}
      className="aura-qr-modal"
    >
      <div className="p-4 text-center">
        {/* Header */}
        <div className="mb-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-aura-100 flex items-center justify-center text-aura-600 mb-2">
            <MobileOutlined className="text-xl" />
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-aura-dark">
            Scan to Book
          </h3>
          <p className="text-xs text-aura-700/80 mt-1">
            Display this QR code at the reception desk, promo standees, or clinic vouchers for instant client self-booking.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="inline-block p-4 bg-gradient-to-br from-aura-50 via-white to-aura-100 rounded-3xl border border-aura-300 shadow-inner mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <QRCode
              value={bookingUrl}
              size={210}
              color="#713942"
              bordered={false}
              icon="/pwa-icon-192.png"
              iconSize={40}
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-aura-700">
            <CheckCircleFilled className="text-emerald-500" />
            <span>Aura Aesthetic • Quick VIP Pass</span>
          </div>
        </div>

        {/* Info & URL */}
        <div className="bg-aura-50/70 p-3 rounded-xl border border-aura-200/70 text-left mb-4 text-xs">
          <div className="flex items-start gap-2 mb-1.5">
            <EnvironmentOutlined className="text-aura-600 mt-0.5" />
            <span className="text-aura-900 font-medium">
              Branch: 3F Promenade Wing, Bonifacio High St., BGC
            </span>
          </div>
          <div className="text-gray-500 text-[11px] truncate">
            URL: <Text copyable={{ text: bookingUrl }} className="text-aura-700">{bookingUrl}</Text>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            block
            icon={<CopyOutlined />}
            onClick={handleCopy}
            className="!border-aura-300 !text-aura-800 hover:!border-aura-500"
          >
            Copy Link
          </Button>
          <Button
            type="primary"
            block
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="!bg-aura-600 hover:!bg-aura-700 !border-aura-600"
          >
            Print Standee
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
