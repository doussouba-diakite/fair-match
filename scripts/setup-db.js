// Run once: `npm run db:setup`. Creates the tables and adds 60 demo profiles so matching isn't empty.
import { readFile } from "node:fs/promises";
import { pool } from "../lib/db.js";
import { makeProfiles } from "../lib/profiles.js";

const BIOS = ["Teacher who loves weekend hikes.", "Nurse, early riser, big family.", "Engineer and amateur cook.",
  "Grew up bilingual and want the same for my kid.", "Small business owner, very organized.",
  "Social worker who believes in gentle routines.", "Musician; patient and playful.", "Accountant who plans everything."];

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
await pool.query(schema);
const { rows } = await pool.query("SELECT count(*)::int AS n FROM users WHERE is_demo");
if (rows[0].n === 0) {
  for (const [i, p] of makeProfiles().entries()) {
    await pool.query(
      `INSERT INTO users (name, city, willing_to_move, bio, answers, is_demo, audit_group)
       VALUES ($1, $2, $3, $4, $5, TRUE, $6)`,
      [p.name, p.city, p.willingToMove, BIOS[i % BIOS.length], p.answers, p.group]);
  }
  console.log("Added 60 demo profiles.");
} else {
  console.log(`Demo profiles already exist (${rows[0].n}).`);
}
await pool.end();
