const config = require('../config');
const Setting = require('../models/Setting');

let sendgrid = null;
let fromEmail = 'noreply@mlostore.com';

const init = async () => {
  if (sendgrid) return sendgrid;
  let apiKey = config.email.pass;
  let from = config.email.user;
  try {
    const dbConfig = await Setting.findOne({ key: 'email' });
    if (dbConfig && dbConfig.value) {
      apiKey = dbConfig.value.pass || apiKey;
      from = dbConfig.value.user || from;
    }
  } catch (_) {}
  if (!apiKey) return null;
  fromEmail = from;
  sendgrid = require('@sendgrid/mail');
  sendgrid.setApiKey(apiKey);
  return sendgrid;
};

const isConfigured = async () => {
  const sg = await init();
  return sg !== null;
};

const sendVerificationEmail = async (to, code) => {
  const sg = await init();
  if (!sg) throw new Error('Email not configured');
  await sg.send({
    to, from: fromEmail,
    subject: 'Verify your email - FiveM MLO Store',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6c5ce7, #a29bfe); padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">FiveM MLO Store</h1>
        <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Verify your email address</p>
      </div>
      <div style="padding: 40px;">
        <p style="color: #b0b0c0;">Thank you for registering! Use the code below to activate your account:</p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #6c5ce7;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a29bfe;">${code}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in 15 minutes.</p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background: #1a1a2e; padding: 20px; text-align: center; border-top: 1px solid #2a2a3e;">
        <p style="color: #666; font-size: 12px; margin: 0;">&copy; 2024 FiveM MLO Store. All rights reserved.</p>
      </div>
    </div>`,
  });
};

const sendResetPasswordEmail = async (to, code) => {
  const sg = await init();
  if (!sg) throw new Error('Email not configured');
  await sg.send({
    to, from: fromEmail,
    subject: 'Reset your password - FiveM MLO Store',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e17055, #fdcb6e); padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Reset Your Password</h1>
      </div>
      <div style="padding: 40px;">
        <p style="color: #b0b0c0;">Use the code below to reset your password:</p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #e17055;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fdcb6e;">${code}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in 15 minutes.</p>
      </div>
    </div>`,
  });
};

const sendOrderConfirmation = async (to, order) => {
  const sg = await init();
  if (!sg) throw new Error('Email not configured');
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a3e; color: #e0e0e0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a3e; color: #e0e0e0;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a3e; color: #a29bfe;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');
  await sg.send({
    to, from: fromEmail,
    subject: 'Order Confirmed - FiveM MLO Store',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Order #${order._id.toString().slice(-8).toUpperCase()}</p>
      </div>
      <div style="padding: 40px;">
        <p style="color: #b0b0c0;">Thank you for your purchase! Your order has been completed.</p>
        <p style="color: #b0b0c0;">You can download your products from your dashboard.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6c5ce7; color: #a29bfe;">Item</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6c5ce7; color: #a29bfe;">Qty</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6c5ce7; color: #a29bfe;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align: right; font-size: 20px; color: #a29bfe; font-weight: bold; margin-top: 16px;">
          Total: $${order.totalAmount.toFixed(2)}
        </div>
        <a href="${config.frontendUrl}/dashboard/orders" style="display: block; background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 32px;">View My Orders</a>
      </div>
      <div style="background: #1a1a2e; padding: 20px; text-align: center; border-top: 1px solid #2a2a3e;">
        <p style="color: #666; font-size: 12px; margin: 0;">&copy; 2024 FiveM MLO Store. All rights reserved.</p>
      </div>
    </div>`,
  });
};

const configureEmail = async (host, port, user, pass) => {
  await Setting.findOneAndUpdate(
    { key: 'email' },
    { value: { host, port, user, pass } },
    { upsert: true },
  );
  sendgrid = null;
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendOrderConfirmation, configureEmail, isConfigured };
