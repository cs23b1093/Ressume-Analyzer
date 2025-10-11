import { Resend } from 'resend';
import dotenv from 'dotenv';
import { ApiError } from '../utils/errorFormat.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "");

const sendEmail = async (mailOptions) => {
  const { data, error } = await resend.emails.send({
    ...mailOptions,
    from: process.env.DEFAULT_EMAIL_SENDER,
  });

  if (error) {
    const apiError = new ApiError({ message: "Error sending email", stack: error.stack, status: 500 })
    return { ...apiError };
  }

  console.log({ data });
}

export default sendEmail;