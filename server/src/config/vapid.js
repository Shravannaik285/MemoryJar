import webpush from 'web-push';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

// Canonical verified matching VAPID keypair
const DEFAULT_VAPID_PUBLIC_KEY =
  'BIKZISjQ8G8ovWn0tdrMYkAXlWWs-C4wDGFd8GZNknepGflYRDTw7LP0QblSQB_1gSJd8ceydDWBhH-RYIZ114k';
const DEFAULT_VAPID_PRIVATE_KEY =
  'KXmj2aHERdmfsae8uHs62gb4zo7Zdb1uUzHGrUlTA68';
const DEFAULT_VAPID_SUBJECT = 'mailto:sn9188873@gmail.com';

function isValidKeyPair(pubB64, privB64) {
  try {
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(Buffer.from(privB64, 'base64url'));
    const derivedPub = ecdh.getPublicKey();
    return derivedPub.equals(Buffer.from(pubB64, 'base64url'));
  } catch {
    return false;
  }
}

let activePublicKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
let activePrivateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT;

// Cryptographic consistency check: ensure private key strictly matches public key
if (!isValidKeyPair(activePublicKey, activePrivateKey)) {
  console.warn('[VAPID Config] Keypair mismatch detected! Auto-recovering to verified matching VAPID keys.');
  activePublicKey = DEFAULT_VAPID_PUBLIC_KEY;
  activePrivateKey = DEFAULT_VAPID_PRIVATE_KEY;
}

export const VAPID_PUBLIC_KEY = activePublicKey;
export const VAPID_PRIVATE_KEY = activePrivateKey;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
console.log('[VAPID Config] WebPush VAPID details configured successfully.');

export default webpush;
