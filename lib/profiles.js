// 60 made-up profiles for the demo. No real people.
// A seeded random generator means everyone who runs the app gets the same profiles.
import { QUESTIONS, CITIES } from "./questions.js";

// mulberry32: a tiny, well-known seeded random number generator.
export function seeded(seed) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ["Amara", "Bastien", "Chioma", "Dario", "Esi", "Farid", "Grace", "Hugo", "Ines", "Jalen", "Kemi", "Luca",
  "Mariam", "Nico", "Oluchi", "Pablo", "Rania", "Sami", "Talia", "Uriel", "Vera", "Wes", "Yara", "Zane"];

// `group` is a demographic stand-in (A, B, C). Matching NEVER reads it; the fairness audit uses it
// to check that no group is shown less often or scored lower.
const GROUPS = ["A", "B", "C"];

export function makeProfiles(count = 60, seed = 42) {
  const rand = seeded(seed);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `${pick(NAMES)} ${String.fromCharCode(65 + Math.floor(rand() * 26))}.`,
    city: pick(CITIES),
    willingToMove: rand() < 0.3,
    group: GROUPS[i % GROUPS.length],
    answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, 1 + Math.floor(rand() * 5)])),
  }));
}

export const PROFILES = makeProfiles();
