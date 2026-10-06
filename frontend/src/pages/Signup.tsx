import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  User,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Account created successfully! Please check your email to verify your account.",
      );

      setLoading(false);

      // Go to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      console.error("Signup error:", error);

      setErrorMessage(
        "Something went wrong. Please try again.",
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                  <Compass size={22} />
                </div>

                <span className="text-xl font-bold">
                  TripPilot
                </span>
              </Link>

              {/* Content */}
              <div className="mt-24">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-400">
                  Start exploring
                </p>

                <h1 className="text-4xl font-bold leading-tight">
                  Plan smarter.
                  <br />
                  Travel better.
                </h1>

                <p className="mt-6 max-w-md leading-7 text-slate-400">
                  Create your TripPilot account and keep all your
                  travel plans, itineraries and favorite destinations
                  in one place.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Your AI-powered travel companion.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-8 sm:p-12">
            {/* Back button */}
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="max-w-md">
              {/* Heading */}
              <h2 className="text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-slate-500">
                Start planning your next adventure with TripPilot.
              </p>

              {/* GOOGLE BUTTON */}
              <button
                type="button"
                disabled
                className="mt-7 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-400"
              >
                <span className="text-lg font-bold">G</span>
                Continue with Google
              </button>

              <p className="mt-2 text-center text-xs text-slate-400">
                Google sign-in will be enabled in the next step.
              </p>

              {/* DIVIDER */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-sm text-slate-400">
                  or
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* FORM */}
              <form onSubmit={handleSignup}>

                {/* FULL NAME */}
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <User
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="w-full bg-transparent py-3.5 outline-none"
                  />
                </div>

                {/* EMAIL */}
                <label
                  htmlFor="email"
                  className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
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
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full bg-transparent py-3.5 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Password must contain at least 6 characters.
                </p>

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

                {/* SUCCESS MESSAGE */}
                {successMessage && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <p>{successMessage}</p>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </button>
              </form>

              {/* LOGIN LINK */}
              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-sky-600 hover:text-sky-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;