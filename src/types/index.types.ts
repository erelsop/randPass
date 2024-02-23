/**
 * Represents encrypted data.
 *
 * The `iv` property is the initialization vector used for encryption.
 * The `encrypted` property is the encrypted data.
 * The `authTag` property is the authentication tag.
 */
export type EncryptedData = {
  iv: string;
  encrypted: string;
  authTag: string;
};

/**
 * Represents a password entry.
 *
 * The `userName`, `websiteName`, and `password` properties are encrypted data.
 * The `salt` property is the salt used for encryption.
 * The `lastUpdated` property is the date and time when the entry was last updated.
 */
export interface PasswordEntry {
  userName: EncryptedData;
  websiteName: EncryptedData;
  password: EncryptedData;
  salt: string;
  lastUpdated: string;
}

/**
 * Represents grouped password entries.
 *
 * This is an object where the keys are website names and the values are arrays of entries for each website.
 * Each entry in the array includes the user name, password, and the original password entry.
 */
export interface GroupedPasswords {
  [website: string]: {
    userName: string;
    password: string;
    entry: PasswordEntry;
  }[];
}
