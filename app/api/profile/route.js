// GET  /api/profile -> your profile
// PUT  /api/profile { answers, city, willingToMove, bio } -> save it
import { query } from "../../../lib/db.js";
import { currentUser } from "../../../lib/auth.js";
import { QUESTIONS, CITIES } from "../../../lib/questions.js";

export async function GET() {
  const me = await currentUser();
  if (!me) return Response.json({ error: "Log in first." }, { status: 401 });
  return Response.json({ name: me.name, city: me.city, willingToMove: me.willing_to_move, bio: me.bio, answers: me.answers });
}

export async function PUT(request) {
  const me = await currentUser();
  if (!me) return Response.json({ error: "Log in first." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) ?? {};
  const answers = body.answers ?? {};
  const ok = QUESTIONS.every((q) => Number.isInteger(answers[q.id]) && answers[q.id] >= 1 && answers[q.id] <= 5);
  if (!ok) return Response.json({ error: "Answer every question from 1 to 5." }, { status: 400 });
  if (!CITIES.includes(body.city)) return Response.json({ error: "Choose a city from the list." }, { status: 400 });
  const bio = String(body.bio ?? "").slice(0, 280);
  // Save only the known question ids, so nobody can stuff extra data into the answers column.
  const clean = Object.fromEntries(QUESTIONS.map((q) => [q.id, answers[q.id]]));
  await query("UPDATE users SET answers = $1, city = $2, willing_to_move = $3, bio = $4 WHERE id = $5",
              [clean, body.city, Boolean(body.willingToMove), bio, me.id]);
  return Response.json({ ok: true });
}
