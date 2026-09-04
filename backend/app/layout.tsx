import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veylora Game Hub & Proxy API',
  description: 'Cinematic dark mode game explorer and Next.js backend proxy API for PlayStation and Xbox store services.',
  openGraph: {
    title: 'Veylora Game Hub & Proxy API',
    description: 'Cinematic dark mode game explorer and Next.js backend proxy API for PlayStation and Xbox store services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veylora Game Hub & Proxy API',
    description: 'Cinematic dark mode game explorer and Next.js backend proxy API for PlayStation and Xbox store services.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="bg-[#000000] text-zinc-100 antialiased min-h-screen selection:bg-[#6001D2] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
