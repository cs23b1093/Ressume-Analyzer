import express from 'express';
import { registerUser, loginUser, logoutUser, resetPassword, getProfile, updateProfile, getNewAccessToken } from '../controllers/user.controller.js';
import { getUser } from '../middleware/user.middleware.js';
import passport from 'passport';

const userRouter = express.Router();

userRouter.route('/register').post(registerUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(getUser, logoutUser);
userRouter.route('/reset-password').put(getUser, resetPassword);
userRouter.route('/profile').get(getUser, getProfile);
userRouter.route('/update-profile').put(getUser, updateProfile);
userRouter.route('/refresh-token').post(getNewAccessToken);

userRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login/failed' }), (req, res) => {
    // Redirect to frontend dashboard
    res.redirect('http://localhost:3000/api/v1/user/auth/google/callback');
});

userRouter.get('/failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed.'
    });
})

userRouter.get('/logout', (req, res) => {
    req.logout( (err) => {
      if (err) return res.status(500).send('Logout error');
      req.session.destroy(() => {
        // clear cookie
        res.clearCookie('sid');
        res.redirect(process.env.CLIENT_URL || 'http://localhost:3000/');
      });
    });
  });

export default userRouter;