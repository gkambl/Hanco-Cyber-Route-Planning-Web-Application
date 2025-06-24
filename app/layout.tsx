import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hanco Cyber - Strategic Security Solutions',
  description: 'Executive-level cybersecurity assessment and strategic security solutions. Understand your risk, build your roadmap, stay compliant.',
  keywords: 'cybersecurity, security assessment, managed SOC, vulnerability management, compliance, risk management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}