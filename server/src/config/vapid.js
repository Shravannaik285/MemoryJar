import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:sn9188873@gmail.com';

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('[VAPID Config] Warning: VAPID keys are missing in environment variables.');
} else {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[VAPID Config] WebPush VAPID details configured successfully.');
}

export default webpush;

