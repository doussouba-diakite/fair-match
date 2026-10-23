import "./globals.css";

export const metadata = {
  title: "Fair Match",
  description: "Values-based co-parent matching with explanations and a fairness audit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <a href="/" className="brand">Fair<span>Match</span></a>
          <nav><a href="/">Quiz</a><a href="/fairness">Fairness audit</a></nav>
        </header>
        <main>{children}</main>
        <footer>Demo with 60 made-up profiles · Built by Doussouba Diakite</footer>
      </body>
    </html>
  );
}
