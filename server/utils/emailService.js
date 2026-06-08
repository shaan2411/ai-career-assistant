/**
 * utils/emailService.js — Email Notification Service
 *
 * Uses Nodemailer to send transactional emails.
 * Configure SMTP credentials in the .env file.
 */

const nodemailer = require('nodemailer');

// ─── Transporter Setup ────────────────────────────────────────────────────────

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured. Email notifications will not work.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

let transporter = null;

// ─── Email Templates ──────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #0F0F1A; color: #E2E8F0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #1A1A2E; border-radius: 16px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.2); }
    .header { background: linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
    .body { padding: 32px; }
    .body p { color: #94A3B8; line-height: 1.7; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 16px 0; }
    .footer { border-top: 1px solid rgba(108, 99, 255, 0.2); padding: 20px 32px; text-align: center; color: #4A5568; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 AI Career Assistant</h1>
      <p>Your AI-powered career companion</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AI Career Assistant. All rights reserved.</p>
      <p>You received this email because you registered on our platform.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Core Send Function ───────────────────────────────────────────────────────

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body content
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }

    if (!transporter) {
      console.log(`📧 [Email Skipped - Not Configured] To: ${to} | Subject: ${subject}`);
      return { success: false, reason: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"AI Career Assistant" <noreply@aicareer.com>',
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent: ${info.messageId} → ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't throw — email failures should not break main app flow
    return { success: false, error: error.message };
  }
};

// ─── Specific Email Functions ─────────────────────────────────────────────────

/**
 * Send welcome email to new user
 * @param {Object} user - User object with name and email
 */
const sendWelcomeEmail = async (user) => {
  const content = `
    <h2 style="color: #6C63FF;">Welcome aboard, ${user.name}! 🎉</h2>
    <p>We're thrilled to have you join the <strong>AI Career Assistant</strong> community. Your AI-powered career journey starts now!</p>
    <p>Here's what you can do with your new account:</p>
    <ul style="color: #94A3B8;">
      <li>📄 Upload your resume for AI-powered analysis</li>
      <li>🎯 Practice mock interviews with AI feedback</li>
      <li>💼 Discover job opportunities matched to your skills</li>
      <li>📚 Get a personalized learning roadmap</li>
    </ul>
    <p>Get started by completing your profile:</p>
    <a href="${process.env.CLIENT_URL}/profile" class="btn">Complete My Profile →</a>
    <p style="color: #4A5568; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to AI Career Assistant, ${user.name}! 🚀`,
    html: baseTemplate(content),
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const content = `
    <h2 style="color: #6C63FF;">Password Reset Request 🔐</h2>
    <p>Hi ${user.name},</p>
    <p>You requested to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset My Password →</a>
    <p style="color: #4A5568; font-size: 14px;">If you didn't request this, please ignore this email. Your password won't change.</p>
    <p style="color: #4A5568; font-size: 14px;">Or copy this link: ${resetUrl}</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'AI Career Assistant — Password Reset Request',
    html: baseTemplate(content),
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
