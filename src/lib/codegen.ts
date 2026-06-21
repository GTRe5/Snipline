import { customAlphabet } from "nanoid";

// Excludes visually ambiguous characters (0/O, 1/l/I) so codes stay easy to
// read aloud, write down, and retype by hand.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const CODE_LENGTH = 7;

const generateRaw = customAlphabet(ALPHABET, CODE_LENGTH);

export function generateCode(): string {
  return generateRaw();
}
