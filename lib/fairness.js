// Fairness audit: does any group get shown less often, or scored lower, than the others?
// We run every profile as a "seeker", collect their top 5 matches, and count by group.
// Exposure ratio = (group's share of top-5 slots) / (group's share of all profiles).
// 1.0 = shown exactly in proportion. Below 0.8 fails the "four-fifths rule" used in hiring audits.
import { topMatches as defaultMatcher } from "./match.js";

export function audit(profiles, matcher = defaultMatcher, n = 5) {
  const groups = [...new Set(profiles.map((p) => p.group))].sort();
  const shown = Object.fromEntries(groups.map((g) => [g, 0]));
  const scores = Object.fromEntries(groups.map((g) => [g, []]));
  let slots = 0;
  for (const seeker of profiles) {
    for (const m of matcher(seeker, profiles, n)) {
      shown[m.profile.group] += 1;
      scores[m.profile.group].push(m.score);
      slots += 1;
    }
  }
  const rows = groups.map((g) => {
    const size = profiles.filter((p) => p.group === g).length;
    const exposure = slots ? shown[g] / slots / (size / profiles.length) : 0;
    const avg = scores[g].length ? scores[g].reduce((a, b) => a + b, 0) / scores[g].length : 0;
    return { group: g, profiles: size, timesShown: shown[g], exposure: Math.round(exposure * 100) / 100,
             avgScore: Math.round(avg * 10) / 10 };
  });
  const worst = Math.min(...rows.map((r) => r.exposure));
  return { rows, worst, pass: worst >= 0.8 };
}
