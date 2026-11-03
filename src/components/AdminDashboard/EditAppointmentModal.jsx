import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Tag, Space, Divider, message, Tooltip } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  DollarOutlined,
  EditOutlined,
  BellOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;
const { TextArea } = Input;

const EditAppointmentModal = ({ open, onClose, appointment, onNotifyClient }) => {
  const [form] = Form.useForm();
  const { services, timeSlots, updateAppointment } = useApp();

  const [appointmentServices, setAppointmentServices] = useState([]);
  const [serviceToAdd, setServiceToAdd] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Initialize data when modal opens
  useEffect(() => {
    if (open && appointment) {
      // Parse existing services
      let initialServices = [];
      if (Array.isArray(appointment.services) && appointment.services.length > 0) {
        initialServices = [...appointment.services];
      } else {
        // Fallback for older appointments with single service
        const matched = services.find(s => s.id === appointment.serviceId || s.name === appointment.serviceName);
        initialServices = [{
          id: appointment.serviceId || 'srv-custom',
          name: appointment.serviceName || 'Custom Procedure',
          price: appointment.totalPrice || appointment.finalAmount || 1500,
          category: appointment.serviceCategory || matched?.category || 'General',
          duration: matched?.duration || '45 mins'
        }];
      }

      setAppointmentServices(initialServices);
      setDiscountAmount(appointment.discountApplied || 0);

      form.setFieldsValue({
        clientName: appointment.clientName,
        phone: appointment.phone,
        email: appointment.email || '',
        date: appointment.date ? dayjs(appointment.date) : dayjs(),
        time: appointment.time || '10:30 AM',
        status: appointment.status || 'Pending',
        notes: appointment.notes || ''
      });
    }
  }, [open, appointment, services, form]);

  // Compute live subtotal & final amount
  const subtotal = appointmentServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const finalAmount = Math.max(0, subtotal - discountAmount);

  // Add a service
  const handleAddService = () => {
    if (!serviceToAdd) return;
    const srv = services.find(s => s.id === serviceToAdd);
    if (!srv) return;

    setAppointmentServices(prev => [
      ...prev,
      {
        id: srv.id,
        name: srv.name,
        price: srv.price,
        category: srv.category,
        duration: srv.duration
      }
    ]);
    setServiceToAdd(null);
    message.success(`Added ${srv.name} to booking`);
  };

  // Remove a service
  const handleRemoveService = (index) => {
    if (appointmentServices.length <= 1) {
      message.warning('At least one service is required for the appointment.');
      return;
    }
    const removed = appointmentServices[index];
    setAppointmentServices(prev => prev.filter((_, i) => i !== index));
    message.info(`Removed ${removed.name}`);
  };

  const handleFinish = (values) => {
    if (appointmentServices.length === 0) {
      message.error('Please select at least one treatment for this booking.');
      return;
    }

    const updatedData = {
      clientName: values.clientName.trim(),
      phone: values.phone.trim(),
      email: values.email?.trim() || '',
      date: values.date.format('YYYY-MM-DD'),
      time: values.time,
      status: values.status,
      notes: values.notes || '',
      services: appointmentServices,
      totalPrice: subtotal,
      discountApplied: discountAmount,
      finalAmount: finalAmount,
      serviceName: appointmentServices.map(s => s.name).join(' & '),
      serviceId: appointmentServices[0]?.id
    };

    updateAppointment(appointment.id, updatedData);
    message.success(`Appointment ${appointment.id} successfully updated! Real-time synced.`);
    onClose();

    // Prompt admin to notify client if changes were made
    if (onNotifyClient) {
      const fullUpdated = { ...appointment, ...updatedData };
      setTimeout(() => {
        Modal.confirm({
          title: (
            <span className="font-serif-luxury text-base text-aura-dark font-bold">
              Appointment Updated Successfully!
            </span>
          ),
          icon: <CheckCircleFilled className="text-emerald-500 text-xl" />,
          content: (
            <div className="space-y-2.5 text-xs text-gray-600 pt-2">
              <p>
                The changes for <strong>{updatedData.clientName}</strong> have been saved and real-time synced across devices.
              </p>
              <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-900">
                  <BellOutlined className="text-amber-600" />
                  <span>Notify Client of Changes?</span>
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Para siguradong alam ng customer ang binagong schedule, serbisyo, o presyo, nais mo bang magpadala ng update notice via SMS o Gmail?
                </p>
              </div>
            </div>
          ),
          okText: 'Send SMS / Email Update',
          cancelText: 'Done (No Notification)',
          okButtonProps: {
            className: '!bg-aura-700 hover:!bg-aura-800 !border-none !text-white !font-semibold !rounded-xl !h-9 text-xs'
          },
          cancelButtonProps: {
            className: '!rounded-xl !h-9 text-xs'
          },
          centered: true,
          onOk: () => {
            onNotifyClient(fullUpdated);
          }
        });
      }, 250);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-xl font-bold text-aura-dark">
          <EditOutlined className="text-aura-700" />
          <span>Edit Booking #{appointment.id}</span>
        </div>
      }
      centered
      width={620}
      className="aura-edit-appointment-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4 space-y-4"
      >
        {/* Client Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-aura-50/60 p-3.5 rounded-2xl border border-aura-200">
          <Form.Item
            name="clientName"
            label={<span className="text-xs font-semibold text-aura-800">Client Name *</span>}
            rules={[{ required: true, message: 'Client name required' }]}
            className="!mb-2"
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} className="!rounded-xl" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span className="text-xs font-semibold text-aura-800">Contact Number *</span>}
            rules={[{ required: true, message: 'Phone number required' }]}
            className="!mb-2"
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} className="!rounded-xl" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-xs font-semibold text-aura-800">Email Address (Optional)</span>}
            className="!mb-0"
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} className="!rounded-xl" />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-aura-800">Appointment Status</span>}
            className="!mb-0"
          >
            <Select className="!rounded-xl">
              <Option value="Pending">🟡 Pending (Review)</Option>
              <Option value="Confirmed">🟢 Confirmed (Approved)</Option>
              <Option value="Completed">⚪ Completed (Done)</Option>
              <Option value="Cancelled">🔴 Cancelled</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Schedule Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-aura-200">
          <Form.Item
            name="date"
            label={<span className="text-xs font-semibold text-aura-800">Reserved Date *</span>}
            rules={[{ required: true, message: 'Please select a date' }]}
            className="!mb-0"
          >
            <DatePicker className="w-full !rounded-xl" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="time"
            label={<span className="text-xs font-semibold text-aura-800">Time Slot *</span>}
            rules={[{ required: true, message: 'Please select time' }]}
            className="!mb-0"
          >
            <Select className="!rounded-xl">
              {timeSlots.map(t => {
                const slotTime = typeof t === 'object' && t !== null ? t.time : t;
                const slotPeriod = typeof t === 'object' && t !== null && t.period ? ` (${t.period})` : '';
                return (
                  <Option key={slotTime} value={slotTime}>
                    {slotTime}{slotPeriod}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </div>

        {/* Treatments & Services Management */}
        <div className="bg-white p-4 rounded-2xl border border-aura-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-aura-900 uppercase tracking-wide">
              Booked Treatments & Services ({appointmentServices.length})
            </span>
            <span className="text-xs text-aura-700 font-semibold">
              Subtotal: ₱{subtotal.toLocaleString()}
            </span>
          </div>

          {/* Current Services List */}
          <div className="space-y-2">
            {appointmentServices.map((srv, idx) => (
              <div
                key={`${srv.id}-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-aura-50/80 border border-aura-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-aura-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-gray-800 block">{srv.name}</span>
                    <span className="text-[10px] text-gray-500">{srv.category} • {srv.duration || 'Session'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold text-aura-800">₱{Number(srv.price).toLocaleString()}</span>
                  <Tooltip title="Remove this service (keep other treatments)">
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveService(idx)}
                      disabled={appointmentServices.length <= 1}
                      className="!rounded-lg"
                    />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Treatment Dropdown */}
          <div className="pt-2 border-t border-aura-100 flex items-center gap-2">
            <Select
              placeholder="+ Add another service to this booking..."
              value={serviceToAdd}
              onChange={setServiceToAdd}
              className="flex-1 !rounded-xl text-xs"
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {services.map(s => (
                <Option key={s.id} value={s.id}>
                  {s.name} (₱{s.price.toLocaleString()})
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddService}
              disabled={!serviceToAdd}
              className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl text-xs font-semibold"
            >
              Add Service
            </Button>
          </div>
        </div>

        {/* Pricing Summary & Discount */}
        <div className="bg-aura-900 text-white p-4 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-aura-200">
            <span>Services Subtotal:</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-400 font-semibold">
              <span>Discount Applied:</span>
              <span>-₱{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-2 border-t border-white/20 flex justify-between items-baseline text-sm font-bold">
            <span className="text-white">Amount Due at Clinic:</span>
            <span className="font-serif-luxury text-xl text-aura-300">
              ₱{finalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        <Form.Item
          name="notes"
          label={<span className="text-xs font-semibold text-aura-800">Special Notes & Client Request</span>}
          className="!mb-2"
        >
          <TextArea rows={2} placeholder="Any specific therapist request, skin conditions, or client preferences..." className="!rounded-xl" />
        </Form.Item>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-aura-200">
          <Button onClick={onClose} className="!rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-bold px-6 shadow-md shadow-aura-700/20"
          >
            Save Changes & Sync
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditAppointmentModal;
