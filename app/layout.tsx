import type { Metadata } from "next";
import {
  Instrument_Serif,
  Geist,
  JetBrains_Mono,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const body = Geist({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const deva = Tiro_Devanagari_Hindi({
  variable: "--font-deva",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "devanagari"],
});

export const metadata: Metadata = {
  title: "Parakhi — kya hai andar?",
  description:
    "Where does your money go when you buy an Indian product? Indian Value Capture, tax, and import origins — every number sourced. Kya hai andar?",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${deva.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
