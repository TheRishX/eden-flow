import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseTaskNotificationManager } from '@/components/FirebaseTaskNotificationManager';
import { FirebaseClientProvider } from '@/firebase';
import { GlobalKeyListener } from '@/components/GlobalKeyListener';

export const metadata: Metadata = {
  title: 'EdenFlow',
  description: 'A beautiful and productive new tab replacement',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <GlobalKeyListener />
          {children}
          <Toaster />
          <FirebaseTaskNotificationManager />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
