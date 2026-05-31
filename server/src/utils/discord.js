const axios = require('axios');
const config = require('../config');

const USER_WEBHOOK = 'https://discord.com/api/webhooks/1510611086586413248/TJfQ23lTobUfNWkrd0kKFfAaLWQ_rjKFC0_2-SkpfVqmwKTXnsP9XfltnDvaYdIPPXML';
const ADMIN_WEBHOOK = 'https://discord.com/api/webhooks/1510611095876796549/hvCPa3MfCDrWceMI1RUfrejRdZo-sQxGE1kEPLR6gMHvnx2vgguP2ZzpliWryIu-FKBF';

const siteUrl = config.frontendUrl || 'https://fivem-mlo-store.onrender.com';
const siteName = 'FiveM MLO Store';

const sendWebhook = async (url, payload) => {
  try {
    await axios.post(url, payload, {
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

exports.sendUserRegistered = (user) => {
  const embed = {
    title: '📝 New Registration',
    color: 0x57F287,
    thumbnail: { url: getUserAvatar(user) },
    fields: [
      { name: '👤 Username', value: user.username, inline: true },
      { name: '📧 Email', value: user.email ? `||${user.email}||` : 'Discord', inline: true },
      { name: '🆔 ID', value: `\`${user._id.toString().slice(-8).toUpperCase()}\``, inline: true },
    ],
    footer: { text: siteName },
    timestamp: new Date().toISOString(),
  };
  sendWebhook(USER_WEBHOOK, {
    username: `${siteName} - Users`,
    embeds: [embed],
  });
};

exports.sendUserLoggedIn = (user, method = 'email') => {
  const embed = {
    title: method === 'discord' ? '🔑 Discord Login' : '🔑 User Login',
    color: 0x5865F2,
    thumbnail: { url: getUserAvatar(user) },
    fields: [
      { name: '👤 Username', value: user.username, inline: true },
      { name: '🔐 Method', value: method === 'discord' ? 'Discord OAuth2' : 'Email/Password', inline: true },
      { name: '🆔 ID', value: `\`${user._id.toString().slice(-8).toUpperCase()}\``, inline: true },
    ],
    footer: { text: siteName },
    timestamp: new Date().toISOString(),
  };
  sendWebhook(USER_WEBHOOK, {
    username: `${siteName} - Users`,
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
    title: '🛒 New Purchase!',
    color: 0xFEE75C,
    thumbnail: { url: thumb },
    fields: [
      { name: '👤 Customer', value: user.username, inline: true },
      { name: '💰 Total', value: `**$${order.totalAmount.toFixed(2)}**`, inline: true },
      { name: '📋 Order', value: `\`${order._id.toString().slice(-8).toUpperCase()}\``, inline: true },
      { name: '📦 Items', value: itemsList || 'N/A', inline: false },
      { name: '🔗 Links', value: productLinks || 'N/A', inline: false },
    ],
    footer: { text: `${siteName} • Payment: ${order.paymentMethod}` },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(USER_WEBHOOK, {
    username: `${siteName} - Sales`,
    embeds: [embed],
  });
};

exports.sendProductCreated = (product, admin) => {
  const price = product.salePrice
    ? `~~$${product.price.toFixed(2)}~~ **$${product.salePrice.toFixed(2)}**`
    : `**$${product.price.toFixed(2)}**`;

  const embed = {
    title: '🆕 New Product Added',
    color: 0x57F287,
    thumbnail: { url: getProductImage(product) || 'https://ui-avatars.com/api/?name=New&background=57F287&color=fff&size=128' },
    fields: [
      { name: '📦 Product', value: `[${product.name}](${siteUrl}/shop/${product.slug})`, inline: true },
      { name: '💵 Price', value: price, inline: true },
      { name: '📂 Category', value: product.category.toUpperCase(), inline: true },
      { name: '👮 Added by', value: admin.username, inline: false },
    ],
    url: `${siteUrl}/shop/${product.slug}`,
    footer: { text: siteName },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(ADMIN_WEBHOOK, {
    username: `${siteName} - Admin`,
    embeds: [embed],
  });
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
    title: '✏️ Product Updated',
    color: 0xFEE75C,
    thumbnail: { url: getProductImage(product) || 'https://ui-avatars.com/api/?name=Updated&background=FEE75C&color=fff&size=128' },
    fields: [
      { name: '📦 Product', value: `[${product.name}](${siteUrl}/shop/${product.slug})`, inline: true },
      { name: '📂 Category', value: product.category.toUpperCase(), inline: true },
      { name: '📝 Changes', value: changes.join('\n'), inline: false },
      { name: '👮 Updated by', value: admin.username, inline: false },
    ],
    url: `${siteUrl}/shop/${product.slug}`,
    footer: { text: siteName },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(ADMIN_WEBHOOK, {
    username: `${siteName} - Admin`,
    embeds: [embed],
  });
};

exports.sendProductDeleted = (product, admin) => {
  const embed = {
    title: '🗑️ Product Deleted',
    color: 0xED4245,
    thumbnail: { url: getProductImage(product) || 'https://ui-avatars.com/api/?name=Deleted&background=ED4245&color=fff&size=128' },
    fields: [
      { name: '📦 Product', value: product.name, inline: true },
      { name: '💵 Price', value: `$${product.price.toFixed(2)}`, inline: true },
      { name: '📂 Category', value: product.category.toUpperCase(), inline: true },
      { name: '👮 Deleted by', value: admin.username, inline: false },
    ],
    footer: { text: siteName },
    timestamp: new Date().toISOString(),
  };

  sendWebhook(ADMIN_WEBHOOK, {
    username: `${siteName} - Admin`,
    embeds: [embed],
  });
};
