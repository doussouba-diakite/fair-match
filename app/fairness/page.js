// Fairness audit, run live on the demo profiles in the database.
import { query, toProfile } from "../../lib/db.js";
import { audit } from "../../lib/fairness.js";

export const dynamic = "force-dynamic"; // recompute on every visit

export default async function Fairness() {
  const profiles = (await query("SELECT * FROM users WHERE is_demo AND answers IS NOT NULL")).map(toProfile);
  const result = audit(profiles);
  return (
    <>
      <h1>Fairness audit</h1>
      <p className="lead">
        Each of the {profiles.length} demo profiles searches once, and we count who appears in their top 5. Each demo
        profile has a demographic group (A, B, C) that the matcher never sees. If matching is fair, every group appears
        in proportion to its size: an exposure of 1.0. Below 0.8 fails the four-fifths rule used in hiring audits.
      </p>
      <div className="card">
        <span className="pill" style={{ background: result.pass ? "var(--good)" : "crimson" }}>{result.pass ? "PASS" : "FAIL"}</span>{" "}
        <span className="muted">Lowest exposure: {result.worst}</span>
        <table style={{ marginTop: 12 }}>
          <thead><tr><th>Group</th><th>Profiles</th><th>Times in a top 5</th><th>Exposure</th><th>Avg. match score</th></tr></thead>
          <tbody>{result.rows.map((r) => (
            <tr key={r.group}><td><b>{r.group}</b></td><td>{r.profiles}</td><td>{r.timesShown}</td>
              <td><span className="bar" style={{ width: `${(Math.min(r.exposure, 1.2) / 1.2) * 100}px` }} /> {r.exposure}</td>
              <td>{r.avgScore}%</td></tr>))}</tbody>
        </table>
      </div>
      <p className="muted">The automated tests also prove the audit works: a deliberately biased matcher that hides group C fails it.</p>
    </>
  );
}
