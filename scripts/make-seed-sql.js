// Writes db/setup.sql: the tables plus 60 fictional demo profiles, as plain SQL you can paste into
// any Postgres SQL editor (for example Neon's). Run: node scripts/make-seed-sql.js
import { readFile, writeFile } from "node:fs/promises";
import { makeProfiles } from "../lib/profiles.js";

const BIOS = ["Teacher who loves weekend hikes.", "Nurse, early riser, big family.", "Engineer and amateur cook.",
  "Grew up bilingual and want the same for my kid.", "Small business owner, very organized.",
  "Social worker who believes in gentle routines.", "Musician; patient and playful.", "Accountant who plans everything."];
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const rows = makeProfiles().map((p, i) =>
  `(${q(p.name)}, ${q(p.city)}, ${p.willingToMove}, ${q(BIOS[i % BIOS.length])}, ${q(JSON.stringify(p.answers))}::jsonb, TRUE, ${q(p.group)})`);
const sql = `${schema}
-- 60 fictional demo profiles (only added if there are none yet)
INSERT INTO users (name, city, willing_to_move, bio, answers, is_demo, audit_group)
SELECT * FROM (VALUES
${rows.join(",\n")}
) AS demo(name, city, willing_to_move, bio, answers, is_demo, audit_group)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE is_demo);
`;
await writeFile(new URL("../db/setup.sql", import.meta.url), sql);
console.log("Wrote db/setup.sql");
