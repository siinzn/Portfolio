import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sg",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio — Muhammad Sinan",
  description: "Systems & Graphics Programmer | Backend Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased bg-black overflow-y-scroll`}
        style={{
          fontFamily: "var(--font-sg), sans-serif",
          scrollbarGutter: "stable",
        }}
      >
        <Navbar />
        {/* pt-16 offsets the fixed navbar (navbar ~64px tall) */}
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
