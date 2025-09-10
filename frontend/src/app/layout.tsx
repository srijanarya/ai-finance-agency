import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProviderWrapper } from "@/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Finance Agency - AI-Powered Financial Trading Platform",
  description: "Advanced AI-driven financial platform for trading, portfolio management, and market intelligence.",
  keywords: ["AI trading", "financial platform", "portfolio management", "market data", "trading signals"],
  authors: [{ name: "AI Finance Agency" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProviderWrapper>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
