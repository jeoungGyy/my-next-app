import './globals.css';

export const metadata = {
  title: 'Next.js App with src',
  description: 'No TypeScript, using src folder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}