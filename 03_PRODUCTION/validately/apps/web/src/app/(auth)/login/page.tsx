"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-surface-1 border border-border rounded-xl p-8">
        <h1 className="text-xl font-bold mb-2 text-center">Welcome back</h1>
        <p className="text-xs text-content-subtle text-center mb-6">
          Log in to continue validating your startup.
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* FIX P0: Show magic link confirmation */}
        {magicLinkSent && (
          <div
            className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20 text-success text-sm text-center"
            role="status"
            aria-live="polite"
          >
            <div className="font-bold mb-1">Check your inbox!</div>
            <div className="text-xs">
              We sent a magic link to <strong>{email}</strong>. Click it to log
              in.
            </div>
          </div>
        )}

        <button
          onClick={async () => {
            setIsLoading(true);
            setError("");
            try {
              const result = await signIn("google", {
                callbackUrl: "/workspace",
                redirect: false,
              });
              if (result?.error) setError("Google sign-in failed. Please try again.");
            } catch {
              setError("Something went wrong. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg bg-surface-2 border border-border text-sm font-semibold text-content hover:bg-surface-3 mb-3 disabled:opacity-50 transition-colors"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-[10px] text-content-subtle uppercase">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email) return;
            setIsLoading(true);
            setError("");
            setMagicLinkSent(false);
            try {
              const result = await signIn("email", {
                email,
                callbackUrl: "/workspace",
                redirect: false,
              });
              if (result?.error) {
                setError("Failed to send magic link. Please check your email and try again.");
              } else {
                // FIX P0: Show confirmation message
                setMagicLinkSent(true);
              }
            } catch {
              setError("Something went wrong. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          {/* FIX P0: Proper label with htmlFor + autoFocus */}
          <label htmlFor="login-email" className="sr-only">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            autoComplete="email"
            aria-describedby={error ? "login-error" : undefined}
            className="w-full py-3 px-4 rounded-lg bg-surface text-content border border-border text-sm mb-3 focus:border-brand focus:outline-none transition-colors"
            required
          />

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 px-4 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <p className="text-[11px] text-content-subtle text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
