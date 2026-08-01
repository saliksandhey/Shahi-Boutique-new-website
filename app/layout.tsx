import type { Metadata } from "next";
import { Inter, Oswald, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shahiboutique.com'),
  title: {
    template: "%s | Shahi Boutique",
    default: "Shahi Boutique | Best Boutique in Malerkotla | Premium Fashion",
  },
  description: "Discover Shahi Boutique, the best boutique in Malerkotla. Shop our premium collections of bespoke bridal wear, stunning potli bags, suits, and hand-embroidered luxury accessories.",
  keywords: ["Shahi Boutique", "Best Boutique in Malerkotla", "Shahi Boutique Malerkotla", "Boutiques", "Potli", "Bridal Wear", "Premium Fashion", "Hand Embroidery", "Suits"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "Shahi Boutique | Best Boutique in Malerkotla",
    description: "Shop premium collections of bespoke bridal wear and stunning potli bags at the best boutique in Malerkotla.",
    siteName: "Shahi Boutique",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shahi Boutique | Best Boutique in Malerkotla",
    description: "Shop premium collections of bespoke bridal wear and stunning potli bags at the best boutique in Malerkotla.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${oswald.variable} ${greatVibes.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans text-gray-900 bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              "name": "Shahi Boutique",
              "@id": "https://www.shahiboutique.com",
              "url": "https://www.shahiboutique.com",
              "telephone": ["+919041762820", "+919217890060"],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Telian Bazar",
                "addressLocality": "Malerkotla",
                "addressRegion": "Punjab",
                "addressCountry": "IN"
              }
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
