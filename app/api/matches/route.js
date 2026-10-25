// GET /api/matches -> your top 10 matches among everyone who finished the quiz.
import { query, toProfile } from "../../../lib/db.js";
import { currentUser } from "../../../lib/auth.js";
import { topMatches } from "../../../lib/match.js";

export async function GET() {
  const me = await currentUser();
  if (!me) return Response.json({ error: "Log in first." }, { status: 401 });
  if (!me.answers) return Response.json({ error: "Take the quiz first.", needsQuiz: true }, { status: 409 });
  const others = (await query("SELECT * FROM users WHERE answers IS NOT NULL AND id <> $1", [me.id])).map(toProfile);
  const matches = topMatches({ ...toProfile(me), name: "you" }, others, 10).map((m) => ({
    id: m.profile.id, name: m.profile.name, city: m.profile.city, bio: m.profile.bio,
    isDemo: m.profile.isDemo, score: m.score, why: m.why,
  }));
  return Response.json({ matches });
}
