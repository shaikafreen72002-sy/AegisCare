import type { Metadata } from 'next';
import './globals.css';
import { PatientProvider } from '@/lib/context/PatientContext';

export const metadata: Metadata = {
  title: 'AegisCare — Patient Medication Adherence Coach',
  description: 'Evidence-grounded, accessible, multi-agent AI medication adherence coach for dementia and memory care.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PatientProvider>
          {children}
        </PatientProvider>
      </body>
    </html>
  );
}
