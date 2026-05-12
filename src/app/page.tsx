"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import ChatWidget from "@/components/ChatWidget";
import LiveDemo from "@/components/LiveDemo";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-outfit selection:bg-orange-500/30 selection:text-orange-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
              <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                ChatBot SaaS
              </span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-zinc-400">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href={session ? "/dashboard" : "/auth"} className="text-zinc-100 font-semibold hover:text-white transition-colors">
                {session ? "Dashboard" : "Login"}
              </Link>
              <Link href={session ? "/dashboard" : "/auth"} className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                {session ? "Dashboard" : "Get Started"}
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className={`block w-5 h-0.5 bg-zinc-300 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-zinc-300 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-zinc-300 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-zinc-800/50 bg-[#09090b]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col space-y-4 text-sm font-medium">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors py-2 border-b border-zinc-800/30"
              >Features</Link>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors py-2 border-b border-zinc-800/30"
              >Pricing</Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors py-2 border-b border-zinc-800/30"
              >FAQ</Link>
              <Link
                href={session ? "/dashboard" : "/auth"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-100 font-semibold hover:text-white transition-colors py-2 border-b border-zinc-800/30"
              >{session ? "Dashboard" : "Login"}</Link>
              <Link
                href={session ? "/dashboard" : "/auth"}
                onClick={() => setMobileMenuOpen(false)}
                className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all text-center shadow-[0_0_20px_rgba(249,115,22,0.2)]"
              >{session ? "Dashboard" : "Get Started"}</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden lg:pt-48 lg:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[140px] animate-pulse"></div>
            <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>The Future of Customer Support</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] lg:max-w-5xl lg:mx-auto">
              Turn your website into a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                24/7 Sales Engine
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Automate support, capture leads, and boost sales with AI chatbots that speak English, Hindi, and Hinglish. Starts at just ₹99/month.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/auth" className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.2)] hover:-translate-y-1 active:scale-95">
                Start Free Trial
              </Link>
              <Link href="#demo" className="w-full sm:w-auto bg-zinc-900 text-white border border-zinc-800 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-zinc-800 transition-all flex items-center justify-center space-x-3">
                <span>View Live Demo</span>
                <span className="text-orange-500">→</span>
              </Link>
            </div>

            {/* Trusted by Section */}
            <div className="mt-32 pt-16 border-t border-zinc-800/30">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-12">Trusted by 500+ Indian Businesses</p>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                {["Shopify", "WooCommerce", "WordPress", "Wix"].map(platform => (
                  <span
                    key={platform}
                    className="text-sm font-semibold text-zinc-500 tracking-wider uppercase px-4 py-2 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors bg-zinc-900/50"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-[#0c0c0e] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tight">Built for Growth</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">Powerful features that help you scale without adding head-count.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Multilingual AI",
                  desc: "Supports English, Hindi, and Hinglish. Automatically detects user language and responds fluently.",
                  icon: "🗣️"
                },
                {
                  title: "WhatsApp Sync",
                  desc: "Connect your AI chatbot to WhatsApp Business. Chat with customers where they are most comfortable.",
                  icon: "📱"
                },
                {
                  title: "Lead Generation",
                  desc: "Automatically collect names, phone numbers, and emails. Sync directly to your CRM or Google Sheets.",
                  icon: "📈"
                },
                {
                  title: "Instant Setup",
                  desc: "Just paste one line of code. Works with WordPress, Wix, Shopify, or any custom-built website.",
                  icon: "⚡"
                },
                {
                  title: "Local Payments",
                  desc: "Pay in ₹ via UPI, PhonePe, GPay, or Paytm. Transparent INR pricing with no hidden fees.",
                  icon: "💳"
                },
                {
                  title: "White-labeling",
                  desc: "Remove our branding and use your own logo. Perfect for agencies managing multiple clients.",
                  icon: "🏢"
                }
              ].map((f, i) => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-10 rounded-[2.5rem] hover:bg-zinc-900/50 transition-all group relative overflow-hidden">
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Demo Section */}
        <section id="demo" className="py-32 bg-zinc-950 relative border-y border-zinc-900 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-orange-500/5 rounded-full blur-[120px] -z-0"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1 space-y-10">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    Interactive Preview
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-[0.95] mb-8">
                    See your future <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Assistant in action</span>
                  </h2>
                  <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                    Experience how our AI captures leads and handles customer queries automatically. This is exactly what your visitors will see.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-white tracking-tighter">98%</p>
                    <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Accuracy Rate</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-white tracking-tighter">&lt; 2s</p>
                    <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Response Time</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl max-w-md">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-zinc-300">Automatic Lead Sync enabled for this demo.</p>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 to-transparent blur-2xl rounded-[3rem] opacity-50"></div>
                <LiveDemo />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 bg-[#09090b] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                Success Stories
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                Loved by India's <br />
                Fastest Growing Brands
              </h2>
              <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">
                Join 500+ businesses automating their growth with ChatBot SaaS.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Rahul Mehra",
                  business: "D2C Clothing Brand",
                  city: "Mumbai",
                  quote: "We've seen a 40% increase in lead conversion since adding the chatbot. The Hinglish support is a game-changer for our customers."
                },
                {
                  name: "Priya Sharma",
                  business: "IIT-JEE Coaching Institute",
                  city: "Delhi",
                  quote: "Our team used to spend hours answering basic fee queries. Now, the AI handles 90% of it, allowing us to focus on counseling."
                },
                {
                  name: "Anish Gupta",
                  business: "Real Estate Agency",
                  city: "Bangalore",
                  quote: "The lead quality is incredible. Getting phone numbers and requirements directly in our CRM while we sleep is pure magic."
                }
              ].map((t, i) => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-10 rounded-[2.5rem] hover:bg-zinc-900/50 transition-all group flex flex-col h-full">
                  <div className="flex space-x-1 mb-8">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-zinc-100 text-lg font-medium leading-relaxed italic mb-10 flex-1">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center space-x-4 pt-8 border-t border-zinc-800/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center text-xl font-bold text-zinc-400 group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-500 shadow-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-black text-sm tracking-tight">{t.name}</p>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                        {t.business} • {t.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tight">Simple Pricing</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">No hidden costs. Scale your plan as you grow your business.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "99",
                  desc: "Perfect for blogs and personal projects.",
                  features: ["300 Messages/month", "Standard AI (Flash)", "Email Support", "ChatBot SaaS badge shown"],
                  cta: "Get Started",
                  popular: false
                },
                {
                  name: "Growth",
                  price: "499",
                  desc: "Best for growing stores & SMEs.",
                  features: ["Unlimited Messages*", "Pro AI (Gemini Pro)", "WhatsApp Sync", "No Branding", "Lead Capture"],
                  cta: "Start Free Trial",
                  popular: true
                },
                {
                  name: "Agency",
                  price: "1,999",
                  desc: "For multi-client management.",
                  features: ["All Growth Features", "White-label Dashboard", "Sub-accounts", "Priority Support", "Bulk Allocation"],
                  cta: "Contact Us",
                  popular: false
                }
              ].map((plan, i) => (
                <div key={i} className={`relative p-10 rounded-[3rem] border transition-all flex flex-col ${
                  plan.popular 
                    ? 'bg-zinc-900 border-orange-500/50 shadow-[0_40px_80px_rgba(249,115,22,0.1)] scale-105 z-10' 
                    : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50'
                }`}>
                  {plan.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20">
                      Most Popular
                    </span>
                  )}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                    <p className="text-zinc-500 text-sm font-medium">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline mb-10">
                    <span className="text-5xl font-black text-white tracking-tighter">₹{plan.price}</span>
                    <span className="text-zinc-500 ml-2 font-bold">/mo</span>
                  </div>
                  <ul className="space-y-5 mb-12 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center text-sm text-zinc-400 font-medium">
                        <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center mr-4">
                          <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.name === "Agency" ? "/contact" : "/auth"} className="block w-full">
                    <button className={`w-full py-5 rounded-2xl font-black transition-all ${
                      plan.popular 
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20' 
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pricing Footnotes (Fix 5 & 6) */}
            <div className="max-w-4xl mx-auto mt-16 space-y-4">
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                * Unlimited Messages subject to a fair use policy of 10,000 messages/month per chatbot. 
                <Link href="/contact" className="text-orange-500 hover:underline ml-1">Contact us</Link> for higher volume needs.
              </p>
              <div className="h-px bg-zinc-900 w-24 mx-auto"></div>
              <div className="text-center text-sm text-zinc-400">
                <p className="font-bold text-zinc-300">Cancel anytime — no lock-in contracts.</p>
                <p className="mt-1">7-day refund policy on first payment. <Link href="/terms#refund" className="text-orange-500 hover:underline">See full policy →</Link></p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section (Fix 8) */}
        <section id="faq" className="py-32 bg-[#09090b]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tight">Got Questions?</h2>
              <p className="text-zinc-500 text-lg font-medium">Everything you need to know about ChatBot SaaS.</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "Does this work with my existing website?",
                  a: "Yes. Just paste one line of JavaScript into your website's HTML. Works with WordPress, Wix, Shopify, or any custom site."
                },
                {
                  q: "What languages does the chatbot support?",
                  a: "English, Hindi, and Hinglish. The chatbot automatically detects the user's language and responds fluently."
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, cancel anytime from your dashboard. No hidden fees or lock-in contracts. First payment is refundable within 7 days."
                },
                {
                  q: "How does WhatsApp Sync work?",
                  a: "Connect your WhatsApp Business account from your dashboard. Conversations from your website chatbot will sync to your WhatsApp Business inbox."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "UPI, PhonePe, Google Pay, Paytm, and all major credit/debit cards. All prices are in INR with no foreign transaction fees."
                },
                {
                  q: "What does 'Unlimited Messages*' mean?",
                  a: "Unlimited within a fair use policy of 10,000 messages/month per chatbot. For higher volumes, contact us for a custom plan."
                }
              ].map(({ q, a }, i) => (
                <details key={i} className="group bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 cursor-pointer hover:bg-zinc-900/50 transition-all">
                  <summary className="font-bold text-lg text-white list-none flex justify-between items-center">
                    {q}
                    <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-zinc-400 leading-relaxed font-medium">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-zinc-500 py-24 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-2">
                <Link href="/" className="flex items-center space-x-3 mb-8">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xl font-bold tracking-tight text-white">ChatBot SaaS</span>
                </Link>
                <p className="max-w-xs leading-relaxed font-medium">
                  The first AI chatbot platform built specifically for the unique needs of Indian businesses.
                </p>
                <div className="flex gap-4 mt-8">
                  <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                    {/* <X size={18} /> */}
                  </a>
                  <a href="https://www.linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                    {/* <Linkedin size={18} /> */}
                  </a>
                  <a href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                    {/* <Instagram size={18} /> */}
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Product</h4>
                <ul className="space-y-5 font-medium">
                  <li><Link href="#features" className="hover:text-orange-500 transition-colors">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</Link></li>
                  <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact Sales</Link></li>
                  <li>
                    <Link href={session ? "/dashboard" : "/auth"} className="hover:text-orange-500 transition-colors">
                      {session ? "Dashboard" : "Login"}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Resources</h4>
                <ul className="space-y-5 font-medium">
                  <li><Link href="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                  <li><Link href="/gdpr" className="hover:text-orange-500 transition-colors">GDPR Compliance</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Contact Us</h4>
                <ul className="space-y-5 font-medium">
                  <li>
                    <a href="mailto:hello@chatbotsaas.in" className="flex items-center space-x-3 hover:text-orange-500 transition-colors group">
                      <Mail size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                      <span>hello@chatbotsaas.in</span>
                    </a>
                  </li>
                  <li className="text-sm pt-2">
                    Plot No. 42, Sector 18,<br />
                    Gurugram, Haryana 122015
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-zinc-900 pt-12 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-700">
              <p>© 2026 ChatBot SaaS Technologies. All rights reserved.</p>
              <div className="mt-8 md:mt-0 flex items-center space-x-2">
                <span>Made in India</span>
                <span className="text-base">🇮🇳</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <ChatWidget
        tenantId="demo"
        primaryColor="#f97316"
        botName="ChatBot SaaS"
        isPreview={true}
      />
    </div>
  );
}

