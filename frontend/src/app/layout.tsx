import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Splitza — Split Any Subscription, Pay Only Your Share",
  description:
    "Splitza is India's first automated subscription-sharing marketplace. Pool together with others to split the cost of Netflix, Spotify, YouTube Premium and more via UPI AutoPay — with full escrow protection.",
  keywords: [
    "subscription sharing",
    "split Netflix",
    "split Spotify",
    "UPI subscription",
    "subscription pooling India",
    "Splitza",
  ],
  openGraph: {
    title: "Splitza — Split Any Subscription",
    description: "India's first automated subscription-sharing marketplace with escrow protection.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
