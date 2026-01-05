import type { EncryptedData, Plan } from '~/types';

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPlan(plan: Plan, passphrase: string): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const planJson = JSON.stringify(plan);
  const data = encoder.encode(planJson);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    encrypted: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
  };
}

export async function decryptPlan(encryptedData: EncryptedData, passphrase: string): Promise<Plan> {
  const encrypted = base64ToArrayBuffer(encryptedData.encrypted);
  const iv = base64ToArrayBuffer(encryptedData.iv);
  const salt = base64ToArrayBuffer(encryptedData.salt);

  const key = await deriveKey(passphrase, new Uint8Array(salt));

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    const planJson = decoder.decode(decryptedBuffer);

    return JSON.parse(planJson);
  } catch (error) {
    throw new Error('Incorrect passphrase or corrupted data');
  }
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function calculatePassphraseStrength(passphrase: string): {
  score: number;
  label: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (passphrase.length >= 8) score++;
  if (passphrase.length >= 12) score++;
  if (passphrase.length >= 16) score++;

  if (/[a-z]/.test(passphrase)) score++;
  if (/[A-Z]/.test(passphrase)) score++;
  if (/\d/.test(passphrase)) score++;
  if (/[^a-zA-Z\d]/.test(passphrase)) score++;

  if (passphrase.length < 12) {
    feedback.push('Use at least 12 characters');
  }
  if (!/[a-z]/.test(passphrase) || !/[A-Z]/.test(passphrase)) {
    feedback.push('Mix uppercase and lowercase letters');
  }
  if (!/\d/.test(passphrase)) {
    feedback.push('Include numbers');
  }
  if (!/[^a-zA-Z\d]/.test(passphrase)) {
    feedback.push('Include special characters');
  }

  let label = 'Weak';
  if (score >= 5) label = 'Fair';
  if (score >= 6) label = 'Good';
  if (score >= 7) label = 'Strong';

  return { score, label, feedback };
}
