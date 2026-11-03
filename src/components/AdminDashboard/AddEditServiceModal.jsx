import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Button, message } from 'antd';
import {
  MedicineBoxOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  TagOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import PhotoUploadBox from '../common/PhotoUploadBox';

const { Option } = Select;
const { TextArea } = Input;

const CATEGORIES = [
  'Hair Care & Scalp',
  'Facial',
  'Slimming',
  'Ingrown Removal',
  'Whitening',
  'Anti-Aging'
];

const DEFAULT_IMAGES = [
  { label: 'Facial & Glow Care', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
  { label: 'Scalp & Hair Care', url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Laser & Clinic Care', url: 'https://images.unsplash.com/photo-1512290900672-1f55b9659f61?auto=format&fit=crop&w=600&q=80' },
  { label: 'Body & Slimming', url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80' }
];

const AddEditServiceModal = ({ open, onClose, serviceToEdit }) => {
  const [form] = Form.useForm();
  const { addService, updateService } = useApp();
  const isEditing = !!serviceToEdit;

  useEffect(() => {
    if (open) {
      if (serviceToEdit) {
        form.setFieldsValue({
          name: serviceToEdit.name,
          category: serviceToEdit.category,
          price: serviceToEdit.price,
          originalPrice: serviceToEdit.originalPrice,
          duration: serviceToEdit.duration || '45 mins',
          promoBadge: serviceToEdit.promoBadge || '',
          image: serviceToEdit.image || DEFAULT_IMAGES[0].url,
          popular: serviceToEdit.popular || false,
          active: serviceToEdit.active !== false,
          description: serviceToEdit.description || '',
          includesText: (serviceToEdit.includes || []).join('\n')
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          category: 'Facial',
          duration: '45 mins',
          active: true,
          popular: false,
          image: DEFAULT_IMAGES[0].url
        });
      }
    }
  }, [open, serviceToEdit, form]);

  const handleFinish = (values) => {
    const includes = values.includesText
      ? values.includesText.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Consultation', 'Clinic Treatment', 'Post-treatment Care'];

    const payload = {
      name: values.name.trim(),
      category: values.category,
      price: Number(values.price),
      originalPrice: values.originalPrice ? Number(values.originalPrice) : undefined,
      duration: values.duration,
      promoBadge: values.promoBadge ? values.promoBadge.trim() : undefined,
      image: values.image || DEFAULT_IMAGES[0].url,
      popular: !!values.popular,
      active: values.active !== false,
      description: values.description ? values.description.trim() : '',
      includes
    };

    if (isEditing) {
      updateService(serviceToEdit.id, payload);
      message.success(`Updated "${payload.name}" successfully!`);
    } else {
      addService(payload);
      message.success(`Added new treatment "${payload.name}"!`);
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-lg text-aura-dark">
          <MedicineBoxOutlined className="text-aura-700" />
          <span>{isEditing ? 'Edit Treatment Procedure' : 'Add New Clinic Service'}</span>
        </div>
      }
      footer={null}
      centered
      width={560}
      className="aura-service-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4 space-y-3"
      >
        <Form.Item
          name="name"
          label={<span className="text-xs font-semibold">Treatment Name *</span>}
          rules={[{ required: true, message: 'Please enter service name' }]}
        >
          <Input placeholder="e.g. Korean Diamond HydroPeel" className="!rounded-xl !py-2" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="category"
            label={<span className="text-xs font-semibold">Category *</span>}
            rules={[{ required: true, message: 'Select category' }]}
          >
            <Select className="w-full !rounded-xl">
              {CATEGORIES.map(c => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label={<span className="text-xs font-semibold">Procedure Duration *</span>}
            rules={[{ required: true, message: 'Select duration' }]}
          >
            <Select className="w-full !rounded-xl">
              <Option value="30 mins">30 mins</Option>
              <Option value="45 mins">45 mins</Option>
              <Option value="50 mins">50 mins</Option>
              <Option value="60 mins">60 mins (1 hour)</Option>
              <Option value="75 mins">75 mins</Option>
              <Option value="90 mins">90 mins (1.5 hours)</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="price"
            label={<span className="text-xs font-semibold">Offer Price (₱) *</span>}
            rules={[{ required: true, message: 'Enter offer price' }]}
          >
            <InputNumber
              prefix="₱"
              min={0}
              step={100}
              className="!w-full !rounded-xl !py-1"
              placeholder="1899"
            />
          </Form.Item>

          <Form.Item
            name="originalPrice"
            label={<span className="text-xs font-semibold">Original Price (₱) (Optional)</span>}
          >
            <InputNumber
              prefix="₱"
              min={0}
              step={100}
              className="!w-full !rounded-xl !py-1"
              placeholder="2500"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="promoBadge"
          label={<span className="text-xs font-semibold">Promo Badge Tag (Optional)</span>}
        >
          <Input placeholder="e.g. Save ₱600 or 25% OFF" className="!rounded-xl !py-2" prefix={<TagOutlined className="text-gray-400" />} />
        </Form.Item>

        <Form.Item
          name="image"
          className="!mb-3"
        >
          <PhotoUploadBox
            label="Treatment Cover Photo (Upload from Phone Camera or Files)"
            presetImages={DEFAULT_IMAGES}
          />
        </Form.Item>

        <div className="bg-aura-50/60 p-3 rounded-xl border border-aura-200/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Form.Item name="active" valuePropName="checked" noStyle>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
            <div>
              <div className="text-xs font-bold text-gray-800">Booking Availability</div>
              <div className="text-[10px] text-gray-500">Allow clients to book this treatment online</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Form.Item name="popular" valuePropName="checked" noStyle>
              <Switch checkedChildren="★" unCheckedChildren="Off" />
            </Form.Item>
            <span className="text-xs font-semibold text-gray-700">Top Treatment</span>
          </div>
        </div>

        <Form.Item
          name="description"
          label={<span className="text-xs font-semibold">Treatment Summary Description</span>}
        >
          <TextArea
            rows={2}
            placeholder="Brief clinical overview of the procedure, results, and benefits..."
            className="!rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="includesText"
          label={<span className="text-xs font-semibold">Included Steps (One per line)</span>}
        >
          <TextArea
            rows={2}
            placeholder="e.g.&#10;Double Cleansing&#10;Ultrasound Infusion&#10;Calming Cryo Gel Mask"
            className="!rounded-xl text-xs"
          />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2 border-t border-aura-100">
          <Button onClick={onClose} className="!rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !text-white font-semibold"
          >
            {isEditing ? 'Save Changes' : 'Create Treatment'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddEditServiceModal;
