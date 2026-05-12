import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login or Sign Up | ChatBot SaaS",
  description: "Sign in to your ChatBot SaaS dashboard or create a free account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
