const crypto = require('crypto');
const fs = require('fs');
const readlineSync = require('readline-sync');

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

let userName = '';
let websiteName = '';
let masterPassword = '';

/**
 * This function encrypts a string using the
 * aes-256-ctr algorithm and a randomly generated
 * initialization vector. The encrypted string
 * is returned.
 * @param {*} text
 * @param {*} password
 * @return {string} encrypted string
 */
const encrypt = (text, password, iv) => {
  const cipher = crypto.createCipheriv(
    algorithm,
    password,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(text),
    cipher.final(),
  ]);

  return `${iv.toString('hex')}:${encrypted.toString(
    'hex'
  )}`;
};

/**
 * This function decrypts a string using the
 * aes-256-ctr algorithm and a provided
 * initialization vector (IV). The decrypted string
 * is returned.
 * @param {string} text - The encrypted string to decrypt.
 * @param {string} password - The password used for decryption.
 * @param {Buffer} iv - The initialization vector used for encryption.
 * @return {string} - The decrypted string.
 */
const decrypt = (text, password, iv) => {
  const [encryptedIv, encryptedText] = text.split(':');

  if (encryptedIv !== iv.toString('hex')) {
    throw new Error('Invalid initialization vector.');
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    password,
    iv
  );

  let decrypted = decipher.update(
    Buffer.from(encryptedText, 'hex'),
    'hex',
    'utf8'
  );
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * This function reads the passwords.json file
 * and returns an array of password objects.
 * @returns {Array} - An array of password objects.
 */
const getPasswords = () => {
  try {
    const fileData = fs.readFileSync(
      './passwords.json',
      'utf-8'
    );
    return JSON.parse(fileData) || [];
  } catch (error) {
    return [];
  }
};

/**
 * This function generates a random password
 * using the characters in the charset string.
 * @returns {string} - A random password.
 */
const generateRandomPassword = () => {
  const length = 12;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      Math.random() * charset.length
    );
    password += charset[randomIndex];
  }

  return password;
};

/**
 * This function is used to collect the user's
 * master password and decrypt the JSON file
 * containing the user name, website name, and
 * password. The user name and website name
 * are used to find the correct password in
 * the JSON file. The decrypted password is
 * displayed to the user.
 * @param {*} userName
 * @param {*} websiteName
 * @param {*} masterPassword
 */
const genRandomPassword = (
  userName,
  websiteName,
  masterPassword
) => {
  const salt = crypto.randomBytes(16); // Generate a random salt
  const iterations = 500000; // Number of iterations for key derivation
  const keyLength = 32; // Key length in bytes

  // Derive the key from the master password using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(
    masterPassword,
    salt,
    iterations,
    keyLength,
    'sha256'
  );

  let passwords = [];

  try {
    const fileData = fs.readFileSync(
      './passwords.json',
      'utf-8'
    );
    if (fileData) {
      passwords = JSON.parse(fileData);
    }
  } catch (error) {
    // Ignore the error if the file is empty or doesn't exist
  }

  const existingPassword = passwords.find(
    (password) =>
      password.userName === userName &&
      password.websiteName === websiteName
  );

  if (!existingPassword) {
    const password = generateRandomPassword();
    const iv = crypto.randomBytes(16);

    const encryptedPassword = encrypt(
      password,
      derivedKey,
      iv
    );

    passwords.push({
      userName,
      websiteName,
      password: encryptedPassword,
      iv: iv.toString('hex'), // Convert IV to string for storage
      derivedKey: derivedKey.toString('hex'), // Convert derivedKey to string for storage
    });

    fs.writeFileSync(
      './passwords.json',
      JSON.stringify(passwords)
    );
  }
};

/**
 * This function is used to collect the user's
 * master password and decrypt the JSON file
 * containing the user name, website name, and
 * password. The user name and website name
 * are used to find the correct password and
 * it is logged to the console for terminal use.
 * @param {string} userName
 * @param {string} websiteName
 * @returns {string} decrypted password
 */
const decryptPassword = (userName, websiteName) => {
  const encryptedPassword = fs.readFileSync(
    './passwords.json',
    'utf-8'
  );
  const passwords = JSON.parse(encryptedPassword);

  const passwordData = passwords.find(
    (password) =>
      password.userName === userName &&
      password.websiteName === websiteName
  );

  if (!passwordData) {
    throw new Error(
      'Password not found for the given user name and website name.'
    );
  }

  const derivedKey = Buffer.from(
    passwordData.derivedKey,
    'hex'
  );
  const iv = Buffer.from(passwordData.iv, 'hex');

  const decryptedPassword = decrypt(
    passwordData.password,
    derivedKey,
    iv
  );

  return decryptedPassword;
};

/**
 * Collects the user's userName and stores it
 * in a global variable. This function will also
 * validate the user's input and throw an error
 * if it is invalid.
 * @param {string} userName
 * @return {void}
 */
const setUserName = (inputUserName) => {
  if (typeof inputUserName !== 'string') {
    throw new Error('User name must be a string.');
  }

  if (
    inputUserName.length < 1 ||
    inputUserName.length > 32
  ) {
    throw new Error(
      'User name must be between 1 and 32 characters long.'
    );
  }

  userName = inputUserName;
};

/**
 * Collects the user's websiteName and stores it
 * in a global variable. This function will also
 * validate the user's input and throw an error
 * if it is invalid.
 * @param {string} websiteName
 * @return {void}
 */
const setWebsiteName = (inputWebsiteName) => {
  if (typeof inputWebsiteName !== 'string') {
    throw new Error('Website name must be a string.');
  }

  if (
    inputWebsiteName.length < 1 ||
    inputWebsiteName.length > 32
  ) {
    throw new Error(
      'Website name must be between 1 and 32 characters long.'
    );
  }

  websiteName = inputWebsiteName;
};

/**
 * Collects the user's masterPassword and stores it
 * in a global variable. This function will also
 * validate the user's input and throw an error
 * if it is invalid.
 * @param {string} inputMasterPassword
 * @return {void}
 */
const setMasterPassword = (inputMasterPassword) => {
  const upperCaseRegex = /[A-Z]/;
  const lowerCaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharacterRegex = /[^A-Za-z0-9]/;

  if (typeof inputMasterPassword !== 'string') {
    throw new Error('Master password must be a string.');
  }

  if (
    inputMasterPassword.length < 1 ||
    inputMasterPassword.length > 32
  ) {
    throw new Error(
      'Master password must be between 1 and 32 characters long.'
    );
  }

  if (!upperCaseRegex.test(inputMasterPassword)) {
    throw new Error(
      'Master password must contain at least one uppercase letter.'
    );
  }

  if (!lowerCaseRegex.test(inputMasterPassword)) {
    throw new Error(
      'Master password must contain at least one lowercase letter.'
    );
  }

  if (!numberRegex.test(inputMasterPassword)) {
    throw new Error(
      'Master password must contain at least one number.'
    );
  }

  if (!specialCharacterRegex.test(inputMasterPassword)) {
    throw new Error(
      'Master password must contain at least one special character.'
    );
  }

  masterPassword = inputMasterPassword; // Assign the value to the global variable
};

/**
 * Main function that is called when the program
 * is run. This function will call the other
 * functions in the correct order to generate
 * a random password, encrypt it, and store it
 * in a JSON file.
 * @return {void}
 */
const main = () => {
  let restart = false;

  do {
    try {
      const userName = readlineSync.question(
        'Enter your user name: '
      );
      setUserName(userName);

      const websiteName = readlineSync.question(
        'Enter the website name: '
      );
      setWebsiteName(websiteName);

      const masterPassword = readlineSync.question(
        'Enter your master password: ',
        {
          hideEchoBack: true,
        }
      );
      setMasterPassword(masterPassword);

      genRandomPassword(
        userName,
        websiteName,
        masterPassword
      );

      const decryptedPassword = decryptPassword(
        userName,
        websiteName,
        masterPassword
      );

      console.log('\n');

      console.log(
        `Your password for ${websiteName} is ${decryptedPassword}`
      );

      console.log('\n');

      console.log(
        'Please keep your master password safe. It is the only way to decrypt your passwords.'
      );

      console.log('\n');

      const userInput = readlineSync.question(
        'Enter g to generate another password or Ctrl+C to quit: '
      );

      if (userInput === 'G' || userInput === 'g') {
        restart = true;
      }
    } catch (error) {
      console.log(error.message);
    }
  } while (restart);
};

main();
