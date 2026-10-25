"use client";
// A conversation with one match, plus suggested first questions based on where you differ.
import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Chat({ params }) {
  const { id } = use(params); // the [id] part of the URL, e.g. /chat/12
  const router = useRouter();
  const [data, setData] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages/${id}`);
    if (res.status === 401) return router.push("/login");
    const body = await res.json();
    if (!res.ok) return setError(body.error);
    setData(body);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function send(message) {
    setError("");
    const res = await fetch(`/api/messages/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: message }),
    });
    if (!res.ok) return setError((await res.json()).error);
    setText("");
    load();
  }

  if (error && !data) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  const first = data.person.name.split(" ")[0];
  return (
    <>
      <h1>{data.person.name} <span className="muted small">· {data.score}% match · {data.person.city}</span></h1>
      {data.person.isDemo && <p className="muted">This is a demo profile, so it won't reply.</p>}
      <div className="card">
        <b>Good first questions for you two</b>
        <div className="starters">
          {data.starters.map((s) => <button key={s} className="chip" onClick={() => setText(s)}>{s}</button>)}
        </div>
      </div>
      <div className="card thread">
        {data.messages.length === 0 && <p className="muted">No messages yet. Say hi to {first}, or tap a question above.</p>}
        {data.messages.map((m) => <div key={m.id} className={`bubble ${m.mine ? "mine" : ""}`}>{m.body}</div>)}
      </div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send(text); }}>
        <input className="grow" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder={`Message ${first}…`} />
        <button className="btn primary">Send</button>
      </form>
      {error && <p className="error">{error}</p>}
    </>
  );
}
