"use client";
// The values quiz. Loads your saved answers (if any), lets you change them, and saves to the database.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, CITIES } from "../../lib/questions.js";

const LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

export default function Quiz() {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [city, setCity] = useState("New York");
  const [move, setMove] = useState(false);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const done = QUESTIONS.filter((q) => answers[q.id]).length;

  // Runs once when the page opens: load the saved profile, or send logged-out visitors to log in.
  useEffect(() => {
    fetch("/api/profile").then(async (res) => {
      if (res.status === 401) return router.push("/login");
      const p = await res.json();
      if (p.answers) setAnswers(p.answers);
      setCity(p.city); setMove(p.willingToMove); setBio(p.bio);
    });
  }, [router]);

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, city, willingToMove: move, bio }),
    });
    setSaving(false);
    if (!res.ok) return setError((await res.json()).error);
    router.push("/matches");
  }

  return (
    <>
      <h1>Your parenting values</h1>
      <p className="lead">Answer honestly; there are no right answers. You can change them anytime.</p>
      <div className="progress"><div style={{ width: `${(done / QUESTIONS.length) * 100}%` }} /></div>
      {QUESTIONS.map((q, i) => (
        <div className="card" key={q.id}>
          <div className="q">{i + 1}. {q.text}</div>
          <div className="scale">
            {LABELS.map((label, v) => (
              <button type="button" key={label} className={answers[q.id] === v + 1 ? "on" : ""}
                      onClick={() => setAnswers({ ...answers, [q.id]: v + 1 })}>{label}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="card">
        <div className="row">
          <label>I live in <select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label><input type="checkbox" checked={move} onChange={(e) => setMove(e.target.checked)} /> I'm open to moving</label>
        </div>
        <label className="block">A short intro (optional)
          <textarea maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="What should a future co-parent know about you?" /></label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn primary" disabled={done < QUESTIONS.length || saving} onClick={save}>
        {saving ? "Saving…" : done < QUESTIONS.length ? `Answer ${QUESTIONS.length - done} more` : "Save and see my matches"}
      </button>
    </>
  );
}
