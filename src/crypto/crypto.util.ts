import * as crypto from "crypto";
import { EncryptedData } from "../types/index.types";

// The encryption algorithm to use
const algorithm = "aes-256-gcm";

/**
 * Encrypts a string using AES-256-GCM.
 *
 * This function generates a random initialization vector (IV),
 * creates a cipher using the algorithm, key, and IV,
 * and encrypts the text. It then returns the IV, the encrypted text,
 * and the authentication tag.
 *
 * @param text - The text to encrypt.
 * @param key - The encryption key.
 * @returns The encrypted data.
 */
const encrypt = (text: string, key: Buffer): EncryptedData => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv) as crypto.CipherGCM;

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return { iv: iv.toString("hex"), encrypted, authTag };
};

/**
 * Decrypts data encrypted using AES-256-GCM.
 *
 * This function creates a decipher using the algorithm, key, and IV from the encrypted data,
 * sets the authentication tag, and decrypts the encrypted text.
 *
 * @param encryptedObj - The encrypted data.
 * @param key - The decryption key.
 * @returns The decrypted text.
 */
const decrypt = (encryptedObj: EncryptedData, key: Buffer): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedObj.iv, "hex")
  ) as crypto.DecipherGCM;
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, "hex"));

  let decrypted = decipher.update(encryptedObj.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

/**
 * Derives a key from a password and a salt using PBKDF2.
 *
 * This function uses PBKDF2 with SHA-256 and 100,000 iterations to derive a 32-byte key from the password and salt.
 *
 * @param password - The password.
 * @param salt - The salt.
 * @returns The derived key.
 */
const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
};

export { encrypt, decrypt, deriveKey };
