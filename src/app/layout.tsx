import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/theme-provider";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { SideRail } from "../components/side-rail";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "snipline - shorten links, instantly",
  description:
    "A fast, no-nonsense URL shortener. Paste a long link, get a short one back in real time, and keep a live log of every redirect.",
  openGraph: {
    title: "snipline - shorten links, instantly",
    description: "Paste a long link, get a short one back in real time.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

// Runs before paint so the saved theme applies immediately, with no
// light-mode flash for visitors who prefer dark.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('snipline-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} flex min-h-screen flex-col bg-bg font-body text-ink antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <SideRail side="left" label="SNIPLINE · REAL-TIME URL SHORTENER" />
          <SideRail side="right" label="CREATED BY GTRE5" tone="credit" />
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}