import './globals.css';

export const metadata = {
  title: 'Next.js 테스트',
  description: 'No TypeScript, using src folder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}