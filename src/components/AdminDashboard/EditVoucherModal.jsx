import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Radio, message } from 'antd';
import {
  TagOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;

const EditVoucherModal = ({ open, onClose, voucher }) => {
  const [form] = Form.useForm();
  const { updateVoucher, services } = useApp();
  const voucherType = Form.useWatch('voucherType', form) || 'public';

  const categories = Array.from(new Set((services || []).map(s => s.category).filter(Boolean)));

  useEffect(() => {
    if (voucher && open) {
      const isPersonal = voucher.voucherType === 'personal' ||
        (voucher.clientName && !voucher.clientName.includes('Open to All') && !voucher.clientName.includes('(Claimed)') && voucher.clientPhone && voucher.clientPhone !== 'Public Promo' && voucher.clientPhone !== 'N/A');

      form.setFieldsValue({
        code: voucher.code,
        voucherType: voucher.voucherType || (isPersonal ? 'personal' : 'public'),
        maxUses: voucher.maxUses || 1,
        clientName: voucher.clientName,
        clientPhone: voucher.clientPhone === 'N/A' || voucher.clientPhone === 'Public Promo' ? '' : voucher.clientPhone,
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
    const isPublic = values.voucherType !== 'personal';

    updateVoucher(voucher.code, {
      voucherType: values.voucherType,
      maxUses: isPublic ? (Number(values.maxUses) || 1) : 1,
      clientName: isPublic ? (voucher.usedCount > 0 ? voucher.clientName : 'Open to All (Paunahan)') : (values.clientName ? values.clientName.trim() : 'VIP Client'),
      clientPhone: isPublic ? (voucher.usedCount > 0 ? voucher.clientPhone : 'Public Promo') : (values.clientPhone ? values.clientPhone.trim() : 'N/A'),
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
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Form.Item
          name="voucherType"
          label={<span className="text-xs font-semibold">Voucher Campaign Type</span>}
        >
          <Radio.Group className="w-full grid grid-cols-2 gap-2" buttonStyle="solid">
            <Radio.Button value="public" className="!rounded-xl text-center text-xs !py-1 !h-auto">
              ⚡ Paunahan (Public Promo)
            </Radio.Button>
            <Radio.Button value="personal" className="!rounded-xl text-center text-xs !py-1 !h-auto">
              💎 Exclusive VIP Pass
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

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

        {/* Public Paunahan Info Box OR Personal Client Input */}
        {voucherType === 'public' ? (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 mb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <ThunderboltOutlined className="text-amber-600" />
                <span>Open Promo (First-Come, First-Served)</span>
              </div>
              <span className="text-[10px] bg-amber-200/60 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                {voucher.usedCount ? `${voucher.usedCount} Claimed` : 'No Name Needed'}
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed m-0">
              {voucher.usedCount > 0
                ? `Kasalukuyang may ${voucher.usedCount} customer nang nag-claim sa voucher na ito (${voucher.clientName}).`
                : 'Bukas ito sa lahat ng client at paunahan silang mag-book. Ang unang mag-book ang magiging opisyal na winner!'}
            </p>
            <Form.Item
              name="maxUses"
              label={<span className="text-xs font-semibold text-amber-950">Total Available Slots (Ilan ang pwedeng makakuha bago maubos?)</span>}
              className="!mb-0"
            >
              <InputNumber
                min={Math.max(1, voucher.usedCount || 1)}
                max={50}
                className="w-full !rounded-xl text-xs"
                placeholder="1 (Single Winner)"
              />
            </Form.Item>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="clientName"
              label={<span className="text-xs font-semibold">Exclusive VIP Name *</span>}
              rules={[{ required: true, message: 'Enter VIP client name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="e.g. Ms. Camille De Guzman" className="!rounded-xl !py-2 text-xs" />
            </Form.Item>

            <Form.Item
              name="clientPhone"
              label={<span className="text-xs font-semibold">VIP Mobile *</span>}
              rules={[{ required: true, message: 'Enter client mobile' }]}
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
        )}

        <Form.Item
          name="serviceCategory"
          label={<span className="text-xs font-semibold">Eligible Procedure or Category *</span>}
          rules={[{ required: true, message: 'Please select eligible category or treatment' }]}
        >
          <Select
            showSearch
            placeholder="Select all services, a category, or a specific treatment"
            className="w-full !rounded-xl"
            optionFilterProp="children"
          >
            <Select.OptGroup label="GENERAL CLINIC ACCESS">
              <Option value="All Services">✨ All Aesthetic Services (Entire Clinic Menu)</Option>
            </Select.OptGroup>

            <Select.OptGroup label="BY TREATMENT CATEGORY">
              {categories.map(cat => (
                <Option key={cat} value={cat}>
                  📂 {cat} (All treatments in this category)
                </Option>
              ))}
            </Select.OptGroup>

            <Select.OptGroup label="BY SPECIFIC TREATMENT / PROCEDURE">
              {(services || []).map(srv => (
                <Option key={srv.id} value={`Treatment: ${srv.name}`}>
                  💆‍♀️ {srv.name} (₱{Number(srv.price).toLocaleString()} • {srv.category})
                </Option>
              ))}
            </Select.OptGroup>
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
