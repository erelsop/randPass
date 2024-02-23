import inquirer from "inquirer";
import chalk from "chalk";
import { PasswordEntry } from "../types/index.types";
import { deriveKey, encrypt } from "../crypto/crypto.util";
import { encryptFile } from "../crypto/fileOperations.util";
import { generateRandomPassword } from "../utils/password.util";
import styles from "../colors/styles";
import { filterAndGroupPasswords } from "../utils/filter.util";

/**
 * Updates the password of a selected entry.
 *
 * This function prompts the user to enter a filter term to narrow down the entries by website or username.
 * It then uses the filterAndGroupPasswords function to group the entries by website name and filter them based on the filter term.
 * If no entries match the filter term, it informs the user and returns.
 * Otherwise, it prompts the user to select an entry to update the password.
 * It then generates a new random password and asks the user to confirm the update.
 * If the user does not confirm, it asks the user if they want to retry updating the password.
 * If the user confirms or decides to retry, it encrypts the new password, updates the selected entry,
 * and updates the encrypted file. If the user decides not to retry, it returns to the main menu.
 *
 * @param passwords - The array of password entries.
 * @param masterPassword - The master password used to decrypt and encrypt the entries.
 */
export const updatePassword = async (
  passwords: PasswordEntry[],
  masterPassword: string
): Promise<void> => {
  const { filterTerm } = await inquirer.prompt([
    {
      type: "input",
      name: "filterTerm",
      message: chalk.hex(styles.prompt)(
        "Enter a filter term to narrow down by website or username, or press enter to skip:"
      ),
    },
  ]);

  const groupedPasswords = filterAndGroupPasswords(
    passwords,
    masterPassword,
    filterTerm
  );

  const choices = Object.entries(groupedPasswords).flatMap(
    ([website, entries]) =>
      entries.map(({ userName, entry }) => ({
        name: chalk.hex(styles.option)(
          `${website} - ${userName} (Last Updated: ${entry.lastUpdated})`
        ),
        value: entry,
      }))
  );

  if (choices.length === 0) {
    console.log(
      chalk.hex(styles.error)("No entries match your filter. Please try again.")
    );
    return;
  }

  const { selectedEntry } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedEntry",
      message: "Select an entry to update the password:",
      choices,
    },
  ]);

  const newPassword = generateRandomPassword();

  const { confirmUpdate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmUpdate",
      message: `Are you sure you want to update the password to ${newPassword}?`,
      default: false,
    },
  ]);

  if (!confirmUpdate) {
    const { retry } = await inquirer.prompt([
      {
        type: "confirm",
        name: "retry",
        message: "Do you want to retry updating the password?",
        default: true,
      },
    ]);

    if (retry) {
      return updatePassword(passwords, masterPassword);
    } else {
      return; // Return to the main menu
    }
  }

  const newEncryptedPassword = encrypt(
    newPassword,
    deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
  );

  selectedEntry.password = newEncryptedPassword;
  selectedEntry.lastUpdated = new Date().toISOString();

  // Find the index of the selected entry in the original passwords array
  const entryIndex = passwords.findIndex((entry) => entry === selectedEntry);
  if (entryIndex !== -1) {
    passwords[entryIndex] = selectedEntry;
    encryptFile(passwords, masterPassword);
    console.log(
      chalk.hex(styles.success)(
        `\nPassword updated successfully. The new password is auto-generated.\n\nNew password: ${newPassword}\nLast Updated: ${selectedEntry.lastUpdated}\n`
      )
    );
  } else {
    console.warn(
      chalk.hex(styles.error)("Something went wrong. Entry not found.")
    );
  }
};
