import type { Metadata, Viewport } from 'next';
import { Baloo_2 } from 'next/font/google';
import './globals.css';

const baloo = Baloo_2({
  variable: '--font-baloo',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

// Next's basePath config rewrites its own internal script/asset URLs automatically,
// but not string paths inside the metadata object — those need the GitHub Pages
// project-page prefix (/listicles-party-game) applied by hand. Empty on Netlify/Vercel.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'Listicles',
  description: 'A party game of ridiculous lists, unique answers, and bonus letters.',
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Listicles',
  },
  icons: {
    icon: `${basePath}/icons/icon-192.png`,
    apple: `${basePath}/icons/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#e0201b',
};

const darkModeInit = `
(function () {
  try {
    var stored = localStorage.getItem('listicles-dark-mode');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === null ? prefersDark : stored === 'true';
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${baloo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeInit }} />
        {/* Warms the browser cache for the Justin-pissed takeover mascot so it's
            already loaded by the time someone first taps the button, instead of
            popping in a second late while the fireworks (pure CSS) show instantly. */}
        <link rel="preload" as="image" href={`${basePath}/justin-mascot.png`} />
        {/* Same idea for the splash screen — it's the very first thing anyone
            sees, so it needs to be fetched before React even hydrates. */}
        <link rel="preload" as="image" href={`${basePath}/splash.png`} fetchPriority="high" />
      </head>
      {/* Safari reserves a strip below the visible viewport for its own UI and
          tints it to match the page's body background for a seamless look —
          it samples that BEFORE our red splash screen paints over it, so it
          was showing the app's normal cream instead. Starting red (matching
          the splash) and switching to the real background once the splash is
          dismissed (see app/page.tsx) fixes the mismatch. */}
      <body className="min-h-full flex flex-col bg-background text-foreground" style={{ backgroundColor: '#e0201b' }}>
        {children}
      </body>
    </html>
  );
}
