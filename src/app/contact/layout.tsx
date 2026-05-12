import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sales | ChatBot SaaS",
  description: "Talk to our team about the Agency plan or custom chatbot solutions for your business.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
