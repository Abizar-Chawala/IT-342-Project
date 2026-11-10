import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(pbkdf2);
const ITERATIONS = 310_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, ITERATIONS, 32, "sha256");
  return `pbkdf2-sha256$${ITERATIONS}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, iterationsText, saltText, keyText] = encoded.split("$");
  const iterations = Number(iterationsText);
  if (
    algorithm !== "pbkdf2-sha256" ||
    !Number.isSafeInteger(iterations) ||
    iterations < 1 ||
    !saltText ||
    !keyText ||
    !/^[a-f0-9]+$/i.test(saltText) ||
    !/^[a-f0-9]+$/i.test(keyText)
  ) {
    return false;
  }

  const salt = Buffer.from(saltText, "hex");
  const expected = Buffer.from(keyText, "hex");
  if (!salt.length || expected.length !== 32) return false;
  const actual = await deriveKey(password, salt, iterations, expected.length, "sha256");
  return timingSafeEqual(actual, expected);
}
