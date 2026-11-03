import React, { useState } from 'react';
import { Modal, Input, Button, Alert } from 'antd';
import {
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const AdminAuthModal = ({ open, onClose }) => {
  const { loginAdmin } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError('Please enter the clinic security PIN');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginAdmin(pin.trim());
      setLoading(false);
      if (res.success) {
        setPin('');
        setError('');
        onClose();
      } else {
        setError(res.message);
      }
    }, 400);
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setError('');
        setPin('');
        onClose();
      }}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 420 }}
      className="aura-auth-modal"
    >
      <div className="p-3 sm:p-5 text-center space-y-4">
        {/* Lock Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-aura-800 to-aura-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-aura-700/25">
          <LockOutlined />
        </div>

        <div>
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark">
            Clinic Owner Access
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Protected area. Please enter your 4-digit Security PIN to access revenue, appointments, and client records.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleUnlock} className="space-y-3.5 text-left pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Admin Security PIN
            </label>
            <Input.Password
              prefix={<KeyOutlined className="text-aura-500" />}
              placeholder="Enter 4-digit PIN..."
              maxLength={10}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              autoFocus
              className="!rounded-xl !py-2.5 !text-center !text-lg !tracking-widest font-mono !border-aura-300 focus:!border-aura-600"
            />
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="!rounded-xl !py-1.5 text-xs"
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            icon={<UnlockOutlined />}
            className="!bg-aura-700 hover:!bg-aura-800 !border-none !rounded-xl !h-11 !font-bold text-sm shadow-md shadow-aura-700/20"
          >
            Unlock Dashboard
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <SafetyCertificateOutlined className="text-emerald-500" />
          <span>Encrypted Clinic Staff Session</span>
        </div>
      </div>
    </Modal>
  );
};

export default AdminAuthModal;
