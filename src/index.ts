import * as crypto from 'crypto';
import * as fs from 'fs';
import * as readlineSync from 'readline-sync';

type EncryptedData = {
  iv: string;
  encrypted: string;
  authTag: string;
};

interface PasswordEntry {
  userName: EncryptedData;
  websiteName: EncryptedData;
  password: EncryptedData;
  salt: string;
}

const algorithm = 'aes-256-gcm';
const filePath = './passwords.enc';

const encryptFile = (data: PasswordEntry[], password: string) => {
  const salt = crypto.randomBytes(16);
  const hexSalt = salt.toString('hex');
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  fs.writeFileSync(filePath, Buffer.concat([Buffer.from(hexSalt, 'hex'), iv, authTag, encrypted]));
};

const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

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
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = decipher.update(encrypted) + decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.log("Failed to decrypt the file. The master password may be incorrect, or the file is corrupted.");
    return [];
  }
};

const encrypt = (text: string, key: Buffer): EncryptedData => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv) as crypto.CipherGCM;

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return { iv: iv.toString('hex'), encrypted, authTag };
};

const decrypt = (encryptedObj: EncryptedData, key: Buffer): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedObj.iv, 'hex')) as crypto.DecipherGCM;
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));

  let decrypted = decipher.update(encryptedObj.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const generateRandomPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const runPasswordManager = (): void => {
  console.log('Welcome to the Secure Password Manager');

  const masterPassword = readlineSync.question('Enter your master password: ', { hideEchoBack: true });
  let passwords = decryptFile(masterPassword);

  if (passwords === null) {
    console.log('Unable to access your passwords. Exiting...');
    return;
  }

  const action = readlineSync.question('Do you want to (a)dd a new password or (r)etrieve an existing one? Enter "a" or "r": ');

  if (action.toLowerCase() === 'a') {
    const salt = crypto.randomBytes(16);
    const key = deriveKey(masterPassword, salt);

    const userName = readlineSync.question('Enter the user name for the new password (e.g., janedoe@example.com): ');
    const websiteName = readlineSync.question('Enter the website name for the new password (e.g., example.com): ');
    const password = generateRandomPassword();

    const encryptedUserName = encrypt(userName, key);
    const encryptedWebsiteName = encrypt(websiteName, key);
    const encryptedPassword = encrypt(password, key);

    passwords.push({
      userName: encryptedUserName,
      websiteName: encryptedWebsiteName,
      password: encryptedPassword,
      salt: salt.toString('hex')
    });

    encryptFile(passwords, masterPassword);
    console.log('New password generated and saved securely.');
  } else if (action.toLowerCase() === 'r') {
    const userNameInput = readlineSync.question('Enter the user name for the password you want to retrieve (e.g., janedone@example.com): ');
    const websiteNameInput = readlineSync.question('Enter the website name for the password you want to retrieve (e.g., example.com): ');

    let foundEntry: PasswordEntry | undefined;
    for (const entry of passwords) {
      const entryKey = deriveKey(masterPassword, Buffer.from(entry.salt, 'hex'));
      try {
        const decryptedUserName = decrypt(entry.userName, entryKey);
        const decryptedWebsiteName = decrypt(entry.websiteName, entryKey);
        if (decryptedUserName === userNameInput && decryptedWebsiteName === websiteNameInput) {
          foundEntry = entry;
          break;
        }
      } catch (error) {
        if (error instanceof Error) {
          console.warn("Error decrypting an entry:", error.message);
        } else {
          console.warn("An unknown error occurred during decryption.");
        }
      }
    }

    if (foundEntry) {
      const decryptedPassword = decrypt(foundEntry.password, deriveKey(masterPassword, Buffer.from(foundEntry.salt, 'hex')));
      console.log(`The password for ${websiteNameInput} is: ${decryptedPassword}`);
    } else {
      console.log('No matching entry found.');
    }
  } else {
    console.log('Invalid action selected.');
  }
};

runPasswordManager();