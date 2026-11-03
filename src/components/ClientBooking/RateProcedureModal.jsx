import React, { useState } from 'react';
import { Modal, Button, Rate, Input, message } from 'antd';
import {
  StarFilled,
  HeartFilled,
  SafetyCertificateOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

const { TextArea } = Input;

const RateProcedureModal = ({
  open,
  onClose,
  appointment,
  onReviewSubmitted
}) => {
  const { addTreatmentReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!appointment) return null;

  const handleSubmit = () => {
    if (!rating) {
      message.warning('Please select a star rating for your procedure.');
      return;
    }

    setSubmitting(true);
    try {
      addTreatmentReview({
        appointmentId: appointment.id,
        serviceId: appointment.serviceId || appointment.service?.id || 'srv-5',
        rating,
        comment: comment.trim() || 'Wonderful procedure experience with gentle and professional care.',
        clientName: appointment.clientName
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      message.success('Thank you! Your verified patient review has been posted.');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (e) {
      console.error(e);
      message.error('Unable to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-lg text-aura-dark">
          <StarFilled className="text-amber-500" />
          <span>Rate Your Treatment Procedure</span>
        </div>
      }
      className="aura-rate-modal"
    >
      <div className="space-y-4 pt-2">
        {/* Appointment Card */}
        <div className="p-3.5 rounded-2xl bg-aura-50/80 border border-aura-200/80 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-aura-dark text-sm">{appointment.serviceName}</span>
            <span className="font-mono text-aura-700 font-semibold">{appointment.id}</span>
          </div>
          <div className="text-gray-500">
            Patient: <strong>{appointment.clientName}</strong> • Date: {appointment.date} ({appointment.time})
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium pt-0.5">
            <CheckCircleFilled className="text-emerald-600 text-xs" />
            <span>Completed Session • Eligible for Verified Review</span>
          </div>
        </div>

        {/* Star Rating Selector */}
        <div className="text-center py-2 space-y-2">
          <div className="text-xs font-semibold text-gray-700">
            How would you rate your overall procedure experience?
          </div>
          <div className="py-1">
            <Rate
              value={rating}
              onChange={setRating}
              className="text-amber-400 text-3xl"
            />
          </div>
          <div className="text-xs font-bold text-aura-700">
            {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional (5 out of 5)'}
            {rating === 4 && '⭐⭐⭐⭐ Very Good (4 out of 5)'}
            {rating === 3 && '⭐⭐⭐ Good (3 out of 5)'}
            {rating === 2 && '⭐⭐ Fair (2 out of 5)'}
            {rating === 1 && '⭐ Needs Improvement (1 out of 5)'}
          </div>
        </div>

        {/* Comment Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 block">
            Share your feedback & specialist experience:
          </label>
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your procedure, clinic sanitation, and specialist care? (e.g., Very gentle aesthetician, relaxing suite, and sterile tools...)"
            className="!rounded-xl text-xs"
            maxLength={300}
            showCount
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="!rounded-xl text-xs font-semibold !h-9 px-4"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl text-xs font-semibold !h-9 px-6 shadow-sm"
          >
            Submit Verified Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RateProcedureModal;
