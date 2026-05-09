import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set.");
    return null;
  }
  return new Resend(key);
};

const FROM = "ChatBot SaaS <hello@chatbotsaas.in>"; // Updated to match new brand
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ── 1. Welcome Email (sent on signup) ───────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to ChatBot SaaS — Your free trial has started! 🎉",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#18181b;border-radius:24px;overflow:hidden;border:1px solid #27272a;color:#ffffff;">
    <div style="background:linear-gradient(to bottom, #18181b, #09090b);padding:40px 36px;text-align:center;border-bottom:1px solid #27272a;">
      <div style="display:inline-block;width:12px;height:12px;background:#f97316;border-radius:50%;margin-right:8px;vertical-align:middle;"></div>
      <div style="display:inline-block;font-size:24px;font-weight:900;color:#fff;vertical-align:middle;letter-spacing:-1px;">ChatBot SaaS</div>
    </div>
    <div style="padding:40px 36px;">
      <h1 style="font-size:24px;color:#fff;margin:0 0 12px;font-weight:900;letter-spacing:-0.5px;">Namaste ${name}! 👋</h1>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 32px;">
        Your 7-day free trial has started. You can now create your first AI chatbot and embed it on your website in minutes.
      </p>
      <div style="background:#1e1e24;border-radius:16px;padding:24px;margin-bottom:32px;border:1px solid #f9731633;">
        <div style="font-weight:700;color:#f97316;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Your trial includes:</div>
        <div style="color:#e4e4e7;font-size:15px;line-height:2.2;">
          • 1 AI chatbot instance<br/>
          • 300 Gemini-powered messages<br/>
          • Customizable widget embed<br/>
          • Hindi + English + Hinglish support
        </div>
      </div>
      <a href="${APP_URL}/dashboard" style="display:block;background:#f97316;color:#fff;text-align:center;padding:18px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 10px 20px -10px #f9731680;">
        Launch Dashboard →
      </a>
      <p style="color:#71717a;font-size:14px;margin-top:32px;line-height:1.5;">
        Need help? Reply to this email or reach out via the dashboard. We're here to help you scale your support.
      </p>
    </div>
    <div style="background:#09090b;padding:24px 36px;text-align:center;border-top:1px solid #27272a;">
      <p style="color:#52525b;font-size:12px;margin:0;font-weight:500;">
        © 2025 ChatBot SaaS — Modern AI for Business<br/>
        <a href="${APP_URL}/unsubscribe" style="color:#f97316;text-decoration:none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── 2. Trial Ending Email (sent on day 5) ───────────────────
export async function sendTrialEndingEmail(email: string, name: string) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your free trial ends in 2 days — upgrade for ₹99/month",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#18181b;border-radius:24px;overflow:hidden;border:1px solid #27272a;color:#ffffff;">
    <div style="background:linear-gradient(to right, #f97316, #ea580c);padding:40px 36px;text-align:center;">
      <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-1px;">⏰ Trial ending soon</div>
    </div>
    <div style="padding:40px 36px;">
      <h1 style="font-size:22px;color:#fff;margin:0 0 16px;font-weight:900;">Hi ${name}, your trial ends in 2 days</h1>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 32px;">
        Don't lose your chatbot! Upgrade now to keep it running on your website 24/7 without interruption.
      </p>
      <div style="background:#1e1e24;border:1px solid #f9731633;border-radius:16px;padding:24px;margin-bottom:32px;">
        <div style="font-weight:900;color:#f97316;font-size:20px;margin-bottom:4px;">Starter Plan — just ₹99/month</div>
        <div style="color:#71717a;font-size:14px;font-weight:500;">Premium support at less than ₹4 per day.</div>
      </div>
      <a href="${APP_URL}/dashboard/billing" style="display:block;background:#f97316;color:#fff;text-align:center;padding:18px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;">
        Keep My Chatbot →
      </a>
      <p style="color:#71717a;font-size:13px;margin-top:24px;">
        Secure payments via Razorpay. UPI, cards, and net banking accepted.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── 3. Payment Success Email ─────────────────────────────────
export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  plan: string,
  amount: number,
  invoice: string
) {
  const planDisplay = plan.charAt(0).toUpperCase() + plan.slice(1);
  const amountDisplay = `₹${(amount / 100).toLocaleString("en-IN")}`;

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Payment confirmed — Welcome to ${planDisplay} plan! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#18181b;border-radius:24px;overflow:hidden;border:1px solid #27272a;color:#ffffff;">
    <div style="background:#16a34a;padding:40px 36px;text-align:center;">
      <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">✅ Payment Successful</div>
    </div>
    <div style="padding:40px 36px;">
      <h1 style="font-size:22px;color:#fff;margin:0 0 24px;font-weight:900;">Thank you, ${name}!</h1>
      <div style="background:#1e1e24;border:1px solid #16a34a33;border-radius:16px;padding:24px;margin-bottom:32px;">
        <table style="width:100%;font-size:15px;color:#e4e4e7;">
          <tr><td style="color:#71717a;padding:8px 0;">Subscription Plan</td><td style="color:#fff;font-weight:700;text-align:right;">${planDisplay}</td></tr>
          <tr><td style="color:#71717a;padding:8px 0;">Amount Paid</td><td style="color:#fff;font-weight:700;text-align:right;">${amountDisplay}</td></tr>
          <tr><td style="color:#71717a;padding:8px 0;">Transaction ID</td><td style="color:#fff;font-weight:700;text-align:right;">${invoice}</td></tr>
          <tr><td style="color:#71717a;padding:8px 0;">Date</td><td style="color:#fff;font-weight:700;text-align:right;">${new Date().toLocaleDateString("en-IN")}</td></tr>
        </table>
      </div>
      <a href="${APP_URL}/dashboard" style="display:block;background:#f97316;color:#fff;text-align:center;padding:18px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;">
        Access My Dashboard →
      </a>
      <p style="color:#71717a;font-size:13px;margin-top:20px;text-align:center;">
        A copy of this receipt has been saved to your billing history.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── 4. Usage 80% Warning Email ───────────────────────────────
export async function sendUsageWarningEmail(
  email: string,
  name: string,
  used: number,
  limit: number,
  plan: string
) {
  const planDisplay = plan.charAt(0).toUpperCase() + plan.slice(1);
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "⚠️ You've used 80% of your monthly messages",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#18181b;border-radius:24px;overflow:hidden;border:1px solid #27272a;color:#ffffff;">
    <div style="background:#f97316;padding:32px 36px;text-align:center;">
      <div style="font-size:22px;font-weight:900;color:#fff;">⚠️ Usage Alert</div>
    </div>
    <div style="padding:40px 36px;">
      <h1 style="font-size:20px;color:#fff;margin:0 0 16px;font-weight:900;">Hi ${name}, your chatbot is nearly full</h1>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 24px;">
        You've used <strong>${used} of ${limit} messages</strong> this month on the ${planDisplay} plan. 
        Only <strong>${limit - used} messages left</strong> before your chatbot pauses.
      </p>
      <div style="background:#1e1e24;border-radius:12px;padding:20px;margin-bottom:32px;border:1px solid #27272a;">
        <div style="background:#27272a;border-radius:6px;height:14px;overflow:hidden;margin-bottom:12px;">
          <div style="background:#f97316;width:80%;height:100%;border-radius:6px;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#71717a;font-weight:600;">
          <span>${used} USED</span><span>${limit} LIMIT</span>
        </div>
      </div>
      <a href="${APP_URL}/dashboard/billing" style="display:block;background:#f97316;color:#fff;text-align:center;padding:18px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;">
        Upgrade Plan →
      </a>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── 5. Bot Paused Email (limit reached) ─────────────────────
export async function sendBotPausedEmail(
  email: string,
  name: string,
  plan: string
) {
  const upgradePlan = plan === "starter" ? "Growth (₹499/mo)" : "Agency (₹1,999/mo)";
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "🔴 Your chatbot has been paused — monthly limit reached",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#18181b;border-radius:24px;overflow:hidden;border:1px solid #27272a;color:#ffffff;">
    <div style="background:#dc2626;padding:32px 36px;text-align:center;">
      <div style="font-size:22px;font-weight:900;color:#fff;">🔴 Chatbot Paused</div>
    </div>
    <div style="padding:40px 36px;">
      <h1 style="font-size:20px;color:#fff;margin:0 0 16px;font-weight:900;">Hi ${name}, your chatbot has paused</h1>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 32px;">
        You've reached your monthly message limit. Your chatbot is currently showing a fallback message to visitors. Upgrade now to restore it instantly.
      </p>
      <a href="${APP_URL}/dashboard/billing" style="display:block;background:#dc2626;color:#fff;text-align:center;padding:18px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;">
        Upgrade to ${upgradePlan} →
      </a>
      <p style="color:#71717a;font-size:13px;margin-top:24px;text-align:center;">
        Your bot will reactivate automatically next month on the same plan.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}
