// POST /api/auth/signup  { name, email, password } -> creates the account and logs you in.
import { query } from "../../../../lib/db.js";
import { hashPassword, startSession, validEmail } from "../../../../lib/auth.js";

export async function POST(request) {
  const { name, email, password } = (await request.json().catch(() => ({}))) ?? {};
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 60) {
    return Response.json({ error: "Enter your first name (2 to 60 characters)." }, { status: 400 });
  }
  if (!validEmail(email)) return Response.json({ error: "Enter a valid email." }, { status: 400 });
  if (typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const taken = await query("SELECT 1 FROM users WHERE lower(email) = lower($1)", [email]);
  if (taken.length) return Response.json({ error: "That email already has an account. Log in instead." }, { status: 409 });
  const [user] = await query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, lower($2), $3) RETURNING id",
    [name.trim(), email, await hashPassword(password)]);
  await startSession(user.id);
  return Response.json({ ok: true });
}
