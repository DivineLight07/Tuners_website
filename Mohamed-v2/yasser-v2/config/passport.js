const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const User            = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    if (!email.endsWith('@miuegypt.edu.eg')) {
      return done(null, false, { message: 'Only MIU accounts allowed' });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name:     profile.displayName,
        email,
        googleId: profile.id,
        avatar:   profile.photos[0]?.value || null,
        status:   'pending'
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
