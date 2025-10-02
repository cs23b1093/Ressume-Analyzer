import express, { Router } from 'express';
import { registerUser, loginUser, logoutUser, resetPassword, getProfile, updateProfile } from '../controllers/user.controller.js';
import getUser from '../middleware/user.middleware.js';

const userRouter = express.Router();

userRouter.route('/register').post(registerUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(getUser, logoutUser);
userRouter.route('/reset-password').put(getUser, resetPassword);
userRouter.route('/profile').get(getUser, getProfile);
userRouter.route('/update-profile').put(getUser, updateProfile);

export default userRouter;