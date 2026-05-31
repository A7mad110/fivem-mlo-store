const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./index');
const User = require('../models/User');

passport.use(new DiscordStrategy({
  clientID: config.discord.clientId,
  clientSecret: config.discord.clientSecret,
  callbackURL: config.discord.callbackUrl,
  scope: ['identify', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ discordId: profile.id });
    if (user) {
      user.discordAvatar = profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null;
      if (profile.email && !user.email.includes('discord.local')) user.email = profile.email;
      await user.save();
      return done(null, user);
    }
    const email = profile.email || `${profile.username}@discord.local`;
    user = new User({
      username: profile.username,
      email,
      discordId: profile.id,
      discordAvatar: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null,
      isVerified: true,
    });
    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
