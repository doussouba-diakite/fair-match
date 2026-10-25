// The frame around every page: header with the right links for logged-in vs. logged-out visitors.
import "./globals.css";
import Link from "next/link";
import { currentUser } from "../lib/auth.js";
import LogoutButton from "../components/LogoutButton.js";

export const metadata = {
  title: "Fair Match",
  description: "Find a co-parent who shares your values: matching with plain-English explanations and a fairness audit.",
};

export default async function RootLayout({ children }) {
  const me = await currentUser();
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand">Fair<span>Match</span></Link>
          <nav>
            {me ? (<>
              <Link href="/matches">Matches</Link><Link href="/quiz">My values</Link>
              <Link href="/fairness">Fairness</Link><LogoutButton />
            </>) : (<>
              <Link href="/fairness">Fairness</Link><Link href="/login">Log in</Link>
              <Link href="/signup" className="btn primary small">Sign up</Link>
            </>)}
          </nav>
        </header>
        <main>{children}</main>
        <footer>Fair Match · a portfolio project by Doussouba Diakite · demo profiles are fictional</footer>
      </body>
    </html>
  );
}
