"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/overview` },
    });
    if (error) setLoading(false);
  }

  return (
    <div className="auth">
      <div className="auth-brand">
        <Link href="/" className="brand" style={{ color: "#fff" }}>
          <span className="seal" style={{ background: "rgba(255,255,255,.14)" }}>Lb</span> Ledgerbook
        </Link>
        <div>
          <div className="quote">
            &ldquo;I send invoices on WhatsApp before I leave the customer&apos;s shop. Paid before I get home.&rdquo;
          </div>
          <div className="by">— Halima, wholesale trader · Kano</div>
        </div>
        <div style={{ fontSize: 12.5, position: "relative", color: "#8399ba" }}>
          Trusted by small businesses across Nigeria
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-card">
          <h2>Access your account</h2>
          <p className="sub">Sign in to your workspace to create and send invoices.</p>

          <button
            className="btn btn-white"
            style={{ width: "100%", justifyContent: "center", gap: 10, padding: "12px 18px" }}
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <GoogleMark />
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>

          <p className="auth-note" style={{ marginTop: 22 }}>
            A workspace is created for you automatically on first sign-in.
          </p>
          <p className="auth-note" style={{ marginTop: 14 }}><Link href="/">← Back to home</Link></p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
