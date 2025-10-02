import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend('re_WAPvH4Bq_9xTZ7zwMWA8fByrRE4BwcPkr');

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