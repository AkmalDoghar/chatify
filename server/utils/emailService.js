const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async ({ to, otp, purpose }) => {
  const transporter = createTransporter();

  const isSignup = purpose === 'signup';

  const subject = isSignup
    ? '✉️ Verify your Chatify account'
    : '🔑 Reset your Chatify password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#F7F4F1;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F1;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(34,36,42,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:#E2725B;padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#FFFFFF;font-size:2rem;font-style:italic;font-family:Georgia,serif;letter-spacing:-0.5px;">Chatify</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">Real-time Messenger</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 16px;color:#22242A;font-size:1rem;font-weight:600;">
                    ${isSignup ? 'Welcome to Chatify! 👋' : 'Password Reset Request 🔐'}
                  </p>
                  <p style="margin:0 0 28px;color:#8A8F98;font-size:0.95rem;line-height:1.6;">
                    ${isSignup
                      ? 'Thanks for signing up! Use the verification code below to confirm your email address and activate your account.'
                      : 'We received a request to reset your password. Use the code below to proceed. If you did not make this request, please ignore this email.'}
                  </p>

                  <!-- OTP Box -->
                  <div style="background:#FDF1EE;border:2px dashed #E2725B;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                    <p style="margin:0 0 8px;font-size:0.85rem;color:#8A8F98;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Your Verification Code</p>
                    <p style="margin:0;font-size:2.8rem;font-weight:800;color:#E2725B;letter-spacing:10px;">${otp}</p>
                  </div>

                  <p style="margin:0 0 8px;color:#8A8F98;font-size:0.85rem;text-align:center;">
                    ⏱️ This code expires in <strong>10 minutes</strong>.
                  </p>
                  <p style="margin:0;color:#8A8F98;font-size:0.85rem;text-align:center;">
                    Do not share this code with anyone.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#F7F4F1;padding:20px 40px;text-align:center;">
                  <p style="margin:0;color:#8A8F98;font-size:0.8rem;">© 2026 Chatify · All rights reserved</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Chatify" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return true;
};

module.exports = { generateOTP, sendOTPEmail };
