/**
 * Real Email Dispatcher for Aura Clinic Security OTPs
 * Dispatches live OTP codes directly to Clinic Director (edwarddufale3@gmail.com)
 */

export const normalizeRecipientEmail = (email) => {
  if (!email) return 'edwarddufale3@gmail.com';
  return email
    .trim()
    .toLowerCase()
    .replace(/@gamil\.com$/i, '@gmail.com');
};

export const sendRealOtpEmail = async ({
  toEmail = 'edwarddufale3@gmail.com',
  staffName = 'Clinic Staff Member',
  staffEmail = '',
  roleTitle = 'Front Desk Co-Admin',
  otpCode = '000000',
  expiresInMinutes = 10
}) => {
  const cleanToEmail = normalizeRecipientEmail(toEmail);
  const subject = `[AURA CLINIC] Security OTP: ${otpCode} for ${staffName}`;
  const messageBody = `
========================================
AURA AESTHETIC CLINIC SECURITY ALERT
========================================

Hello Clinic Director,

A staff member is requesting access to the Aura Clinic Portal:

• Staff Name: ${staffName}
• Staff Email: ${staffEmail || 'Authorized Staff'}
• Department: ${roleTitle}
• Request Time: ${new Date().toLocaleTimeString()}

----------------------------------------
YOUR 6-DIGIT STAFF ACCESS CODE:
>>  ${otpCode}  <<
----------------------------------------

* This code is valid for ${expiresInMinutes} minutes.
* Only share this code with authorized clinic staff on duty.

Regards,
Aura Aesthetic Medical Group Security
  `.trim();

  // Check if user has configured custom Google Apps Script Webhook
  let webhookUrl = '';
  try {
    webhookUrl = localStorage.getItem('aura_email_webhook_url') || '';
  } catch (e) {
    console.error(e);
  }

  // 1. If Google Apps Script Webhook is active:
  if (webhookUrl && webhookUrl.trim().startsWith('http')) {
    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          to: cleanToEmail,
          subject,
          message: messageBody,
          staffName,
          roleTitle,
          otpCode,
          expiresInMinutes
        }),
        mode: 'no-cors' // Allows direct browser POST without CORS preflight blocker
      });
      console.log(`[Aura Real Mailer] Webhook dispatched to ${cleanToEmail} via Google Script!`);
      return {
        success: true,
        method: 'google-script',
        message: `Real email successfully dispatched to ${cleanToEmail} via Google Apps Script!`
      };
    } catch (err) {
      console.warn('Google Script Webhook failed, falling back:', err);
    }
  }

  // 2. Check if EmailJS config is present
  let emailJsConfig = null;
  try {
    const raw = localStorage.getItem('aura_emailjs_config');
    if (raw) emailJsConfig = JSON.parse(raw);
  } catch (e) {}

  if (emailJsConfig && emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey) {
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailJsConfig.serviceId,
          template_id: emailJsConfig.templateId,
          user_id: emailJsConfig.publicKey,
          template_params: {
            to_email: cleanToEmail,
            subject,
            staff_name: staffName,
            otp_code: otpCode,
            message: messageBody
          }
        })
      });
      if (res.ok) {
        return {
          success: true,
          method: 'emailjs',
          message: `Real email sent to ${cleanToEmail} via EmailJS!`
        };
      }
    } catch (err) {
      console.warn('EmailJS send error:', err);
    }
  }

  // 3. Fallback: Return in-app status
  console.log(`[Aura Real Mailer] Dispatched OTP ${otpCode} intended for ${cleanToEmail}`);
  return {
    success: true,
    method: 'in-app-sync',
    message: `OTP Code generated for ${cleanToEmail}. Set up Google Webhook in Staff Security tab to trigger direct Gmail inbox delivery.`
  };
};

/**
 * Test the Real Email Webhook Connection
 */
export const testRealEmailConnection = async (webhookUrl, toEmail = 'edwarddufale3@gmail.com') => {
  const cleanToEmail = normalizeRecipientEmail(toEmail);
  const testOtp = String(Math.floor(100000 + Math.random() * 900000));
  
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Please provide a valid Google Apps Script Web App URL.'
    };
  }

  try {
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        to: cleanToEmail,
        subject: `[AURA CLINIC TEST] Connection Verified! Test OTP: ${testOtp}`,
        staffName: 'Test Connection System',
        roleTitle: 'Clinic Director Diagnostics',
        otpCode: testOtp,
        expiresInMinutes: 10,
        message: `Hello Dr. Aura,\n\nYour Aura Aesthetic Clinic live email connection is working successfully!\nTest Code: ${testOtp}\n\nAll future staff login OTPs will be delivered directly to this Gmail.`
      }),
      mode: 'no-cors'
    });

    return {
      success: true,
      testOtp,
      message: `Test email dispatched to ${cleanToEmail}! Please check your Gmail Inbox (or Spam folder once).`
    };
  } catch (err) {
    return {
      success: false,
      message: `Dispatch error: ${err.message}`
    };
  }
};
