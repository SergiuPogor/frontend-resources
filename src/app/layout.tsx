import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/schibsted-grotesk";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'G-XY3GKG4Y6S';

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://frontend-resources-demo.vercel.app"
  ),
  title: "Frontend Resources",
  description: "🚀 The official database for the 'Frontend Resources' website! A community-curated list of the best frontend tools, libraries, and learning materials. Contributions welcome! ⭐",
  openGraph: {
    title: "Frontend Resources",
    description: "🚀 The official database for the 'Frontend Resources' website! A community-curated list of the best frontend tools, libraries, and learning materials. Contributions welcome! ⭐",
    url: "/",
    siteName: "Frontend Resources",
    images: [
      {
        url: "/og-frontend-resources.png", // Add your OG image at public/og-frontend-resources.png
        width: 1200,
        height: 630,
        alt: "Frontend Resources Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontend Resources",
    description: "🚀 The official database for the 'Frontend Resources' website! A community-curated list of the best frontend tools, libraries, and learning materials. Contributions welcome! ⭐",
    images: ["/og-frontend-resources.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} font-sans antialiased bg-bg text-ink`}
      >
        {/* Google Analytics / Google Tag Manager */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTM_ID}');
          `}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
