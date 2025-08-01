import * as bcrypt from 'bcryptjs';


export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function comparePasswords(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

