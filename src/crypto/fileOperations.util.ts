import { deriveKey } from "./crypto.util";
import { PasswordEntry } from "../types/index.types";
import * as fs from "fs";
import * as crypto from "crypto";
import chalk from "chalk";
import styles from "../colors/styles";

// The encryption algorithm to use
const algorithm = "aes-256-gcm";
// The path to the encrypted file
const filePath = "./passwords.enc";

/**
 * Encrypts an array of password entries and writes it to a file.
 *
 * This function generates a random salt and derives a key from the password and salt.
 * It then generates a random initialization vector (IV) and creates a cipher using the algorithm, key, and IV.
 * It encrypts the JSON string of the data and writes the salt, IV, authentication tag, and encrypted data to the file.
 *
 * @param data - The array of password entries to encrypt.
 * @param password - The password to derive the encryption key from.
 */
const encryptFile = (data: PasswordEntry[], password: string) => {
  const salt = crypto.randomBytes(16);
  const hexSalt = salt.toString("hex");
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  fs.writeFileSync(
    filePath,
    Buffer.concat([Buffer.from(hexSalt, "hex"), iv, authTag, encrypted])
  );
};

/**
 * Decrypts the content of the file to an array of password entries.
 *
 * This function reads the salt, IV, authentication tag, and encrypted data from the file,
 * derives a key from the password and salt, and creates a decipher using the algorithm, key, and IV.
 * It sets the authentication tag and decrypts the encrypted data.
 * If the file does not exist or an error occurs during decryption, it returns an empty array.
 *
 * @param password - The password to derive the decryption key from.
 * @returns The decrypted array of password entries.
 */
const decryptFile = (password: string): PasswordEntry[] => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath);
    const salt = content.subarray(0, 16);
    const iv = content.subarray(16, 32);
    const authTag = content.subarray(32, 48);
    const encrypted = content.subarray(48);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = decipher.update(encrypted) + decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    console.log(
      chalk.hex(styles.error)(
        "Failed to decrypt the file. The master password may be incorrect, or the file is corrupted."
      )
    );
    return [];
  }
};

export { encryptFile, decryptFile };
