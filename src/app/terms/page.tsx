import Link from "next/link";

export const metadata = {
  title: "Terms of Service | ChatBot SaaS",
  description: "Read our terms of service and usage policies.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-outfit py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-orange-500 hover:text-orange-400 transition-colors mb-8 inline-block font-bold">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Terms of Service</h1>
        <div className="space-y-8 leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ChatBot SaaS, you agree to be bound by these Terms of Service and all applicable laws and regulations in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Subscription and Payments</h2>
            <p>
              Subscriptions are billed on a monthly basis in Indian Rupees (₹). We accept payments via UPI, Credit/Debit cards, and Net Banking.
            </p>
          </section>

          <section id="refund">
            <h2 className="text-xl font-bold text-white mb-4">3. Refund and Cancellation Policy</h2>
            <p>
              In accordance with India&apos;s Consumer Protection Act 2019:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Cancellation:</strong> You can cancel your subscription at any time from your dashboard. Your service will remain active until the end of the current billing cycle.</li>
              <li><strong>Refunds:</strong> We offer a 7-day full refund policy on your first payment. If you are not satisfied with the service, contact us within 7 days of your initial purchase for a full refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Acceptable Use</h2>
            <p>
              You agree not to use the chatbot platform for any illegal activities, spamming, or harassment. We reserve the right to terminate accounts that violate our usage policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              ChatBot SaaS shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
