import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YADA Administration',
  description: 'Cabinet — CRM, facturation, réception, comptabilité, pilotage',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
