import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message } from 'antd';
import {
  TagOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;

const EditVoucherModal = ({ open, onClose, voucher }) => {
  const [form] = Form.useForm();
  const { updateVoucher } = useApp();

  useEffect(() => {
    if (voucher && open) {
      form.setFieldsValue({
        code: voucher.code,
        clientName: voucher.clientName,
        clientPhone: voucher.clientPhone === 'N/A' ? '' : voucher.clientPhone,
        serviceCategory: voucher.serviceCategory || 'All Services',
        discountAmount: Number(voucher.discountAmount) || 500,
        minSpend: Number(voucher.minSpend) || 1500,
        expiryDate: voucher.expiryDate ? dayjs(voucher.expiryDate) : dayjs().add(60, 'day'),
        status: voucher.status || 'Unredeemed'
      });
    }
  }, [voucher, open, form]);

  if (!voucher) return null;

  const handleFinish = (values) => {
    updateVoucher(voucher.code, {
      clientName: values.clientName ? values.clientName.trim() : 'Valued Client',
      clientPhone: values.clientPhone ? values.clientPhone.trim() : 'N/A',
      serviceCategory: values.serviceCategory || 'All Services',
      discountAmount: Number(values.discountAmount),
      minSpend: Number(values.minSpend) || 1000,
      expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : voucher.expiryDate,
      status: values.status
    });

    message.success(`Voucher ${voucher.code} updated successfully!`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="font-serif-luxury text-xl font-bold text-aura-dark flex items-center gap-2">
          <EditOutlined className="text-aura-700" />
          <span>Edit Voucher #{voucher.code}</span>
        </div>
      }
      centered
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Form.Item
          name="code"
          label={<span className="text-xs font-semibold">Voucher Code</span>}
        >
          <Input
            prefix={<TagOutlined className="text-aura-400" />}
            disabled
            className="!rounded-xl !py-2 font-mono font-bold bg-gray-50 text-aura-900"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="clientName"
            label={<span className="text-xs font-semibold">Recipient Client Name</span>}
          >
            <Input prefix={<UserOutlined />} placeholder="e.g. VIP Promo or Client Name" className="!rounded-xl !py-2 text-xs" />
          </Form.Item>

          <Form.Item
            name="clientPhone"
            label={<span className="text-xs font-semibold">Client Mobile</span>}
            normalize={(value) => (value ? value.replace(/\D/g, '').slice(0, 12) : '')}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="09171234567"
              maxLength={12}
              inputMode="numeric"
              className="!rounded-xl !py-2 font-mono text-xs"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="serviceCategory"
          label={<span className="text-xs font-semibold">Eligible Treatment Category</span>}
        >
          <Select className="w-full !rounded-xl">
            <Option value="All Services">All Aesthetic Services</Option>
            <Option value="Facial">Facial & Aqua Peels Only</Option>
            <Option value="Slimming">Slimming & Contouring Only</Option>
            <Option value="Whitening">Whitening & Drip Only</Option>
            <Option value="Ingrown Removal">Ingrown Removal & Nail Care</Option>
            <Option value="Anti-Aging">Anti-Aging & HIFU Only</Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="discountAmount"
            label={<span className="text-xs font-semibold">Discount Value (₱) *</span>}
            rules={[{ required: true, message: 'Enter discount amount' }]}
          >
            <InputNumber
              prefix="₱"
              min={50}
              step={50}
              className="w-full !rounded-xl text-xs"
            />
          </Form.Item>

          <Form.Item
            name="minSpend"
            label={<span className="text-xs font-semibold">Minimum Spend (₱) *</span>}
            rules={[{ required: true, message: 'Enter minimum spend' }]}
          >
            <InputNumber
              prefix="₱"
              min={100}
              step={100}
              className="w-full !rounded-xl text-xs"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="expiryDate"
            label={<span className="text-xs font-semibold">Expiry Date</span>}
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full !rounded-xl text-xs" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold">Voucher Status</span>}
            rules={[{ required: true }]}
          >
            <Select className="w-full !rounded-xl text-xs">
              <Option value="Unredeemed">Unredeemed</Option>
              <Option value="Redeemed">Redeemed</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
          <Button onClick={onClose} className="!rounded-xl text-xs">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold text-xs px-5 shadow-xs"
          >
            Save Voucher Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditVoucherModal;
