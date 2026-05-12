import { Resend } from 'resend';

export const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is missing in environment variables.");
    return null;
  }
  return new Resend(key);
};
