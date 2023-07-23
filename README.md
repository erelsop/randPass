# randPass

randPass is a simple terminal-based random password
generator. It allows you to generate secure passwords,
encrypt them, and store them in a JSON file. You can later
retrieve and decrypt the passwords using a master password.

## Features

- Generate random passwords based on user and website names.
- Encrypt passwords using the AES-256-CTR algorithm.
- Store encrypted passwords, along with necessary details,
  in a JSON file.
- Retrieve and decrypt passwords using the master password.
- Passwords are securely derived from the master password
  using PBKDF2 with a random salt.
- Input validation to ensure correct user input.
- Terminal-based interface for easy interaction.

## Prerequisites

- Node.js (v12 or higher)

## Installation

1. Clone the repository:

`git clone https://github.com/erelsop/randPass.git`

2. Navigate to the project directory

`cd randPass`

3. Install the dependencies:

`npm install`

## Usage

To use the randPass generator, follow these steps:

1. Run the application: `node index.js`

2. Follow the prompts in the terminal:

- Enter your user name.
- Enter the website name.
- Enter your master password.

3. The application will generate a random password, encrypt
   it, and store it in the passwords.json file.

4. The generated password will be displayed in the terminal.

5. To retrieve a password, run the application again and
   enter the same user name, website name, and master
   password. The password will be decrypted and displayed in
   the terminal.

## Security Consideration

- Keep your master password safe. It is the only way to
  decrypt your passwords.
- The passwords.json file contains encrypted passwords. Make
  sure to back it up securely.
- Use a strong and unique master password to enhance the
  security of your passwords.

## License

This project is licesned under the MIT License.

You can replace `https://github.com/erelsop/randPass.git` in the Installation
section with the URL of your repository. Make sure to also
include the `LICENSE` file in your repository and update the
license information in the License section accordingly.

Feel free to customize and add more information to the
Markdown file based on your specific needs.
