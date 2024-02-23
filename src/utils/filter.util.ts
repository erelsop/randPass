import { PasswordEntry, GroupedPasswords } from "../types/index.types";
import { decrypt, deriveKey } from "../crypto/crypto.util";

/**
 * Decrypts and groups password entries by website name.
 *
 * This function decrypts the website name, user name, and password of each entry
 * using the master password and the salt stored in the entry. It then groups the
 * entries by website name and returns an object where the keys are the website names
 * and the values are arrays of entries for each website.
 *
 * @param passwords - The array of password entries to group.
 * @param masterPassword - The master password used to decrypt the entries.
 * @returns An object where the keys are website names and the values are arrays of entries for each website.
 */
const decryptAndGroupPasswords = (
  passwords: PasswordEntry[],
  masterPassword: string
): GroupedPasswords => {
  return passwords.reduce((acc: GroupedPasswords, entry) => {
    const key = deriveKey(masterPassword, Buffer.from(entry.salt, "hex"));
    const websiteName = decrypt(entry.websiteName, key);
    const userName = decrypt(entry.userName, key);
    const password = decrypt(entry.password, key);

    if (!acc[websiteName]) {
      acc[websiteName] = [];
    }
    acc[websiteName].push({ userName, password, entry });
    return acc;
  }, {});
};

/**
 * Filters and groups password entries by website name.
 *
 * This function filters the entries based on the filter term and then calls
 * decryptAndGroupPasswords to decrypt and group the matching entries by website name.
 * It returns an object where the keys are the website names and the values are arrays
 * of matching entries for each website.
 *
 * @param passwords - The array of password entries to filter and group.
 * @param masterPassword - The master password used to decrypt the entries.
 * @param filterTerm - The term used to filter the entries by website name or user name.
 * @returns An object where the keys are website names and the values are arrays of matching entries for each website.
 */
const filterAndGroupPasswords = (
  passwords: PasswordEntry[],
  masterPassword: string,
  filterTerm: string
): GroupedPasswords => {
  const filteredPasswords = passwords.filter((entry) => {
    const websiteName = decrypt(
      entry.websiteName,
      deriveKey(masterPassword, Buffer.from(entry.salt, "hex"))
    );
    const userName = decrypt(
      entry.userName,
      deriveKey(masterPassword, Buffer.from(entry.salt, "hex"))
    );

    return websiteName.includes(filterTerm) || userName.includes(filterTerm);
  });

  return decryptAndGroupPasswords(filteredPasswords, masterPassword);
};

export { decryptAndGroupPasswords, filterAndGroupPasswords };
