import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;

const AddAppointmentModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { services, timeSlots, addAppointment } = useApp();

  const handleFinish = (values) => {
    const selectedSrv = services.find(s => s.id === values.serviceId);
    
    addAppointment({
      clientName: values.clientName.trim(),
      phone: values.phone.trim(),
      email: values.email || '',
      serviceId: values.serviceId,
      serviceName: selectedSrv ? selectedSrv.name : 'Custom Procedure',
      serviceCategory: selectedSrv ? selectedSrv.category : 'General',
      date: values.date.format('YYYY-MM-DD'),
      time: values.time,
      totalPrice: selectedSrv ? selectedSrv.price : 1500,
      discountApplied: 0,
      finalAmount: selectedSrv ? selectedSrv.price : 1500,
      notes: values.notes || 'Walk-in / Front Desk booking',
      status: 'Confirmed'
    });

    message.success('Walk-in appointment recorded successfully!');
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="font-serif-luxury text-xl font-bold text-aura-dark">
          + Record Walk-in / Phone Appointment
        </div>
      }
      centered
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
        initialValues={{
          date: dayjs(),
          time: '10:30 AM'
        }}
        className="mt-4"
      >
        <Form.Item
          name="clientName"
          label={<span className="text-xs font-semibold">Client Full Name *</span>}
          rules={[{ required: true, message: 'Please enter client name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="e.g. Dra. Bea Alonzo" className="!rounded-xl !py-2" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="phone"
            label={<span className="text-xs font-semibold">PH Mobile Number *</span>}
            normalize={(value) => (value ? value.replace(/\D/g, '').slice(0, 12) : '')}
            rules={[
              { required: true, message: 'Please enter phone' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const digits = value.replace(/\D/g, '');
                  const is11PH = /^09\d{9}$/.test(digits);
                  const is12PH = /^639\d{9}$/.test(digits);
                  if (!is11PH && !is12PH) {
                    return Promise.reject(new Error('Dapat valid PH number (hal. 09171234567)'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="09171234567"
              maxLength={12}
              inputMode="numeric"
              pattern="[0-9]*"
              className="!rounded-xl !py-2 font-mono"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-xs font-semibold">Email</span>}
          >
            <Input placeholder="client@email.com" className="!rounded-xl !py-2" />
          </Form.Item>
        </div>

        <Form.Item
          name="serviceId"
          label={<span className="text-xs font-semibold">Select Procedure *</span>}
          rules={[{ required: true, message: 'Select service' }]}
        >
          <Select placeholder="Choose treatment..." className="w-full !rounded-xl">
            {services.map(s => (
              <Option key={s.id} value={s.id}>
                {s.name} — ₱{s.price.toLocaleString()} ({s.duration})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="date"
            label={<span className="text-xs font-semibold">Date *</span>}
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full !rounded-xl !py-2" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="time"
            label={<span className="text-xs font-semibold">Time Slot *</span>}
            rules={[{ required: true }]}
          >
            <Select className="w-full !rounded-xl">
              {timeSlots.map(t => (
                <Option key={t.time} value={t.time}>
                  {t.time} ({t.period})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="notes"
          label={<span className="text-xs font-semibold">Staff Notes & Concerns</span>}
        >
          <Input.TextArea rows={2} placeholder="Add specific notes or assigned therapist..." className="!rounded-xl text-xs" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose} className="!rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold"
          >
            Save Appointment
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddAppointmentModal;
