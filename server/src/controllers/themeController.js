const Theme = require('../models/Theme');

exports.getTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne();
    if (!theme) {
      theme = await Theme.create({});
    }
    res.json({ theme });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const allowed = [
      'siteName', 'siteLogo', 'favicon',
      'bgPrimary', 'bgSecondary', 'bgCard', 'bgCardHover', 'bgInput',
      'borderColor', 'borderHover',
      'textPrimary', 'textSecondary', 'textMuted',
      'accent', 'accentLight', 'accentGlow',
      'success', 'warning', 'danger', 'info',
      'fontFamily', 'headingFont', 'borderRadius',
      'heroTitle', 'heroSubtitle', 'heroBg',
      'customCss', 'footerText', 'bgImage', 'bgRepeat', 'bgSize',
    ];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    let theme = await Theme.findOne();
    if (!theme) {
      theme = await Theme.create(update);
    } else {
      Object.assign(theme, update);
      await theme.save();
    }
    res.json({ theme, message: 'Theme updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetTheme = async (req, res) => {
  try {
    await Theme.deleteMany({});
    const theme = await Theme.create({});
    res.json({ theme, message: 'Theme reset to defaults' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
