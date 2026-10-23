// Fairness audit page. Runs on the server each time the page is built.
import { PROFILES } from "../../lib/profiles.js";
import { audit } from "../../lib/fairness.js";

export default function Fairness() {
  const result = audit(PROFILES);
  return (
    <>
      <h1>Fairness audit</h1>
      <p className="lead">
        Every one of the {PROFILES.length} profiles searches once, and we count who shows up in their top 5.
        Each profile belongs to a demographic group (A, B, C) that the matcher never sees. If matching is fair,
        each group appears in proportion to its size: an exposure of 1.0. Below 0.8 fails the four-fifths rule.
      </p>
      <div className="card">
        <span className="pill" style={{ background: result.pass ? "var(--good)" : "crimson" }}>
          {result.pass ? "PASS" : "FAIL"}</span>{" "}
        <span className="muted">Lowest exposure: {result.worst}</span>
        <table style={{ marginTop: 12 }}>
          <thead><tr><th>Group</th><th>Profiles</th><th>Times in a top 5</th><th>Exposure</th><th>Avg. match score</th></tr></thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.group}>
                <td><b>{r.group}</b></td><td>{r.profiles}</td><td>{r.timesShown}</td>
                <td><div className="bar" style={{ width: `${Math.min(r.exposure, 1.2) / 1.2 * 120}px` }} /> {r.exposure}</td>
                <td>{r.avgScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">The tests also prove the audit works: a deliberately biased matcher that hides group C fails it.</p>
    </>
  );
}
