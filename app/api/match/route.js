// Backend: POST /api/match with { answers, city, willingToMove } -> top 5 matches with explanations.
// Runs on the server (Node), so the matching logic and other people's profiles stay off the browser.
import { QUESTIONS, CITIES } from "../../../lib/questions.js";
import { PROFILES } from "../../../lib/profiles.js";
import { topMatches } from "../../../lib/match.js";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  // Validate input: every question answered with a whole number from 1 to 5, and a known city.
  const answers = body?.answers ?? {};
  const valid = QUESTIONS.every((q) => Number.isInteger(answers[q.id]) && answers[q.id] >= 1 && answers[q.id] <= 5);
  if (!valid || !CITIES.includes(body?.city)) {
    return Response.json({ error: "Answer every question (1-5) and choose a city." }, { status: 400 });
  }
  const me = { id: "me", name: "You", city: body.city, willingToMove: Boolean(body.willingToMove), answers };
  const matches = topMatches(me, PROFILES).map((m) => ({
    name: m.profile.name, city: m.profile.city, score: m.score, why: m.why,
  }));
  return Response.json({ matches });
}
