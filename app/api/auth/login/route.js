// POST /api/auth/login  { email, password }
import { query } from "../../../../lib/db.js";
import { checkPassword, startSession } from "../../../../lib/auth.js";

export async function POST(request) {
  const { email, password } = (await request.json().catch(() => ({}))) ?? {};
  const [user] = await query("SELECT id, password_hash FROM users WHERE email = lower($1)", [String(email ?? "")]);
  // Same message whether the email or the password is wrong, so attackers can't tell which emails exist.
  if (!user || !(await checkPassword(String(password ?? ""), user.password_hash))) {
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  await startSession(user.id);
  return Response.json({ ok: true });
}
