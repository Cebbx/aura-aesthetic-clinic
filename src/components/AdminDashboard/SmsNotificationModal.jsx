import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Tag, message, Tabs, Segmented } from 'antd';
import {
  MessageOutlined,
  CopyOutlined,
  CheckOutlined,
  SendOutlined,
  MailOutlined,
  CheckCircleFilled,
  BellOutlined,
  CheckCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const { TextArea } = Input;

const SmsNotificationModal = ({ open, onClose, appointment, defaultMode = 'approval' }) => {
  const { clinicProfile } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('gmail');
  const [notificationType, setNotificationType] = useState(defaultMode); // 'approval' | 'reminder'
  const [customSms, setCustomSms] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');

  // Update notificationType when defaultMode changes
  useEffect(() => {
    if (defaultMode) {
      setNotificationType(defaultMode);
    }
  }, [defaultMode, appointment]);

  // Synchronize email and sms drafts when appointment or notificationType changes
  useEffect(() => {
    if (appointment) {
      const finalAmt = appointment.finalAmount != null 
        ? appointment.finalAmount 
        : (appointment.totalPrice || 0);

      const clinicName = clinicProfile?.clinicName || 'Aura Aesthetic Clinic';
      const clinicAddress = clinicProfile?.address || '3F Promenade Wing, Bonifacio High Street, BGC Taguig City';
      const clinicPhone = clinicProfile?.phone || '(02) 8812-AURA';

      if (notificationType === 'reminder') {
        // UPCOMING REMINDER TEMPLATE
        const email = `Dear ${appointment.clientName || 'Valued Client'},

Warm greetings from ${clinicName}!

This is a gentle reminder that your scheduled aesthetic treatment is coming up soon.

Appointment Details:
--------------------------------------------------
Reference ID: ${appointment.id || ''}
Procedure: ${appointment.serviceName || ''}
Category: ${appointment.serviceCategory || 'Aesthetic Treatment'}
Scheduled Date: ${appointment.date || ''}
Scheduled Time: ${appointment.time || ''}
Clinic Location: ${clinicAddress}
Total Amount Due: ₱${finalAmt.toLocaleString()} (Pay at clinic)
--------------------------------------------------

Reminders for your visit:
• Kindly arrive 10–15 minutes prior to your slot for skin preparation and doctor consultation.
• If you need to make any adjustments or have any questions, feel free to reply directly to this email or call our concierge hotline at ${clinicPhone}.

We look forward to welcoming you!

Warm regards,
Medical Concierge Team
${clinicName}
Bonifacio Global City, Taguig`;

        const sms = `${clinicName.toUpperCase()} REMINDER
Hi ${appointment.clientName || 'Valued Client'}! Friendly reminder of your upcoming booking:
✨ ${appointment.serviceName || 'treatment'}
📅 Date: ${appointment.date || ''}
⏰ Time: ${appointment.time || ''}
🔖 Ref ID: ${appointment.id || ''}
📍 Location: ${clinicAddress}

Please arrive 10 mins early for skin prep.
Concierge Hotline: ${clinicPhone}. See you! ✨`;

        setCustomEmailBody(email);
        setCustomSms(sms);
      } else if (notificationType === 'update') {
        // BOOKING MODIFICATION / UPDATE TEMPLATE
        const email = `Dear ${appointment.clientName || 'Valued Client'},

Warm greetings from ${clinicName}!

We would like to inform you that your booking details (Ref: ${appointment.id || ''}) have been updated by our clinic front desk.

Updated Booking Summary:
--------------------------------------------------
Reference ID: ${appointment.id || ''}
Procedure(s): ${appointment.serviceName || ''}
Category: ${appointment.serviceCategory || 'Aesthetic Treatment'}
Scheduled Date: ${appointment.date || ''}
Scheduled Time: ${appointment.time || ''}
Clinic Location: ${clinicAddress}
Total Amount Due: ₱${finalAmt.toLocaleString()} (Pay at clinic)
--------------------------------------------------

${appointment.notes ? `Staff Note: "${appointment.notes}"\n\n` : ''}If you have any questions or wish to make further adjustments, feel free to reply directly to this email or call our concierge hotline at ${clinicPhone}.

Thank you for choosing ${clinicName}!

Warm regards,
Medical Concierge Team
${clinicName}
Bonifacio Global City, Taguig`;

        const sms = `${clinicName.toUpperCase()} UPDATE
Hi ${appointment.clientName || 'Valued Client'}!
Your booking (${appointment.id || ''}) has been updated:
✨ Procedures: ${appointment.serviceName || 'treatment'}
📅 Date: ${appointment.date || ''}
⏰ Time: ${appointment.time || ''}
💰 New Total Due: ₱${finalAmt.toLocaleString()}
📍 ${clinicAddress}

Questions or adjustments? Call ${clinicPhone}. See you! ✨`;

        setCustomEmailBody(email);
        setCustomSms(sms);
      } else {
        // APPROVAL NOTICE TEMPLATE
        const email = `Dear ${appointment.clientName || 'Valued Client'},

We are pleased to inform you that your appointment request at ${clinicName} has been APPROVED.

Appointment Details:
--------------------------------------------------
Reference ID: ${appointment.id || ''}
Procedure: ${appointment.serviceName || ''}
Category: ${appointment.serviceCategory || 'Aesthetic Treatment'}
Scheduled Date: ${appointment.date || ''}
Scheduled Time: ${appointment.time || ''}
Clinic Branch: ${clinicAddress}
Total Amount Due: ₱${finalAmt.toLocaleString()} (Zero pre-payment, pay at clinic)
--------------------------------------------------

Kindly arrive 10 minutes prior to your scheduled time.
For rescheduling or inquiries, you may reply directly to this email or contact us at ${clinicPhone}.

Thank you for choosing ${clinicName}!

Warm regards,
${clinicName} Concierge
Bonifacio Global City, Taguig`;

        const sms = `${clinicName.toUpperCase()}
Hi ${appointment.clientName || 'Valued Client'}!

Your booking for ${appointment.serviceName || 'treatment'} is APPROVED:
📅 Date: ${appointment.date || ''}
⏰ Time: ${appointment.time || ''}
🔖 Ref ID: ${appointment.id || ''}
📍 ${clinicAddress}

Please arrive 10 mins before your schedule.
Reception: ${clinicPhone}. See you! ✨`;

        setCustomEmailBody(email);
        setCustomSms(sms);
      }
    }
  }, [appointment, notificationType, clinicProfile]);

  if (!appointment) return null;

  const clientEmail = appointment.email || '';
  const cleanPhone = appointment.phone ? appointment.phone.replace(/\D/g, '') : '';
  const clinicName = clinicProfile?.clinicName || 'Aura Aesthetic Clinic';

  const emailSubject = notificationType === 'reminder'
    ? `Upcoming Appointment Reminder: ${appointment.serviceName} • ${appointment.date} (${appointment.time})`
    : notificationType === 'update'
    ? `Booking Update Notice: ${appointment.serviceName} • ${clinicName} (${appointment.id})`
    : `Appointment Approved: ${appointment.serviceName} • ${clinicName} (${appointment.id})`;

  const handleCopy = (text, typeName) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success(`${typeName} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  // Gmail Web & App links
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(customEmailBody)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(customEmailBody)}`;

  // Mobile SMS / Viber URLs
  const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(customSms)}`;
  const viberUrl = `viber://forward?text=${encodeURIComponent(customSms)}`;

  const tabItems = [
    {
      key: 'gmail',
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs">
          <MailOutlined className="text-red-500" />
          <span>Gmail Dispatcher</span>
          {clientEmail ? (
            <Tag color="green" className="!text-[9px] !mr-0">Ready</Tag>
          ) : (
            <Tag color="default" className="!text-[9px] !mr-0">No email</Tag>
          )}
        </span>
      ),
      children: (
        <div className="space-y-3 pt-2">
          {clientEmail ? (
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">Client Gmail Address</span>
                <span className="font-bold text-blue-900">{clientEmail}</span>
              </div>
              <Tag color="blue" icon={<CheckCircleFilled />} className="!text-[10px]">
                {appointment.bookedVia?.includes('Google') ? 'Google Verified' : 'Registered Email'}
              </Tag>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              Walang nilagay na email si client. Gamitin po ang SMS o Viber sa kabilang tab.
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700">
                {notificationType === 'reminder' ? 'Official Appointment Reminder Email' : 'Official Confirmation Email'}
              </span>
              <span className="text-[10px] text-gray-400">Editable</span>
            </div>
            <TextArea
              rows={6}
              value={customEmailBody}
              onChange={(e) => setCustomEmailBody(e.target.value)}
              className="!rounded-xl font-mono text-xs !bg-gray-50/70"
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <Button
                icon={copied ? <CheckOutlined className="text-emerald-500" /> : <CopyOutlined />}
                onClick={() => handleCopy(customEmailBody, 'Email')}
                className="!rounded-xl !h-10 text-xs font-semibold !border-aura-300 !text-aura-800"
              >
                {copied ? 'Copied!' : 'Copy Email'}
              </Button>

              <a
                href={gmailWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 px-3 rounded-xl !h-10 text-xs font-bold text-white shadow-xs transition-colors ${
                  clientEmail
                    ? 'bg-red-600 hover:bg-red-700 active:scale-[0.99]'
                    : 'bg-gray-300 pointer-events-none'
                }`}
              >
                <MailOutlined />
                <span>Open in Gmail</span>
              </a>
            </div>

            {clientEmail && (
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span>Or open in default Mail App (Apple Mail / Outlook)</span>
              </a>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'sms',
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs">
          <MessageOutlined className="text-emerald-600" />
          <span>SMS & Viber</span>
          <Tag color="cyan" className="!text-[9px] !mr-0">09XX</Tag>
        </span>
      ),
      children: (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between bg-aura-50 p-2.5 rounded-xl border border-aura-200 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-semibold block">Client Mobile</span>
              <span className="font-mono font-bold text-aura-800">{appointment.phone}</span>
            </div>
            <span className="text-[11px] text-gray-500">{appointment.clientName}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700">Pre-formatted Text Message</span>
              <span className="text-[10px] text-gray-400">Editable</span>
            </div>
            <TextArea
              rows={6}
              value={customSms}
              onChange={(e) => setCustomSms(e.target.value)}
              className="!rounded-xl font-mono text-xs !bg-gray-50/70"
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <Button
                icon={copied ? <CheckOutlined className="text-emerald-500" /> : <CopyOutlined />}
                onClick={() => handleCopy(customSms, 'SMS')}
                className="!rounded-xl !h-10 text-xs font-semibold !border-aura-300 !text-aura-800"
              >
                {copied ? 'Copied!' : 'Copy SMS'}
              </Button>

              <a
                href={smsUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 rounded-xl !h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <SendOutlined />
                <span>Open Phone SMS</span>
              </a>
            </div>

            <a
              href={viberUrl}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
            >
              <span>💬 Send via Viber App</span>
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-lg text-aura-dark">
          {notificationType === 'reminder' ? (
            <BellOutlined className="text-amber-600" />
          ) : notificationType === 'update' ? (
            <EditOutlined className="text-blue-600" />
          ) : (
            <SendOutlined className="text-aura-700" />
          )}
          <span>
            {notificationType === 'reminder'
              ? 'Send Appointment Reminder'
              : notificationType === 'update'
              ? 'Notify Client of Booking Update'
              : 'Notify Client of Approval'}
          </span>
        </div>
      }
      footer={null}
      centered
      width={520}
      className="aura-notification-modal"
    >
      <div className="pt-1 space-y-3">
        {/* Mode Switcher */}
        <div className="bg-gray-100 p-1 rounded-xl">
          <Segmented
            block
            value={notificationType}
            onChange={setNotificationType}
            options={[
              {
                label: (
                  <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold">
                    <CheckCircleOutlined className="text-emerald-600" />
                    <span>Approval</span>
                  </div>
                ),
                value: 'approval'
              },
              {
                label: (
                  <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold">
                    <EditOutlined className="text-blue-600" />
                    <span>Booking Update</span>
                  </div>
                ),
                value: 'update'
              },
              {
                label: (
                  <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold">
                    <BellOutlined className="text-amber-600" />
                    <span>Reminder</span>
                  </div>
                ),
                value: 'reminder'
              }
            ]}
          />
        </div>

        {/* Recipient summary banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          notificationType === 'reminder'
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : notificationType === 'update'
            ? 'bg-blue-50/80 border-blue-200/90 text-blue-950'
            : 'bg-emerald-50 border-emerald-200/90 text-emerald-950'
        }`}>
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              <span>{appointment.clientName}</span>
              {notificationType === 'reminder' ? (
                <Tag color="warning" className="!text-[9px] font-semibold">Upcoming Slot</Tag>
              ) : notificationType === 'update' ? (
                <Tag color="blue" className="!text-[9px] font-semibold">Modified Booking</Tag>
              ) : (
                <Tag color="success" className="!text-[9px]">Approved</Tag>
              )}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {appointment.serviceName} • <strong>{appointment.date} at {appointment.time}</strong>
            </div>
          </div>
          <div className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200">
            {appointment.id}
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="aura-notify-tabs"
        />
      </div>
    </Modal>
  );
};

export default SmsNotificationModal;
