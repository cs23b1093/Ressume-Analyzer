import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "");
if (!resend) {
  return res.status(500).json({
    message: 'Resend API key is not set',
    status: 500,
    success: false,
  });
}

const sendEmail = async (mailOptions) => {
  const { data, error } = await resend.emails.send({
    ...mailOptions
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}

export default sendEmail;