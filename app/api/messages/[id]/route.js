// GET  /api/messages/:id -> the other person, your match details, and your conversation
// POST /api/messages/:id { body } -> send a message
// You can only message people you could actually match with (same city or someone open to moving).
import { query, toProfile } from "../../../../lib/db.js";
import { currentUser } from "../../../../lib/auth.js";
import { canMeet, explain, score, starters } from "../../../../lib/match.js";

async function loadPair(params) {
  const me = await currentUser();
  if (!me) return { error: Response.json({ error: "Log in first." }, { status: 401 }) };
  const { id } = await params;
  const [other] = await query("SELECT * FROM users WHERE id = $1 AND answers IS NOT NULL", [Number(id)]);
  if (!other || other.id === me.id || !me.answers) {
    return { error: Response.json({ error: "Person not found." }, { status: 404 }) };
  }
  const a = { ...toProfile(me), name: "you" }, b = toProfile(other);
  if (!canMeet(a, b)) return { error: Response.json({ error: "You're not matched with this person." }, { status: 403 }) };
  return { me, other, a, b };
}

export async function GET(_request, { params }) {
  const pair = await loadPair(params);
  if (pair.error) return pair.error;
  const { me, other, a, b } = pair;
  const messages = await query(
    `SELECT id, from_id = $1 AS mine, body, created_at FROM messages
     WHERE (from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1) ORDER BY created_at`, [me.id, other.id]);
  return Response.json({
    person: { id: other.id, name: other.name, city: other.city, bio: other.bio, isDemo: other.is_demo },
    score: score(a, b), why: explain(a, b), starters: starters(a, b), messages,
  });
}

export async function POST(request, { params }) {
  const pair = await loadPair(params);
  if (pair.error) return pair.error;
  const { body } = (await request.json().catch(() => ({}))) ?? {};
  const text = String(body ?? "").trim();
  if (!text || text.length > 1000) return Response.json({ error: "Messages are 1 to 1000 characters." }, { status: 400 });
  await query("INSERT INTO messages (from_id, to_id, body) VALUES ($1, $2, $3)", [pair.me.id, pair.other.id, text]);
  return Response.json({ ok: true });
}
