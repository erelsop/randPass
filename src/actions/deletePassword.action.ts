import inquirer from "inquirer";
import chalk from "chalk";
import { PasswordEntry } from "../types/index.types";
import { decrypt, deriveKey } from "../crypto/crypto.util";
import { encryptFile } from "../crypto/fileOperations.util";
import styles from "../colors/styles";
import { filterAndGroupPasswords } from "../utils/filter.util";

/**
 * Deletes a selected password entry.
 *
 * This function prompts the user to enter a filter term to narrow down the entries by website or username.
 * It then uses the filterAndGroupPasswords function to group the entries by website name and filter them based on the filter term.
 * If no entries match the filter term, it informs the user and returns the original array of entries.
 * Otherwise, it prompts the user to select an entry to delete and asks the user to confirm the deletion.
 * If the user does not confirm, it returns the original array of entries.
 * If the user confirms, it removes the selected entry from the array, updates the encrypted file, and informs the user.
 *
 * @param passwords - The array of password entries.
 * @param masterPassword - The master password used to decrypt the entries and encrypt the file.
 * @returns The updated array of password entries.
 */
const deletePassword = async (
  passwords: PasswordEntry[],
  masterPassword: string
): Promise<PasswordEntry[]> => {
  const { filterTerm } = await inquirer.prompt([
    {
      type: "input",
      name: "filterTerm",
      message: chalk.hex(styles.prompt)(
        "Enter a filter term to narrow down by website or username, or press enter to see all:"
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
        name: chalk.hex(styles.option)(`${website} - ${userName}`),
        value: entry,
      }))
  );

  if (choices.length === 0) {
    console.log(
      chalk.hex(styles.error)("No entries match your filter. Please try again.")
    );
    return passwords;
  }

  const { selectedEntry } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedEntry",
      message: "Select an entry to delete:",
      choices,
    },
  ]);

  const { confirmDelete } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDelete",
      message: `Are you sure you want to delete the password for ${decrypt(
        selectedEntry.websiteName,
        deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
      )} - ${decrypt(
        selectedEntry.userName,
        deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
      )}?`,
      default: false,
    },
  ]);

  if (!confirmDelete) return passwords;

  passwords = passwords.filter((entry) => entry !== selectedEntry);

  encryptFile(passwords, masterPassword);
  console.log(
    chalk.hex(styles.success)(
      `Password for ${decrypt(
        selectedEntry.websiteName,
        deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
      )} - ${decrypt(
        selectedEntry.userName,
        deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
      )} deleted successfully.`
    )
  );

  return passwords;
};

export { deletePassword };
