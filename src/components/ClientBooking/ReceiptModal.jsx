import React from 'react';
import { Modal, Button, Tag, Divider, QRCode } from 'antd';
import {
  PrinterOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const getAftercareInstructions = (appointment) => {
  const cat = (appointment?.serviceCategory || appointment?.serviceName || '').toLowerCase();
  if (cat.includes('hair') || cat.includes('rebond') || cat.includes('keratin') || cat.includes('scalp')) {
    return 'Avoid washing, wetting, or clipping hair tightly for 48–72 hours post-treatment. Use sulfate-free care products.';
  }
  if (cat.includes('facial') || cat.includes('peel') || cat.includes('needling') || cat.includes('glow')) {
    return 'Avoid direct sun exposure, steam rooms, and active exfoliants (retinol/AHA) for 48 hours. Apply SPF 50+ daily.';
  }
  if (cat.includes('ingrown') || cat.includes('nail') || cat.includes('foot') || cat.includes('manicure')) {
    return 'Keep treated nail folds clean and dry for 24 hours. Avoid tight closed-toe footwear and apply antiseptic oil.';
  }
  return 'Maintain optimal hydration (8–10 glasses of water) before and after your session for maximum clinical results.';
};

const ReceiptModal = ({ open, onClose, appointment }) => {
  const { clinicProfile } = useApp();
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} className="!rounded-xl">
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold"
        >
          Print Slip
        </Button>
      ]}
      width="95%"
      style={{ maxWidth: 520 }}
      centered
      className="aura-receipt-modal print:p-0"
    >
      <div id="aura-printable-receipt" className="p-4 sm:p-6 bg-white text-aura-dark space-y-6">
        {/* Receipt Header & Logo */}
        <div className="text-center border-b border-aura-200 pb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-aura-700 to-aura-500 text-white flex items-center justify-center font-serif-luxury font-bold text-2xl shadow-sm mb-2 overflow-hidden">
            {clinicProfile?.logoUrl ? (
              <img src={clinicProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              clinicProfile?.clinicName ? clinicProfile.clinicName.trim().charAt(0).toUpperCase() : 'A'
            )}
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold tracking-wider text-aura-dark">
            {clinicProfile?.clinicName?.toUpperCase() || 'AURA AESTHETIC CLINIC'}
          </h2>
          <p className="text-xs uppercase tracking-widest text-aura-600 font-semibold mt-0.5">
            {clinicProfile?.tagline || 'Official Booking Slip & Client Pass'}
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 mt-2 flex-wrap">
            <span className="flex items-center gap-1">
              <EnvironmentOutlined /> {clinicProfile?.address || '3F Promenade, BGC Taguig'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <PhoneOutlined /> {clinicProfile?.phone || '(02) 8812-AURA'}
            </span>
          </div>
        </div>

        {/* Reference & Status */}
        <div className="flex items-center justify-between bg-aura-50/80 p-3.5 rounded-xl border border-aura-200 text-xs">
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-semibold">
              Booking Reference No.
            </div>
            <div className="font-mono font-bold text-base text-aura-800 tracking-wide">
              {appointment.id}
            </div>
            <div className="text-[10px] text-aura-600 font-medium mt-0.5">
              Monthly Sequence ID
            </div>
          </div>
          <div className="text-right">
            {appointment.status === 'Confirmed' ? (
              <Tag color="green" className="!rounded-full px-3 py-0.5 font-semibold text-xs">
                CONFIRMED
              </Tag>
            ) : appointment.status === 'Completed' ? (
              <Tag color="blue" className="!rounded-full px-3 py-0.5 font-semibold text-xs">
                COMPLETED
              </Tag>
            ) : appointment.status === 'Cancelled' ? (
              <Tag color="red" className="!rounded-full px-3 py-0.5 font-semibold text-xs">
                CANCELLED
              </Tag>
            ) : (
              <Tag color="gold" className="!rounded-full px-3 py-0.5 font-semibold text-xs">
                PENDING APPROVAL
              </Tag>
            )}
            <div className="text-[10px] text-gray-400 mt-0.5">
              Issued: {appointment.createdAt || 'Just now'}
            </div>
          </div>
        </div>

        {/* Client & Schedule Info */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 uppercase text-[10px] font-semibold block mb-0.5">
              Client Name
            </span>
            <div className="font-bold text-gray-800 text-sm">
              {appointment.clientName}
            </div>
            <div className="text-gray-500 text-[11px] mt-0.5">
              {appointment.phone}
            </div>
          </div>

          <div>
            <span className="text-gray-400 uppercase text-[10px] font-semibold block mb-0.5">
              Reserved Date & Time
            </span>
            <div className="font-bold text-gray-800 text-sm flex items-center gap-1">
              <CalendarOutlined className="text-aura-600" />
              <span>{appointment.date}</span>
            </div>
            <div className="text-aura-700 font-semibold text-xs mt-0.5 flex items-center gap-1">
              <ClockCircleOutlined />
              <span>{appointment.time}</span>
            </div>
          </div>
        </div>

        {/* Treatment Details */}
        <div className="border border-aura-200 rounded-xl overflow-hidden">
          <div className="bg-aura-100/60 px-3.5 py-2 text-[11px] font-bold text-aura-800 flex justify-between">
            <span>SERVICE & PROCEDURE</span>
            <span>SUBTOTAL</span>
          </div>
          <div className="p-3.5 space-y-2.5 text-xs">
            {Array.isArray(appointment.services) && appointment.services.length > 0 ? (
              appointment.services.map((srv, idx) => (
                <div key={idx} className="flex justify-between items-start pb-2 border-b border-aura-100/70 last:border-b-0 last:pb-0">
                  <div>
                    <div className="font-bold text-gray-800">{srv.name}</div>
                    <div className="text-[11px] text-gray-500">{srv.category} • {srv.duration || 'Session'} • Sterile Kit</div>
                  </div>
                  <div className="font-semibold text-gray-800">
                    ₱{Number(srv.price).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-800">{appointment.serviceName}</div>
                  <div className="text-[11px] text-gray-500">Includes consultation & sterile medical kit</div>
                </div>
                <div className="font-semibold text-gray-800">
                  ₱{(appointment.totalPrice || appointment.finalAmount)?.toLocaleString()}
                </div>
              </div>
            )}

            {appointment.voucherUsed && (
              <div className="flex justify-between items-center text-emerald-600 font-medium text-xs pt-1 border-t border-dashed border-aura-200">
                <span className="flex items-center gap-1">
                  <span>Voucher Discount:</span>
                  <Tag color="cyan" className="!font-mono !text-[10px]">{appointment.voucherUsed}</Tag>
                </span>
                <span>-₱{appointment.discountApplied?.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="bg-aura-50 p-3.5 border-t border-aura-200 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-sm text-gray-800">
                {appointment.status === 'Completed' ? 'Total Amount Paid' : 'Amount Due at Clinic'}
              </span>
              <span className="font-serif-luxury text-xl font-bold text-aura-700">
                ₱{appointment.finalAmount?.toLocaleString()}
              </span>
            </div>
            {(appointment.paymentMethod || appointment.status === 'Completed') && (
              <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-aura-200/60">
                <span>
                  Payment Mode: <strong>{appointment.paymentMethod || 'Clinic Counter'}</strong>
                </span>
                {appointment.changeDue > 0 ? (
                  <span className="text-emerald-700 font-semibold">
                    Tendered: ₱{appointment.cashTendered?.toLocaleString()} • Change: ₱{appointment.changeDue?.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">✓ PAID IN FULL</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post-Treatment Clinical Care Advisory */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1 text-amber-900">
            <CheckCircleFilled className="text-amber-600" />
            <span>Specialist Post-Treatment Care Advisory:</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {getAftercareInstructions(appointment)}
          </p>
        </div>

        {/* QR Verification & Reminders */}
        <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
          <div className="bg-white p-1 rounded-lg border border-gray-200">
            <QRCode
              value={`AURA-BOOKING:${appointment.id}:${appointment.clientName}`}
              size={72}
              bordered={false}
              color="#52252d"
            />
          </div>
          <div className="text-[11px] text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 flex items-center gap-1">
              <SafetyCertificateOutlined className="text-aura-600" />
              <span>Clinic Check-in Instructions:</span>
            </div>
            <p>
              Present this pass or your booking reference at the Aura Front Desk for instant room assignment.
            </p>
            <p className="text-[10px] text-gray-400">
              Accepted payments: GCash, Maya, Debit or Credit Card, or Cash.
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-100">
          Thank you for choosing Aura Aesthetic Clinic • Transforming beauty with medical precision.
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
