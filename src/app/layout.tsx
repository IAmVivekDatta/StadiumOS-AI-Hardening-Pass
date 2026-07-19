import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SettingsProvider } from "../context/SettingsContext";
import { OperationsProvider } from "../context/OperationsContext";
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
  title: "StadiumOS AI — FIFA World Cup 2026 Smart Stadium Command Center",
  description: "An intelligent, GenAI-driven stadium operating system designed to optimize fan safety, accessibility paths, transport dispatch, and volunteer coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-neutral-950 text-white font-sans">
        <SettingsProvider>
          <OperationsProvider>
            {children}
          </OperationsProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

