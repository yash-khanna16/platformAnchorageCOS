import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import favicon from "@/app/favicon.png";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COS",
  description: "Contactless Ordering System (COS) for Anchorage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={favicon.src} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        
      </head>
      <body className={inter.className}>
        {children}
        <GoogleAnalytics gaId="G-5XLZK2PKC8" />
      </body>
    </html>
  );
}
