import { describe, it, expect } from 'vitest';
import { encryptPlan, decryptPlan, calculatePassphraseStrength, arrayBufferToBase64, base64ToArrayBuffer } from '~/lib/crypto';
import type { Plan } from '~/types';

const mockPlan: Plan = {
  version: 1,
  id: 'test-id',
  contacts: [
    { id: '1', name: 'Alice', relationship: 'Spouse', phone: '123-456-7890', email: '', address: '', priority: 'primary' }
  ],
  preferences: { showEncryptionWarning: true, autoLockMinutes: 15, auditLogRetention: 'all' },
  updatedAt: new Date().toISOString(),
  auditLogs: []
} as unknown as Plan;

describe('Cryptography (crypto.ts)', () => {
  describe('Encryption & Decryption', () => {
    it('should symmetrically encrypt and decrypt a Plan', async () => {
      const passphrase = 'SuperSecretPassword123!';
      const encrypted = await encryptPlan(mockPlan, passphrase);
      
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(typeof encrypted.encrypted).toBe('string');
  
      const decrypted = await decryptPlan(encrypted, passphrase);
      expect(decrypted).toEqual(mockPlan);
    });
  
    it('should fail to decrypt with the wrong passphrase', async () => {
      const passphrase = 'RightPassword123!';
      const encrypted = await encryptPlan(mockPlan, passphrase);
      
      await expect(decryptPlan(encrypted, 'WrongPassword456!')).rejects.toThrow('Incorrect passphrase or corrupted data');
    });
  
    it('should fail to decrypt corrupted data', async () => {
      const passphrase = 'Password123!';
      const encrypted = await encryptPlan(mockPlan, passphrase);
      
      // Corrupt the encrypted data payload
      encrypted.encrypted = 'MANGLED' + encrypted.encrypted.substring(7);
      
      await expect(decryptPlan(encrypted, passphrase)).rejects.toThrow('Incorrect passphrase or corrupted data');
    });
  });

  describe('calculatePassphraseStrength', () => {
    it('should correctly calculate weak strength', () => {
      const result = calculatePassphraseStrength('weak');
      expect(result.label).toBe('Weak');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should correctly calculate strong strength', () => {
      const result = calculatePassphraseStrength('VeryStrongP@ssw0rd!');
      expect(result.label).toBe('Strong');
      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.feedback).toEqual([]);
    });

    it('should provide specific feedback for missing requirements', () => {
      const noNumbers = calculatePassphraseStrength('VeryStrongPassword!');
      expect(noNumbers.feedback).toContain('Include numbers');

      const noSpecial = calculatePassphraseStrength('VeryStrongPassword123');
      expect(noSpecial.feedback).toContain('Include special characters');
    });
  });

  describe('Base64 ArrayBuffer Conversion', () => {
    it('should correctly convert ArrayBuffer to Base64 and back symmetrically', () => {
      const originalString = 'Hello World Base64 Test! 12345';
      const encoder = new TextEncoder();
      const buffer = encoder.encode(originalString).buffer;

      const base64 = arrayBufferToBase64(buffer);
      expect(typeof base64).toBe('string');
      // "Hello World Base64 Test! 12345" length 30, base64 will end with = usually
      
      const decodedBuffer = base64ToArrayBuffer(base64);
      
      const decoder = new TextDecoder();
      const decodedString = decoder.decode(decodedBuffer);
      
      expect(decodedString).toBe(originalString);
    });
  });
});
