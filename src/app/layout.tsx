import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FestivaAI – GenAI Celebration & Event Planner',
  description:
    'Intelligent context-driven event planning assistant for Weddings, Birthdays, and Community Gatherings. Dynamic budget re-balancing, reverse-engineered milestone timelines, vendor negotiator, and vibe studio.',
  keywords: [
    'FestivaAI',
    'Event Planner AI',
    'Wedding Budget Calculator',
    'AI Event Timeline',
    'Vendor Negotiator',
    'Challenge 5 Hackathon',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {/* Skip to Main Content Landmark for WCAG AAA */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:ring-4 focus:ring-purple-400 font-bold text-xs"
        >
          Skip to main content
        </a>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
