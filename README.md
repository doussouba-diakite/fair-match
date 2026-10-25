# Fair Match

**Find a co-parent who shares your values.** A full-stack JavaScript app: people create an account, answer ten questions about how they want to raise a child, and get matches ranked by shared values. Every match explains itself in plain English, suggests first conversation questions built from your differences, and lets you message each other. The matching is audited for fairness.

Built with **Next.js 15 (React 19)**, **Node.js** API routes, and **PostgreSQL**.

| Feature | Where it lives |
| --- | --- |
| Sign up, log in, log out (hashed passwords, secure session cookies) | `lib/auth.js`, `app/api/auth/*` |
| Values quiz saved to your profile | `app/quiz/page.js`, `app/api/profile/route.js` |
| Matching with explanations | `lib/match.js`, `app/api/matches/route.js`, `app/matches/page.js` |
| Messaging with suggested first questions | `app/api/messages/[id]/route.js`, `app/chat/[id]/page.js` |
| Fairness audit | `lib/fairness.js`, `app/fairness/page.js` |
| Database tables | `db/schema.sql` |

## How it works

```
Browser (React pages)  ──fetch──►  Next.js API routes (Node)  ──SQL──►  PostgreSQL
  quiz, matches, chat                auth, profile, matches,             users, sessions,
                                     messages                            messages
```

**1. Accounts.** Passwords are hashed with bcrypt before they're saved, so the database never holds a real password. Logging in creates a random 32-byte session token, stored in the `sessions` table and in an `httpOnly` cookie that browser JavaScript can't read. Every protected route calls `currentUser()`, which looks the token up. Wrong email and wrong password get the same error, so nobody can probe which emails have accounts.

**2. Matching** (`lib/match.js`):
- *Dealbreaker:* people in different cities only match if at least one of them is open to moving.
- *Score:* for each question, the gap between your answers (0 = same, 4 = opposite) becomes agreement (1 - gap/4). Important questions count more (faith and time-sharing weigh 1.5x, screen time 0.8x). The weighted average becomes 0-100%.
- *Explanation:* the values you both feel strongly about and agree on, plus the biggest weighted difference to talk about.
- *Conversation starters:* first questions for the topics where you differ most.

**3. Fairness audit** (`lib/fairness.js`). Every demo profile searches once, and we count how often each demographic group (A, B, C) appears in someone's top 5. The matcher never sees the group. Exposure = a group's share of top-5 slots divided by its share of profiles; 1.0 is perfectly proportional, and below 0.8 fails the four-fifths rule used in hiring audits. Current result: 0.98 to 1.01, pass. A test proves the audit catches a matcher that hides one group.

**4. Safety.** All SQL uses parameters (`$1, $2`), which blocks SQL injection. The API validates every input (answers 1-5, known cities, message length) and only saves known quiz fields. You can only message people you could actually match with.

## Run it locally

```bash
npm install
cp .env.example .env.local      # then set DATABASE_URL to your Postgres
npm run db:setup                # creates tables + 60 fictional demo profiles
npm run dev                     # http://localhost:3000
npm test                        # 7 tests: scoring, dealbreakers, explanations, fairness audit
```

## Deploy (free)

1. Create a free Postgres database at [neon.tech](https://neon.tech) and copy its connection string.
2. Run `DATABASE_URL="<that string>" node scripts/setup-db.js` once to create the tables.
3. Import this repo at [vercel.com](https://vercel.com), add `DATABASE_URL` as an environment variable, and deploy.

## What I'd build next

- AI-written match explanations, grounded in both profiles and fact-checked (like my [DisputeIQ](https://github.com/doussouba-diakite/DisputeIQ) project)
- Real-time messages, profile photos with moderation, and blocking/reporting
- Spanish and French versions

---
Demo profiles are fictional. Built by **Doussouba Diakite** · Computer Engineering Technology, CUNY City Tech · [LinkedIn](https://www.linkedin.com/in/doussouba-diakite-a11087324)
