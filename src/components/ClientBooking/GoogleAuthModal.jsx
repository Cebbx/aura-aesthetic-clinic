import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined, CheckCircleFilled } from '@ant-design/icons';

const GoogleAuthModal = ({ open, onClose, onConnect }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = (values) => {
    setSubmitting(true);
    setTimeout(() => {
      const email = values.email.trim().toLowerCase();
      const name = values.name.trim();
      const initial = name.charAt(0).toUpperCase();

      const profile = {
        name,
        email,
        initial,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a73e8,4285f4&textColor=ffffff`
      };

      onConnect(profile);
      setSubmitting(false);
      form.resetFields();
      onClose();
    }, 500);
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 440 }}
      className="google-auth-modal"
    >
      <div className="p-2 sm:p-4 text-center">
        {/* Google Multicolored Logo */}
        <div className="flex justify-center mb-3">
          <svg className="w-9 h-9" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>

        <h3 className="font-sans text-xl font-bold text-gray-800">
          Sign in with Google
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          to auto-fill your appointment with <span className="font-semibold text-aura-800">Aura Aesthetic Clinic</span>
        </p>

        {/* Security / Privacy reassurance banner */}
        <div className="mt-4 mb-4 bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 text-left flex items-start gap-2">
          <CheckCircleFilled className="text-blue-600 text-sm mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-900 leading-tight">
            Please enter your <strong>active Google / Gmail address</strong> to receive your official booking confirmation slip and appointment reminders.
          </p>
        </div>

        {/* Real Google Account Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          className="text-left space-y-3"
        >
          <Form.Item
            name="email"
            label={<span className="text-xs font-semibold text-gray-700">Google Email Address (Gmail) *</span>}
            rules={[
              { required: true, message: 'Please enter your Google email address' },
              { type: 'email', message: 'Please enter a valid email address (e.g. name@gmail.com)' }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="e.g. maria.santos@gmail.com"
              size="large"
              autoFocus
              className="!rounded-xl !border-gray-300 focus:!border-blue-500 text-sm"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-gray-700">Full Name on Google Account *</span>}
            rules={[
              { required: true, message: 'Please enter your full name' },
              { min: 3, message: 'Full name must be at least 3 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="e.g. Maria Santos"
              size="large"
              className="!rounded-xl !border-gray-300 focus:!border-blue-500 text-sm"
            />
          </Form.Item>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                form.resetFields();
                onClose();
              }}
              className="!rounded-xl !border-gray-300 text-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="!bg-[#1a73e8] hover:!bg-[#1557b0] !border-none !rounded-xl !font-semibold text-xs !h-9 shadow-sm"
            >
              Connect & Auto-fill
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default GoogleAuthModal;
