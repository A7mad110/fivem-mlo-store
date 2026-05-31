const axios = require('axios');
const config = require('../config');

const DEFAULT_USER_WEBHOOK = 'https://discord.com/api/webhooks/1510611086586413248/TJfQ23lTobUfNWkrd0kKFfAaLWQ_rjKFC0_2-SkpfVqmwKTXnsP9XfltnDvaYdIPPXML';
const DEFAULT_ADMIN_WEBHOOK = 'https://discord.com/api/webhooks/1510611095876796549/hvCPa3MfCDrWceMI1RUfrejRdZo-sQxGE1kEPLR6gMHvnx2vgguP2ZzpliWryIu-FKBF';

let userWebhook = DEFAULT_USER_WEBHOOK;
let adminWebhook = DEFAULT_ADMIN_WEBHOOK;

const loadWebhooks = async () => {
  try {
    const Setting = require('../models/Setting');
    const [userSetting, adminSetting] = await Promise.all([
      Setting.findOne({ key: 'discord_webhook_user' }).lean(),
      Setting.findOne({ key: 'discord_webhook_admin' }).lean(),
    ]);
    if (userSetting?.value) userWebhook = userSetting.value;
    if (adminSetting?.value) adminWebhook = adminSetting.value;
  } catch (err) {
    console.error('Failed to load webhooks from DB, using defaults:', err.message);
  }
};

exports.loadWebhooks = loadWebhooks;
exports.getUserWebhook = () => userWebhook;
exports.getAdminWebhook = () => adminWebhook;

const siteUrl = config.frontendUrl || 'https://fivem-mlo-store.onrender.com';
const siteName = '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤';
const footerText = `𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤 • جميع الحقوق محفوظة ${new Date().getFullYear()} © All rights reserved`;

const sendWebhook = async (url, payload, pingEveryone = false) => {
  try {
    const data = { ...payload };
    if (pingEveryone) {
      data.content = '@everyone';
      data.allowed_mentions = { parse: ['everyone'] };
    }
    await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
  } catch (err) {
    console.error('Discord webhook error:', err.response?.data || err.message);
  }
};

const getUserAvatar = (user) => {
  if (user.discordAvatar && user.discordId) {
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`;
  }
  if (user.avatar) return user.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=5865F2&color=fff&size=128`;
};

const getProductImage = (product) => {
  if (product.thumbnail) {
    if (product.thumbnail.startsWith('http')) return product.thumbnail;
    return `${siteUrl}${product.thumbnail}`;
  }
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    if (img.startsWith('http')) return img;
    return `${siteUrl}${img}`;
  }
  return '';
};

const ar = {
  registered: '📝 تسجيل جديد • New Registration',
  loggedIn: '🔑 تسجيل دخول • User Login',
  discordLogin: '🔑 دخول عبر ديسكورد • Discord Login',
  purchase: '🛒 عملية شراء جديدة • New Purchase!',
  productCreated: '🆕 منتج جديد • New Product Added',
  productUpdated: '✏️ تحديث منتج • Product Updated',
  productDeleted: '🗑️ حذف منتج • Product Deleted',
  testUser: '🔧 اختبار • User Webhook Test',
  testAdmin: '🔧 اختبار • Admin Webhook Test',
  username: '👤 اسم المستخدم • Username',
  email: '📧 البريد الإلكتروني • Email',
  id: '🆔 المعرف • ID',
  method: '🔐 طريقة الدخول • Method',
  customer: '👤 الزبون • Customer',
  total: '💰 المجموع • Total',
  order: '📋 الطلب • Order',
  items: '📦 المنتجات • Items',
  links: '🔗 الروابط • Links',
  product: '📦 المنتج • Product',
  price: '💵 السعر • Price',
  category: '📂 القسم • Category',
  addedBy: '👮 أضيف بواسطة • Added by',
  updatedBy: '👮 حدّث بواسطة • Updated by',
  deletedBy: '👮 حُذف بواسطة • Deleted by',
  changes: '📝 التغييرات • Changes',
  testWorking: '✅ الـ Webhook يعمل بنجاح • Webhook is working!',
  testDesc: 'ستصلك الإشعارات هنا • You will receive notifications here.',
  type: '📡 النوع • Type',
  time: '🕐 الوقت • Time',
};

exports.sendUserRegistered = (user) => {
  const embed = {
    title: ar.registered,
    color: 0x57F287,
    thumbnail: { url: getUserAvatar(user) },
    fields: [
      { name: ar.username, value: user.username, inline: true },
      { name: ar.email, value: user.email ? `||${user.email}||` : 'Discord', inline: true },
      { name: ar.id, value: `\`${user._id.toString().slice(-8).toUpperCase()}\``, inline: true },
    ],
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  };
  sendWebhook(userWebhook, {
    username: `${siteName} • Users`,
    embeds: [embed],
  });
};

exports.sendUserLoggedIn = (user, method = 'email') => {
  const embed = {
    title: method === 'discord' ? ar.discordLogin : ar.loggedIn,
    color: 0x5865F2,
    thumbnail: { url: getUserAvatar(user) },
    fields: [
      { name: ar.username, value: user.username, inline: true },
      { name: ar.method, value: method === 'discord' ? 'Discord OAuth2' : 'Email/Password', inline: true },
      { name: ar.id, value: `\`${user._id.toString().slice(-8).toUpperCase()}\``, inline: true },
    ],
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  };
  sendWebhook(userWebhook, {
    username: `${siteName} • Users`,
    embeds: [embed],
  });
};

exports.sendPurchase = async (user, order) => {
  const itemsList = order.items.map(item =>
    `**${item.name}** x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  const productLinks = order.items.map(item => {
    const p = item.product;
    if (p && p.slug) return `[${p.name}](${siteUrl}/shop/${p.slug})`;
    return item.name;
  }).join(', ');

  const firstProduct = order.items[0]?.product;
  const thumb = firstProduct ? getProductImage(firstProduct) : getUserAvatar(user);

  const embed = {
    title: ar.purchase,
    color: 0xFEE75C,
    thumbnail: { url: thumb },
    fields: [
      { name: ar.customer, value: user.username, inline: true },
      { name: ar.total, value: `**$${order.totalAmount.toFixed(2)}**`, inline: true },
      { name: ar.order, value: `\`${order._id.toString().slice(-8).toUpperCase()}\``, inline: true },
      { name: ar.items, value: itemsList || 'N/A', inline: false },
      { name: ar.links, value: productLinks || 'N/A', inline: false },
    ],
    footer: { text: `${footerText} • ${order.paymentMethod}` },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(userWebhook, {
    username: `${siteName} • Sales`,
    embeds: [embed],
  });
};

exports.sendProductCreated = (product, admin) => {
  const price = product.salePrice
    ? `~~$${product.price.toFixed(2)}~~ **$${product.salePrice.toFixed(2)}**`
    : `**$${product.price.toFixed(2)}**`;

  const embed = {
    title: ar.productCreated,
    color: 0x57F287,
    thumbnail: { url: getProductImage(product) || 'https://ui-avatars.com/api/?name=New&background=57F287&color=fff&size=128' },
    fields: [
      { name: ar.product, value: `[${product.name}](${siteUrl}/shop/${product.slug})`, inline: true },
      { name: ar.price, value: price, inline: true },
      { name: ar.category, value: product.category.toUpperCase(), inline: true },
      { name: ar.addedBy, value: admin.username, inline: false },
    ],
    url: `${siteUrl}/shop/${product.slug}`,
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(adminWebhook, {
    username: `${siteName} • Admin`,
    embeds: [embed],
  }, true);
};

exports.sendProductUpdated = (product, oldProduct, admin) => {
  const changes = [];

  if (oldProduct.price !== product.price) {
    changes.push(`💰 **Price:** $${oldProduct.price.toFixed(2)} → $${product.price.toFixed(2)}`);
  }

  if (oldProduct.salePrice !== product.salePrice) {
    if (product.salePrice) {
      changes.push(`🏷️ **Sale Price:** $${product.salePrice.toFixed(2)} (was ${oldProduct.salePrice ? `$${oldProduct.salePrice.toFixed(2)}` : 'N/A'})`);
    } else {
      changes.push(`🏷️ **Sale Removed** (was $${oldProduct.salePrice.toFixed(2)})`);
    }
  }

  if (oldProduct.inStock !== product.inStock) {
    changes.push(product.inStock ? '✅ **Back in stock**' : '❌ **Out of stock**');
  }

  if (oldProduct.name !== product.name) {
    changes.push(`✏️ **Name:** ${oldProduct.name} → ${product.name}`);
  }

  if (oldProduct.category !== product.category) {
    changes.push(`📂 **Category:** ${oldProduct.category} → ${product.category}`);
  }

  if (changes.length === 0) return;

  const embed = {
    title: ar.productUpdated,
    color: 0xFEE75C,
    thumbnail: { url: getProductImage(product) || 'https://ui-avatars.com/api/?name=Updated&background=FEE75C&color=fff&size=128' },
    fields: [
      { name: ar.product, value: `[${product.name}](${siteUrl}/shop/${product.slug})`, inline: true },
      { name: ar.category, value: product.category.toUpperCase(), inline: true },
      { name: ar.changes, value: changes.join('\n'), inline: false },
      { name: ar.updatedBy, value: admin.username, inline: false },
    ],
    url: `${siteUrl}/shop/${product.slug}`,
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  };

  const shouldPing = changes.some(c => c.includes('**Sale') || c.includes('💰'));
  sendWebhook(adminWebhook, {
    username: `${siteName} • Admin`,
    embeds: [embed],
  }, shouldPing);
};

exports.sendProductDeleted = (product, admin) => {
  const embed = {
    title: ar.productDeleted,
    color: 0xED4245,
    thumbnail: { url: getProductImage(product) || 'https://ui-avatars.com/api/?name=Deleted&background=ED4245&color=fff&size=128' },
    fields: [
      { name: ar.product, value: product.name, inline: true },
      { name: ar.price, value: `$${product.price.toFixed(2)}`, inline: true },
      { name: ar.category, value: product.category.toUpperCase(), inline: true },
      { name: ar.deletedBy, value: admin.username, inline: false },
    ],
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(adminWebhook, {
    username: `${siteName} • Admin`,
    embeds: [embed],
  }, true);
};

exports.sendTestWebhook = async (webhookUrl, type) => {
  const embed = {
    title: type === 'admin' ? ar.testAdmin : ar.testUser,
    color: 0x5865F2,
    description: `${ar.testWorking}\n${ar.testDesc}`,
    fields: [
      { name: ar.type, value: type === 'admin' ? 'Admin Actions' : 'User Actions', inline: true },
      { name: ar.time, value: new Date().toLocaleString(), inline: true },
    ],
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  };
  await sendWebhook(webhookUrl, {
    username: `${siteName} • Test`,
    embeds: [embed],
  });
};
