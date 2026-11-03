import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Radio, message } from 'antd';
import {
  TagOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  StarOutlined,
  GiftOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;

const CreateVoucherModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { issueVoucher, services } = useApp();
  const voucherType = Form.useWatch('voucherType', form) || 'public';

  const categories = Array.from(new Set((services || []).map(s => s.category).filter(Boolean)));

  const handleFinish = (values) => {
    const isPublic = values.voucherType !== 'personal';

    const newVoucher = issueVoucher({
      code: values.code ? values.code.trim().toUpperCase() : undefined,
      voucherType: values.voucherType || 'public',
      maxUses: isPublic ? (Number(values.maxUses) || 1) : 1,
      clientName: isPublic ? 'Open to All (Paunahan)' : (values.clientName ? values.clientName.trim() : 'VIP Client'),
      clientPhone: isPublic ? 'Public Promo' : (values.clientPhone ? values.clientPhone.trim() : 'N/A'),
      serviceCategory: values.serviceCategory || 'All Services',
      discountAmount: Number(values.discountAmount),
      minSpend: Number(values.minSpend) || 1000,
      expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : dayjs().add(60, 'day').format('YYYY-MM-DD')
    });

    message.success(`Voucher ${newVoucher.code} created successfully!`);
    form.resetFields();
    onClose();
  };

  const handleGenerateCode = () => {
    const prefix = voucherType === 'personal' ? 'VIP' : 'PROMO';
    const randomCode = `AURA-${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    form.setFieldsValue({ code: randomCode });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="font-serif-luxury text-xl font-bold text-aura-dark flex items-center gap-2">
          <StarOutlined className="text-aura-600" />
          <span>Issue Promotional Voucher</span>
        </div>
      }
      centered
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          voucherType: 'public',
          maxUses: 1,
          discountAmount: 500,
          minSpend: 1500,
          serviceCategory: 'All Services',
          expiryDate: dayjs().add(45, 'day')
        }}
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
          label={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold">Voucher Code (Optional or auto-generate)</span>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-[11px] text-aura-600 hover:text-aura-800 underline font-normal"
              >
                Auto-generate
              </button>
            </div>
          }
        >
          <Input
            prefix={<TagOutlined className="text-aura-400" />}
            placeholder="e.g. SUMMER-500 or PAUNAHAN-GLOW"
            className="!rounded-xl !py-2 uppercase font-mono font-bold"
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
                No Name/Phone Needed
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed m-0">
              Hindi kailangan ilagay ang pangalan o phone. Bukas ito sa lahat ng client at paunahan silang mag-book. Ang unang mag-book ang magiging opisyal na winner!
            </p>
            <Form.Item
              name="maxUses"
              label={<span className="text-xs font-semibold text-amber-950">Available Slots (Ilang customer ang pwedeng makakuha bago maubos?)</span>}
              className="!mb-0"
            >
              <InputNumber
                min={1}
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
              rules={[{ required: true, message: 'Enter mobile number' }]}
              normalize={(value) => (value ? value.replace(/\D/g, '').slice(0, 12) : '')}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="09171234567"
                maxLength={12}
                inputMode="numeric"
                pattern="[0-9]*"
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
              className="w-full !rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="minSpend"
            label={<span className="text-xs font-semibold">Min Spend Required (₱)</span>}
          >
            <InputNumber
              prefix="₱"
              min={0}
              step={100}
              className="w-full !rounded-xl"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="expiryDate"
          label={<span className="text-xs font-semibold">Valid Until (Expiry Date) *</span>}
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full !rounded-xl !py-2" format="YYYY-MM-DD" />
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
            Issue Voucher
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateVoucherModal;
