// How matching works, in three steps:
// 1. Dealbreaker: people in different cities only match if at least one is willing to move.
// 2. Score: compare answers question by question. Same answer = full agreement; 1 vs 5 = none.
//    Important questions (higher weight) count more. Result is 0-100.
// 3. Explain: name the values you share most strongly, and the biggest difference to talk about.
import { QUESTIONS, stance } from "./questions.js";

export function canMeet(a, b) {
  return a.city === b.city || a.willingToMove || b.willingToMove;
}

export function score(a, b) {
  let total = 0;
  let weights = 0;
  for (const q of QUESTIONS) {
    const gap = Math.abs(a.answers[q.id] - b.answers[q.id]); // 0 (same) to 4 (opposite)
    total += q.weight * (1 - gap / 4);
    weights += q.weight;
  }
  return Math.round((100 * total) / weights);
}

export function explain(a, b) {
  const rows = QUESTIONS.map((q) => ({
    q,
    gap: Math.abs(a.answers[q.id] - b.answers[q.id]),
    strength: Math.abs(a.answers[q.id] - 3) + Math.abs(b.answers[q.id] - 3), // how strongly both feel
  }));
  // Shared values: small gap, strong feelings, important questions first.
  const shared = rows
    .filter((r) => r.gap <= 1 && r.strength >= 2)
    .sort((x, y) => x.gap - y.gap || y.strength - x.strength || y.q.weight - x.q.weight)
    .slice(0, 3)
    .map((r) => `You both ${stance(a.answers[r.q.id]) === "disagrees" ? "disagree" : "agree"}: "${r.q.text}"`);
  // The biggest difference, weighted by importance.
  const diff = [...rows].sort((x, y) => y.gap * y.q.weight - x.gap * x.q.weight)[0];
  const talk = diff.gap >= 2
    ? `Talk about ${diff.q.topic}: you ${stance(a.answers[diff.q.id]).replace("agrees", "agree").replace("is neutral", "are neutral")} and ${b.name} ${stance(b.answers[diff.q.id])}.`
    : "No big differences on the core questions.";
  const place = a.city === b.city ? `You both live in ${a.city}.`
    : `${b.name} lives in ${b.city}; ${b.willingToMove ? `${b.name} is` : "you are"} open to moving.`;
  return { shared, talk, place };
}

// Top matches for one person. `group` is never read here.
export function topMatches(me, profiles, n = 5) {
  return profiles
    .filter((p) => p.id !== me.id && canMeet(me, p))
    .map((p) => ({ profile: p, score: score(me, p), why: explain(me, p) }))
    .sort((x, y) => y.score - x.score || x.profile.id.localeCompare(y.profile.id))
    .slice(0, n);
}
