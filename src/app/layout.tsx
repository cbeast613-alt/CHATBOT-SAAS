import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chatbot-saas-plum.vercel.app"),
  title: {
    default: "AI Chatbot for Indian Businesses | ChatBot SaaS",
    template: "%s | ChatBot SaaS",
  },
  description:
    "Automate customer support with AI chatbots that speak English, Hindi & Hinglish. WhatsApp integration, lead capture, UPI payments. Perfect for Indian businesses.",
  openGraph: {
    title: "AI Chatbot for Indian Businesses | ChatBot SaaS",
    description:
      "Multilingual AI chatbot with WhatsApp sync and UPI payments. Built for India.",
    url: "https://chatbot-saas-plum.vercel.app",
    siteName: "ChatBot SaaS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChatBot SaaS — AI Chatbot Platform for Indian Businesses",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chatbot for Indian Businesses | ChatBot SaaS",
    description: "Multilingual AI chatbot with WhatsApp sync. Starts at ₹99/mo.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-outfit">{children}</body>
    </html>
  );
}
