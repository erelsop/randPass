import inquirer from "inquirer";
import chalk from "chalk";
import { PasswordEntry } from "../types/index.types";
import { decrypt, deriveKey } from "../crypto/crypto.util";
import styles from "../colors/styles";
import { filterAndGroupPasswords } from "../utils/filter.util";

/**
 * Retrieves the password of a selected entry.
 *
 * This function prompts the user to enter a filter term to narrow down the entries by website or username.
 * It then uses the filterAndGroupPasswords function to group the entries by website name and filter them based on the filter term.
 * If no entries match the filter term, it informs the user and returns.
 * Otherwise, it prompts the user to select an entry to retrieve the password.
 * It then decrypts the password of the selected entry and displays it to the user.
 *
 * @param passwords - The array of password entries.
 * @param masterPassword - The master password used to decrypt the entries.
 */
const retrievePassword = async (
  passwords: PasswordEntry[],
  masterPassword: string
): Promise<void> => {
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
      message: "Select an entry to retrieve the password:",
      choices,
    },
  ]);

  const decryptedPassword = decrypt(
    selectedEntry.password,
    deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
  );
  console.log(
    chalk.hex(styles.success)(
      `\nThe password for ${decrypt(
        selectedEntry.websiteName,
        deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
      )} - ${decrypt(
        selectedEntry.userName,
        deriveKey(masterPassword, Buffer.from(selectedEntry.salt, "hex"))
      )} is: ${decryptedPassword}\nLast Updated: ${selectedEntry.lastUpdated}\n`
    )
  );
};

export { retrievePassword };
