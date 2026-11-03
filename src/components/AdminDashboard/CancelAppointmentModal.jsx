import React, { useState } from 'react';
import { Modal, Select, Input, Button, Tag, Alert, message } from 'antd';
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;
const { TextArea } = Input;

// Clean, professional reasons without cluttering slashes
const CANCEL_REASONS = [
  'Therapist Unavailable',
  'Fully Booked Schedule',
  'Client Requested Reschedule',
  'Client Unreachable or No-Show',
  'Skin Condition Not Suitable',
  'Clinic Maintenance',
  'Duplicate Booking',
  'Other (Write Reason Below)'
];

const CancelAppointmentModal = ({ open, onClose, appointment }) => {
  const { updateAppointmentStatus } = useApp();
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customRemarks, setCustomRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!appointment) return null;

  const handleConfirmCancel = () => {
    setSubmitting(true);

    const fullReason = customRemarks.trim()
      ? `${selectedReason}: ${customRemarks.trim()}`
      : selectedReason;

    setTimeout(() => {
      updateAppointmentStatus(appointment.id, 'Cancelled', {
        cancellationReason: fullReason,
        cancelledAt: dayjs().format('YYYY-MM-DD hh:mm A')
      });

      setSubmitting(false);
      message.warning(`Appointment ${appointment.id} cancelled. Reason recorded.`);
      setSelectedReason(CANCEL_REASONS[0]);
      setCustomRemarks('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setCustomRemarks('');
        onClose();
      }}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 440 }}
      title={
        <div className="flex items-center gap-2 text-rose-600 font-serif-luxury text-lg font-bold">
          <CloseCircleOutlined />
          <span>Cancel Appointment</span>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Appointment Context Card */}
        <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200/80 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <UserOutlined className="text-rose-500" />
              <span>{appointment.clientName}</span>
            </span>
            <Tag color="red" className="!mr-0 font-mono text-[10px]">{appointment.id}</Tag>
          </div>
          <div className="text-gray-600 font-medium">{appointment.serviceName}</div>
          <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-0.5">
            <span className="flex items-center gap-1">
              <CalendarOutlined /> {appointment.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-aura-800">
              <ClockCircleOutlined /> {appointment.time}
            </span>
          </div>
        </div>

        {/* Reason Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Cancellation Reason *
          </label>
          <Select
            value={selectedReason}
            onChange={setSelectedReason}
            className="w-full !rounded-xl"
            popupMatchSelectWidth={true}
            size="large"
          >
            {CANCEL_REASONS.map(reason => (
              <Option key={reason} value={reason}>
                <span className="text-xs sm:text-sm font-medium">{reason}</span>
              </Option>
            ))}
          </Select>
        </div>

        {/* Custom Reason Textarea */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span>Additional Remarks</span>
            <span className="text-[10px] text-gray-400 font-normal">Optional</span>
          </label>
          <TextArea
            rows={3}
            placeholder="Type specific explanation (e.g. Client requested to move session to Friday afternoon due to heavy traffic)..."
            value={customRemarks}
            onChange={(e) => setCustomRemarks(e.target.value)}
            className="!rounded-xl text-xs !border-gray-300"
          />
        </div>

        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
          <InfoCircleOutlined className="text-amber-600 mt-0.5 shrink-0" />
          <span>This cancellation reason is permanently recorded in the appointment history for clinic audit.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            onClick={() => {
              setCustomRemarks('');
              onClose();
            }}
            className="!rounded-xl text-xs"
          >
            Keep Appointment
          </Button>
          <Button
            type="primary"
            danger
            loading={submitting}
            onClick={handleConfirmCancel}
            className="!rounded-xl text-xs font-bold !h-9 shadow-xs"
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelAppointmentModal;
