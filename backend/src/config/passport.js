import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

export default function(passport) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/user/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;

        // First check if user exists with this Google ID
        let user = await User.findOne({ googleId });

        if (!user) {
          // Check if user exists with this email (from regular registration)
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = googleId;
            existingUser.displayName = profile.displayName;
            existingUser.firstName = profile.name?.givenName;
            existingUser.lastName = profile.name?.familyName;
            existingUser.avatar = profile.photos?.[0]?.value;
            existingUser.verified = true; // Auto-verify OAuth users
            await existingUser.save();
            user = existingUser;
          } else {
            // Create new OAuth user
            user = await User.create({
              googleId,
              displayName: profile.displayName,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              email,
              avatar: profile.photos?.[0]?.value,
              verified: true, // Auto-verify OAuth users
              plan: null, // Set plan to null for new users
              planType: 'Free' // Default plan type
            });
          }
        } else {
          // Update existing OAuth user profile fields
          const changed = {};
          if (user.email !== email) changed.email = email;
          if (user.avatar !== profile.photos?.[0]?.value) changed.avatar = profile.photos?.[0]?.value;
          if (user.displayName !== profile.displayName) changed.displayName = profile.displayName;
          if (user.firstName !== profile.name?.givenName) changed.firstName = profile.name?.givenName;
          if (user.lastName !== profile.name?.familyName) changed.lastName = profile.name?.familyName;
          if (Object.keys(changed).length) await User.updateOne({ _id: user._id }, changed);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
