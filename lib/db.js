// One shared connection pool to Postgres. Every query goes through `query`, which always uses
// parameters ($1, $2...) instead of pasting values into SQL. That blocks SQL injection.
import pg from "pg";

const globalForPg = globalThis;
export const pool = globalForPg.__fairMatchPool ?? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});
globalForPg.__fairMatchPool = pool; // reuse the pool across hot reloads in development

export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

// Turn a database row into the shape the matching code expects.
export function toProfile(row) {
  return { id: row.id, name: row.name, city: row.city, willingToMove: row.willing_to_move,
           group: row.audit_group, answers: row.answers, bio: row.bio, isDemo: row.is_demo };
}
