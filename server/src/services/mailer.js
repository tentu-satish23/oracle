import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OOP'S ORACLE Production Mailer Engine
 * Supports real SMTP delivery (Gmail, Outlook, AWS SES, Mailgun, custom SMTP)
 * with graceful fallback to console and client-visible reset link.
 */

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log(`📧 Configured real SMTP email transporter: ${host}:${port} (${user})`);
  } else if (user && pass && !host) {
    // Default to Gmail service if user/pass provided without host
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
    console.log(`📧 Configured Gmail email transporter for ${user}`);
  }

  return transporter;
}

/**
 * Send password reset email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.username - Recipient username or full name
 * @param {string} params.resetLink - Full URL to reset password
 */
export async function sendPasswordResetEmail({ to, username, resetLink }) {
  const from = process.env.SMTP_FROM || `"OOP'S ORACLE" <no-reply@oopsoracle.com>`;
  const subject = "Reset Your OOP'S ORACLE Password";

  const textContent = `Hello ${username || 'Developer'},

You requested a password reset for your OOP'S ORACLE account.
Click the link below to set your new password (valid for 60 minutes):

${resetLink}

If you did not request this, you can safely ignore this email.

Best regards,
OOP'S ORACLE Engineering Team`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0B1120; color: #F8FAFC; margin: 0; padding: 24px; }
        .card { max-width: 560px; margin: 0 auto; background: #151F32; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); }
        .logo { font-size: 20px; font-weight: 800; color: #F89820; letter-spacing: 0.5px; margin-bottom: 24px; }
        .title { font-size: 22px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px; }
        .body-text { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
        .button { display: inline-block; background: linear-gradient(135deg, #F89820 0%, #E88712 100%); color: #000000 !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin: 12px 0 24px 0; }
        .link-box { background: #0B1120; border: 1px solid rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #38BDF8; word-break: break-all; margin-top: 16px; }
        .footer { font-size: 12px; color: #64748B; margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">☕ OOP'S ORACLE</div>
        <div class="title">Password Reset Request</div>
        <div class="body-text">
          Hello <strong>${username || 'Developer'}</strong>,<br><br>
          We received a request to reset the password for your account associated with <strong>${to}</strong>.<br>
          Click the button below to choose a new password:
        </div>
        <div style="text-align: center;">
          <a href="${resetLink}" class="button" target="_blank">Reset My Password</a>
        </div>
        <div class="body-text" style="font-size: 13px;">
          This link will expire in <strong>60 minutes</strong>. If you did not make this request, you can safely ignore this email.
        </div>
        <div class="link-box">
          ${resetLink}
        </div>
        <div class="footer">
          OOP'S ORACLE — Master Java. Master Logic. Build Your Future.<br>
          This is an automated security transmission.
        </div>
      </div>
    </body>
    </html>
  `;

  const transport = getTransporter();

  // Try real SMTP delivery if configured
  if (transport) {
    try {
      const info = await transport.sendMail({
        from,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });
      console.log(`✅ [Real SMTP] Password reset email delivered to ${to} (Message ID: ${info.messageId})`);
      return {
        success: true,
        delivered: true,
        messageId: info.messageId,
        message: `Password reset link delivered to your email inbox (${to}).`
      };
    } catch (err) {
      console.warn(`⚠️ [SMTP Warning] Failed to deliver via SMTP (${err.message}). Falling back to instant direct link.`);
      return {
        success: true,
        delivered: false,
        fallback: true,
        error: err.message,
        message: `Generated reset link for ${to}. (SMTP delivery note: ${err.message})`
      };
    }
  }

  // Fallback when SMTP is not yet configured in .env
  console.log(`ℹ️ [Mailer Notice] Real SMTP credentials (SMTP_USER/SMTP_PASS) not configured in server/.env.`);
  console.log(`   Reset Link generated: ${resetLink}`);
  return {
    success: true,
    delivered: false,
    needsSmtpConfig: true,
    message: `Password reset link created for ${to}.`
  };
}
