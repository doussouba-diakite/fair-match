// Landing page (rendered on the server).
import Link from "next/link";
import { currentUser } from "../lib/auth.js";

export default async function Home() {
  const me = await currentUser();
  return (
    <>
      <section className="hero">
        <h1>Find a co-parent who shares your values.</h1>
        <p className="lead">Ten questions about how you want to raise a child. Matches ranked by shared values, with a
          plain-English reason for every match and questions to start the conversation.</p>
        <Link href={me ? (me.answers ? "/matches" : "/quiz") : "/signup"} className="btn primary">
          {me ? (me.answers ? "See my matches" : "Take the quiz") : "Get started"}</Link>
      </section>
      <section className="steps">
        <div className="card"><b>1. Share your values</b><p className="muted">Routine, faith, school, culture, how to split time and costs.</p></div>
        <div className="card"><b>2. See why you match</b><p className="muted">Shared values first, and the biggest difference to talk about.</p></div>
        <div className="card"><b>3. Start the right conversation</b><p className="muted">Suggested first questions built from your differences.</p></div>
      </section>
      <p className="muted center">Matching is audited for fairness: <Link href="/fairness">see the audit</Link>.</p>
    </>
  );
}
