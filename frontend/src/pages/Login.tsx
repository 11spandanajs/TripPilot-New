import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        "Something went wrong. Please try again.",
      );

      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);

      setErrorMessage(
        "Unable to continue with Google. Please try again.",
      );

      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link
                to="/"
                className="flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                  <Compass size={22} />
                </div>

                <span className="text-xl font-bold">
                  TripPilot
                </span>
              </Link>

              <div className="mt-24">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-400">
                  Welcome back
                </p>

                <h1 className="text-4xl font-bold leading-tight">
                  Your next
                  <br />
                  adventure awaits.
                </h1>

                <p className="mt-6 max-w-md leading-7 text-slate-400">
                  Sign in to access your trips, itineraries,
                  favorite destinations and travel plans.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Your AI-powered travel companion.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-8 sm:p-12">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-500">
                Sign in to continue planning your adventures.
              </p>

              {/* GOOGLE LOGIN */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-lg font-bold">
                  G
                </span>

                {googleLoading
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </button>

              {/* DIVIDER */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-sm text-slate-400">
                  or
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* EMAIL LOGIN FORM */}
              <form onSubmit={handleLogin}>

                {/* EMAIL */}
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <Mail
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent py-3.5 outline-none"
                  />
                </div>

                {/* PASSWORD */}
                <label
                  htmlFor="password"
                  className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <Lock
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent py-3.5 outline-none"
                  />
                </div>

                {/* FORGOT PASSWORD */}
                <div className="mt-3 text-right">
                 <Link
  to="/forgot-password"
  className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
>
  Forgot password?
</Link>
                </div>

                {/* ERROR MESSAGE */}
                {errorMessage && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* SIGN IN BUTTON */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </button>
              </form>

              {/* SIGNUP LINK */}
              <p className="mt-7 text-center text-sm text-slate-500">
                Don't have an account?{" "}

                <Link
                  to="/signup"
                  className="font-semibold text-sky-600 hover:text-sky-700"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;