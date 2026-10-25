"use client";
// Your matches, loaded from /api/matches.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Matches() {
  const router = useRouter();
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    fetch("/api/matches").then(async (res) => {
      if (res.status === 401) return router.push("/login");
      const data = await res.json();
      if (data.needsQuiz) return router.push("/quiz");
      setMatches(data.matches);
    });
  }, [router]);

  if (!matches) return <p className="muted">Finding your matches…</p>;
  return (
    <>
      <h1>Your top matches</h1>
      <p className="lead">Ranked by how closely your values line up. Every match says why.</p>
      {matches.length === 0 && <div className="card">No one in range yet. Try saying you're open to moving.</div>}
      {matches.map((m) => (
        <div className="card match" key={m.id}>
          <div className="ring" style={{ "--p": m.score }}><b>{m.score}%</b></div>
          <div>
            <h3>{m.name} {m.isDemo && <span className="tag">demo</span>}</h3>
            <div className="muted">{m.why.place}</div>
            {m.bio && <p className="bio">“{m.bio}”</p>}
            <ul>{m.why.shared.map((s) => <li key={s}>{s}</li>)}</ul>
            <div className="talk">💬 {m.why.talk}</div>
            <Link href={`/chat/${m.id}`} className="btn small" style={{ marginTop: 10, display: "inline-block" }}>Message {m.name.split(" ")[0]}</Link>
          </div>
        </div>
      ))}
    </>
  );
}
