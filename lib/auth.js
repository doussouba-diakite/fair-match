// Accounts and sessions.
// - Passwords are hashed with bcrypt, so even someone with the database can't read them.
// - Logging in creates a random session token, saved in the database and in an httpOnly cookie
//   (JavaScript in the browser can't read it, which protects against stolen sessions).
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "./db.js";

const COOKIE = "fm_session";
const DAYS = 14;

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const checkPassword = (password, hash) => bcrypt.compare(password, hash);

export async function startSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + DAYS * 24 * 3600 * 1000);
  await query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", [token, userId, expires]);
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
                             path: "/", expires });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await query("DELETE FROM sessions WHERE token = $1", [token]);
  store.delete(COOKIE);
}

// The logged-in user, or null. Used by every page and API route that needs to know who's asking.
export async function currentUser() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await query(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`, [token]);
  return rows[0] ?? null;
}

export function validEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}
