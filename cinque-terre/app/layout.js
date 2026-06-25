import "./globals.css";

export const metadata = {
  title: "Monterosso · Cinque Terre — sea tour",
  description:
    "A private sea tour of the Cinque Terre from Monterosso al Mare, Liguria. Book in a moment — no prepayment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400&family=Hanken+Grotesk:wght@300;400;500;600;700&family=Great+Vibes&family=Jost:wght@200;300;400;500;600;700&family=Limelight&display=swap"
          rel="stylesheet"
        />
        <script src="/visitor.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
