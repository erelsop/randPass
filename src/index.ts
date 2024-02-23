import inquirer from "inquirer";
import chalk from "chalk";
import { decryptFile, encryptFile } from "./crypto/fileOperations.util";
import { addPassword } from "./actions/addPassword.action";
import { retrievePassword } from "./actions/retrievePassword.action";
import { updatePassword } from "./actions/updatePassword.action";
import { deletePassword } from "./actions/deletePassword.action";
import styles from "./colors/styles";

/**
 * The main function of the Secure Password Manager.
 *
 * This function welcomes the user and prompts them to enter their master password.
 * It then decrypts the file containing the password entries using the master password.
 * It prompts the user to select an action to perform: add a new password, retrieve an existing password,
 * update a password, delete a password, or quit the program.
 * It performs the selected action and then prompts the user to select another action.
 * It repeats this process until the user decides to quit the program.
 * It then informs the user that the program is exiting.
 */
async function main() {
  console.log(
    chalk.hex(styles.success)("Welcome to the Secure Password Manager")
  );

  const { masterPassword } = await inquirer.prompt([
    {
      type: "password",
      name: "masterPassword",
      message: chalk.hex(styles.prompt)("Enter your master password:"),
      mask: "*",
    },
  ]);

  let passwords = decryptFile(masterPassword);

  const getAction = async () => {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: chalk.hex(styles.prompt)("What would you like to do?"),
        choices: [
          {
            name: chalk.hex(styles.option)("Add a new password"),
            value: "add",
          },
          {
            name: chalk.hex(styles.option)("Retrieve an existing password"),
            value: "retrieve",
          },
          {
            name: chalk.hex(styles.option)("Update a password"),
            value: "Update Password",
          },
          {
            name: chalk.hex(styles.option)("Delete a password"),
            value: "delete",
          },
          { name: chalk.hex(styles.error)("Quit"), value: "quit" },
        ],
      },
    ]);

    return action;
  };

  let action = await getAction();

  while (action !== "quit") {
    switch (action) {
      case "delete":
        passwords = await deletePassword(passwords, masterPassword);
        break;
      case "Update Password":
        await updatePassword(passwords, masterPassword);
        break;
      case "add":
        passwords = await addPassword(passwords, masterPassword);
        encryptFile(passwords, masterPassword);
        break;
      case "retrieve":
        await retrievePassword(passwords, masterPassword);
        break;
    }

    action = await getAction();
  }

  console.log(chalk.hex(styles.success)("Exiting..."));
}

main();
