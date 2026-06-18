import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Hash a plaintext password */
export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

/** Compare a plaintext password against a hash */
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);
