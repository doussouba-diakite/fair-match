"use client";
// One form for both sign-up and log-in. `mode` decides which fields show and which API it calls.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const signup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault(); // stop the browser's default full-page form submit
    setBusy(true); setError("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    router.push(signup ? "/quiz" : "/matches");
    router.refresh();
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>{signup ? "Create your account" : "Welcome back"}</h1>
      {signup && <label>First name<input value={form.name} onChange={update("name")} autoComplete="given-name" required /></label>}
      <label>Email<input type="email" value={form.email} onChange={update("email")} autoComplete="email" required /></label>
      <label>Password<input type="password" value={form.password} onChange={update("password")} minLength={signup ? 8 : undefined}
                           autoComplete={signup ? "new-password" : "current-password"} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn primary" disabled={busy}>{busy ? "One moment…" : signup ? "Sign up" : "Log in"}</button>
      <p className="muted">{signup ? <>Have an account? <Link href="/login">Log in</Link></> :
                                      <>New here? <Link href="/signup">Create an account</Link></>}</p>
    </form>
  );
}
