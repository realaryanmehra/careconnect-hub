import nodemailer from 'nodemailer';

// Transporter is initialized lazily to ensure environment variables are loaded
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return null;
    }
    
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email notification to a patient
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body content
 */
export const sendEmailNotification = async (to, subject, text) => {
  console.log(`📧 Attempting to send email to: ${to}`);
  
  const currentTransporter = getTransporter();

  if (!currentTransporter) {
    console.log('📧 Email credentials not found in .env. Skipping email notification.');
    return;
  }

  try {
    const info = await currentTransporter.sendMail({
      from: `"CareConnect Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    return false;
  }
};

export default { sendEmailNotification };
