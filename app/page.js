"use client";
// The quiz screen. React keeps the answers in state; "Find my matches" sends them to the backend API.
import { useState } from "react";
import { QUESTIONS, CITIES } from "../lib/questions.js";

const LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

export default function Home() {
  const [answers, setAnswers] = useState({});
  const [city, setCity] = useState("New York");
  const [move, setMove] = useState(false);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const done = Object.keys(answers).length;

  async function findMatches() {
    setLoading(true); setError("");
    const res = await fetch("/api/match", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, city, willingToMove: move }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setMatches(data.matches);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (matches) {
    return (
      <>
        <h1>Your top matches</h1>
        <p className="lead">Ranked by how closely your parenting values line up. Every match says why.</p>
        {matches.length === 0 && <div className="card">No one in range yet. Try saying you're open to moving.</div>}
        {matches.map((m) => (
          <div className="card match" key={m.name + m.city}>
            <div className="ring" style={{ "--p": m.score }}><b>{m.score}%</b></div>
            <div>
              <h3>{m.name}</h3>
              <div className="muted">{m.why.place}</div>
              <ul>{m.why.shared.map((s) => <li key={s}>{s}</li>)}</ul>
              <div className="talk">💬 {m.why.talk}</div>
            </div>
          </div>
        ))}
        <button className="btn" onClick={() => setMatches(null)}>← Change my answers</button>
      </>
    );
  }

  return (
    <>
      <h1>Find a co-parent who shares your values</h1>
      <p className="lead">Ten questions about how you want to raise a child. No photos, no swiping.</p>
      <div className="progress"><div style={{ width: `${(done / QUESTIONS.length) * 100}%` }} /></div>
      {QUESTIONS.map((q, i) => (
        <div className="card" key={q.id}>
          <div className="q">{i + 1}. {q.text}</div>
          <div className="scale">
            {LABELS.map((label, v) => (
              <button key={label} className={answers[q.id] === v + 1 ? "on" : ""}
                      onClick={() => setAnswers({ ...answers, [q.id]: v + 1 })}>{label}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="card row">
        <label>I live in <select value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label><input type="checkbox" checked={move} onChange={(e) => setMove(e.target.checked)} /> I'm open to moving</label>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <button className="btn primary" disabled={done < QUESTIONS.length || loading} onClick={findMatches}>
        {loading ? "Matching…" : done < QUESTIONS.length ? `Answer ${QUESTIONS.length - done} more` : "Find my matches"}
      </button>
    </>
  );
}
