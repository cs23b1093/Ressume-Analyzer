import { ApiError } from "../utils/errorFormat.js";
import logger from "../utils/logger.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { Plan } from "../models/plan.model.js";
import sendEmail from '../config/resend.setup.js';
import { User } from "../models/user.model.js";

const susbcriptionHandler = asyncHandler(async (req, res, next) => {
    logger.info('hit susbcription handler...');

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }
    const user = await User.findById(user_id);
    if (!user) {
        throw new ApiError({ message: 'User not found', status: 404 });
    }

    const plan = await Plan.findOne({ user_id }).populate('user_id', 'email fullName');
    if (!plan) {
        throw new ApiError({ message: 'User has no plan', status: 404 });
    }

    if (!plan.planExpiry) {
        logger.info(`User ${plan.user_id.email} has a plan with no expiry.`);
        return res.status(200).json({ message: 'Plan has no expiry date.' });
    }

    const now = new Date();
    const daysUntilExpiry = Math.ceil((plan.planExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Let's send a reminder if the plan expires in 7 days or less.
    if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
        const emailOptions = {
            to: user.email,
            subject: 'Plan expiring soon',
            html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #d9534f;">Your Plan is Expiring Soon</h2>
    <p>Hello ${user.fullName || 'Valued User'},</p>
    <p>This is a friendly reminder that your <strong>${plan.isFreeTrial ? 'Free Trial' : `"${plan.plan}" plan`}</strong> is set to expire in <strong>${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}</strong>, on ${plan.planExpiry.toDateString()}.</p>
    <p>To ensure uninterrupted access to all features, please renew your subscription or upgrade your plan.</p>
    <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'https://yourapp.com'}/dashboard/billing" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Renew Your Plan</a>
    </div>
    <p>If you have already renewed your plan, you can disregard this email. If you have any questions, please don't hesitate to contact our support team.</p>
    <p>Thank you for being with us!<br><strong>The Resume Analyzer Team</strong></p>
</div>`
        }
        logger.info(`Sending expiry reminder to ${user.email}`);
        await sendEmail(emailOptions);
        return res.status(200).json({ message: `Expiry notification sent to ${user.email}` });
    }

    logger.info(`No action needed for user ${plan.user_id.email}. Days until expiry: ${daysUntilExpiry}`);
    res.status(200).json({ message: 'No action needed at this time.' });
});

export { susbcriptionHandler };