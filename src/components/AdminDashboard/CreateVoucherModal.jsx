import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message } from 'antd';
import {
  TagOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const { Option } = Select;

const CreateVoucherModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { issueVoucher, services } = useApp();

  const categories = Array.from(new Set((services || []).map(s => s.category).filter(Boolean)));

  const handleFinish = (values) => {
    const newVoucher = issueVoucher({
      code: values.code ? values.code.trim().toUpperCase() : undefined,
      clientName: values.clientName ? values.clientName.trim() : 'Valued Client',
      clientPhone: values.clientPhone ? values.clientPhone.trim() : 'N/A',
      serviceCategory: values.serviceCategory || 'All Services',
      discountAmount: values.discountAmount,
      minSpend: values.minSpend || 1000,
      expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : dayjs().add(60, 'day').format('YYYY-MM-DD')
    });

    message.success(`Voucher ${newVoucher.code} created successfully!`);
    form.resetFields();
    onClose();
  };

  const handleGenerateCode = () => {
    const randomCode = `AURA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
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
          <span>Issue New Promotional Voucher</span>
        </div>
      }
      centered
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          discountAmount: 500,
          minSpend: 1500,
          serviceCategory: 'All Services',
          expiryDate: dayjs().add(45, 'day')
        }}
        className="mt-4"
      >
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
            placeholder="e.g. SUMMER-GLOW-500"
            className="!rounded-xl !py-2 uppercase"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="clientName"
            label={<span className="text-xs font-semibold">Recipient Client Name</span>}
          >
            <Input prefix={<UserOutlined />} placeholder="e.g. VIP Promo or Client Name" className="!rounded-xl !py-2" />
          </Form.Item>

          <Form.Item
            name="clientPhone"
            label={<span className="text-xs font-semibold">Client PH Mobile</span>}
            normalize={(value) => (value ? value.replace(/\D/g, '').slice(0, 12) : '')}
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
        </div>

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
