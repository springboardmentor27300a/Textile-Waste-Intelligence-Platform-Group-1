import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Textile Waste Intelligence Platform | AI-Powered Sustainability",
  description:
    "Advanced AI platform for textile waste management, material classification, recycling recommendations, and sustainability analytics. Transform waste into opportunity.",
  keywords: "textile waste, AI, sustainability, recycling, circular economy, material classification",
  openGraph: {
    title: "Textile Waste Intelligence Platform",
    description: "AI-powered textile waste management and sustainability platform",
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
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
