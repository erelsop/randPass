/**
 * Generates a random password.
 *
 * The generated password will have a length of 12 characters and will contain
 * at least one lowercase letter, one uppercase letter, one digit, and one special character.
 *
 * @returns The generated password.
 */
const generateRandomPassword = (): string => {
  const length = 12;
  const charTypes = [
    "abcdefghijklmnopqrstuvwxyz", // Lowercase letters
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // Uppercase letters
    "0123456789", // Digits
    "!@#$%^&*()_+~`|}{[]:;?><,./-=", // Special characters
  ];
  let password = "";

  // Generate one character from each type first to ensure the password contains
  // at least one lowercase letter, one uppercase letter, one digit, and one special character.
  charTypes.forEach((charset) => {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  });

  // Generate the rest of the password with characters from random types.
  for (let i = password.length; i < length; i++) {
    const randomCharType = Math.floor(Math.random() * charTypes.length);
    const randomIndex = Math.floor(
      Math.random() * charTypes[randomCharType].length
    );
    password += charTypes[randomCharType][randomIndex];
  }

  // Shuffle the password to ensure the characters are randomly distributed.
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
};

export { generateRandomPassword };
