import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Prescripto-AI | Medical Analytics Platform",
    template: "%s | Prescripto-AI",
  },
  description:
    "AI-powered prescription and health analytics management system for patients and doctors.",
  keywords: ["medical", "prescription", "AI", "health analytics", "doctor"],
  openGraph: {
    type: "website",
    siteName: "Prescripto-AI",
    title: "Prescripto-AI | Medical Analytics Platform",
    description:
      "AI-powered prescription and health analytics management system.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prescripto-AI",
    description: "AI-powered medical analytics platform.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
