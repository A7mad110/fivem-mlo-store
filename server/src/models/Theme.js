const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  siteName: { type: String, default: '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤' },
  siteLogo: { type: String, default: '' },
  favicon: { type: String, default: '' },

  bgPrimary: { type: String, default: '#0a0a14' },
  bgSecondary: { type: String, default: '#0f0f1a' },
  bgCard: { type: String, default: '#14142a' },
  bgCardHover: { type: String, default: '#1a1a34' },
  bgInput: { type: String, default: '#1a1a30' },
  bgImage: { type: String, default: '' },
  bgRepeat: { type: String, default: 'repeat' },
  bgSize: { type: String, default: 'auto' },
  borderColor: { type: String, default: '#2a2a4a' },
  borderHover: { type: String, default: '#4a4a7a' },
  textPrimary: { type: String, default: '#f0f0f5' },
  textSecondary: { type: String, default: '#8888aa' },
  textMuted: { type: String, default: '#666688' },
  accent: { type: String, default: '#6c5ce7' },
  accentLight: { type: String, default: '#a29bfe' },
  accentGlow: { type: String, default: 'rgba(108, 92, 231, 0.3)' },
  success: { type: String, default: '#00b894' },
  warning: { type: String, default: '#fdcb6e' },
  danger: { type: String, default: '#e17055' },
  info: { type: String, default: '#74b9ff' },

  fontFamily: { type: String, default: 'Inter' },
  headingFont: { type: String, default: 'Orbitron' },
  borderRadius: { type: Number, default: 12 },

  heroTitle: { type: String, default: 'Premium FiveM MLOs & Maps' },
  heroSubtitle: { type: String, default: 'High-quality MLOs, maps, and interiors for your FiveM server.' },
  heroBg: { type: String, default: '' },

  customCss: { type: String, default: '' },
  footerText: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);
