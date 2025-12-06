import * as bcrypt from "bcrypt";

/** Hash a plain password */
export async function hashPassword(plain: string): Promise<string> {
  // bcrypt.hash auto-utilise un salt interne
  return await bcrypt.hash(plain);
}

/** Compare plain password with stored hash */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}
