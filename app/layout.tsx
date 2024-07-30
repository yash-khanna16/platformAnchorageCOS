import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import favicon from '@/app/favicon.png'


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
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
