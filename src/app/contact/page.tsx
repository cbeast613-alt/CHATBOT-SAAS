"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-outfit py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-xl mx-auto relative z-10">
        <Link href="/" className="text-orange-500 hover:text-orange-400 transition-colors mb-12 inline-block font-bold">
          ← Back to Home
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Contact Sales</h1>
          <p className="text-zinc-400 text-lg">Interested in our Agency plan? Our team is here to help you scale your business.</p>
        </div>

        {submitted ? (
          <div className="bg-zinc-900/50 border border-emerald-500/30 p-12 rounded-[2.5rem] text-center animate-in zoom-in duration-500">
            <div className="text-5xl mb-6">✅</div>
            <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
            <p className="text-zinc-400 mb-8">Thank you for reaching out. A sales representative will contact you within 24 hours.</p>
            <Link href="/" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold inline-block">
              Return Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/30 border border-zinc-800/50 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-md">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Full Name</label>
              <input 
                required 
                name="name"
                type="text" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Company Name</label>
              <input 
                required 
                type="text" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Email</label>
                <input 
                  required 
                  type="email" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Phone</label>
                <input 
                  required 
                  type="tel" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Message</label>
              <textarea 
                required 
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Tell us about your needs..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message →"}
            </button>
            <div className="text-center pt-4">
              <p className="text-zinc-500 text-sm">Or email us directly at <a href="mailto:sales@chatbotsaas.in" className="text-orange-500 font-bold hover:underline">sales@chatbotsaas.in</a></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
