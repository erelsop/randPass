import inquirer from "inquirer";
import chalk from "chalk";
import { encrypt, deriveKey } from "../crypto/crypto.util";
import { PasswordEntry } from "../types/index.types";
import { generateRandomPassword } from "../utils/password.util";
import * as crypto from "crypto";
import styles from "../colors/styles";

/**
 * Adds a new password entry.
 *
 * This function generates a new random salt and derives a key using the master password and the salt.
 * It then prompts the user to enter a user name and a website name for the new password.
 * It generates a new random password and encrypts the user name, website name, and password using the key.
 * It adds the new entry to the array of password entries and updates the encrypted file.
 * It then informs the user that the new password has been generated and saved securely.
 *
 * @param passwords - The array of password entries.
 * @param masterPassword - The master password used to derive the key and encrypt the entries.
 * @returns The updated array of password entries.
 */
const addPassword = async (
  passwords: PasswordEntry[],
  masterPassword: string
): Promise<PasswordEntry[]> => {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(masterPassword, salt);

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "userName",
      message: chalk.hex(styles.prompt)(
        "Enter the user name for the new password (e.g., janedoe@example.com):"
      ),
    },
    {
      type: "input",
      name: "websiteName",
      message: chalk.hex(styles.prompt)(
        "Enter the website name for the new password (e.g., example.com):"
      ),
    },
  ]);

  const password = generateRandomPassword();
  const encryptedUserName = encrypt(answers.userName, key);
  const encryptedWebsiteName = encrypt(answers.websiteName, key);
  const encryptedPassword = encrypt(password, key);

  passwords.push({
    userName: encryptedUserName,
    websiteName: encryptedWebsiteName,
    password: encryptedPassword,
    salt: salt.toString("hex"),
    lastUpdated: new Date().toISOString(),
  });

  console.log(
    chalk.hex(styles.success)(
      `New password generated and saved securely.\n\nNew password: ${password}\n\n`
    )
  );
  return passwords;
};

export { addPassword };
