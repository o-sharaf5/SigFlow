import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SigFlow — Free HTML Email Signature Generator",
  description:
    "Build paste-perfect HTML email signatures for Gmail, Outlook and Apple Mail. Live preview, 4 layout templates, one-click copy. No sign-up, nothing leaves your browser.",
  openGraph: {
    title: "SigFlow — HTML Email Signature Generator",
    description: "Live editor, email-safe inline-styled output, one-click copy to Gmail/Outlook.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // suppressHydrationWarning: next-themes mutates <html class> before hydration.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning on <body>: browser extensions (e.g. ChatGPT's
          injects cz-shortcut-listen="true") mutate <body> before React hydrates.
          The diff is attribute-only and harmless, so it's safe to suppress. */}
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
