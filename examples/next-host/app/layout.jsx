export const metadata = { title: 'CAPS Next.js host' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif' }}>{children}</body>
    </html>
  );
}
