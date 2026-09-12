import "./globals.css";

export const metadata = {
  title: "edible — Know what you eat.",
  description: "AI-powered food and meal scanner"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
