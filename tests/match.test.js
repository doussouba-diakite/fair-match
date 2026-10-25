import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS } from "../lib/questions.js";
import { score, canMeet, explain, topMatches } from "../lib/match.js";
import { audit } from "../lib/fairness.js";
import { PROFILES, makeProfiles } from "../lib/profiles.js";

const person = (answers, extra = {}) => ({
  id: extra.id ?? "x", name: extra.name ?? "Sam", city: extra.city ?? "New York", willingToMove: false, group: "A",
  answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, answers])), ...extra,
});

test("identical answers score 100, opposite answers score 0", () => {
  assert.equal(score(person(5), person(5)), 100);
  assert.equal(score(person(1), person(5)), 0);
  assert.equal(score(person(3), person(5)), 50);
});

test("different cities only match if someone will move", () => {
  assert.equal(canMeet(person(3), person(3, { city: "Boston" })), false);
  assert.equal(canMeet(person(3), person(3, { city: "Boston", willingToMove: true })), true);
});

test("explanations name shared values and the biggest difference", () => {
  const a = person(5);
  const b = person(5, { name: "Ana", answers: { ...person(5).answers, faith: 1 } });
  const why = explain(a, b);
  assert.ok(why.shared.length > 0 && why.shared[0].startsWith("You both agree"));
  assert.match(why.talk, /faith and tradition/);
});

test("top matches are sorted, exclude yourself, and respect dealbreakers", () => {
  const me = PROFILES[0];
  const top = topMatches(me, PROFILES);
  assert.equal(top.length, 5);
  assert.ok(top.every((m) => m.profile.id !== me.id && canMeet(me, m.profile)));
  assert.deepEqual(top.map((m) => m.score), [...top.map((m) => m.score)].sort((a, b) => b - a));
});

test("the real matcher passes the fairness audit", () => {
  const result = audit(PROFILES);
  assert.equal(result.pass, true, JSON.stringify(result.rows));
});

test("the audit catches a matcher that is biased against a group", () => {
  const biased = (me, profiles, n) => topMatches(me, profiles.filter((p) => p.group !== "C"), n);
  const result = audit(makeProfiles(), biased);
  assert.equal(result.pass, false);
  assert.equal(result.rows.find((r) => r.group === "C").timesShown, 0);
});

test("matching works with numeric database ids", () => {
  const withNumbers = PROFILES.map((p, i) => ({ ...p, id: i + 1 }));
  const top = topMatches(withNumbers[0], withNumbers);
  assert.equal(top.length, 5);
});
