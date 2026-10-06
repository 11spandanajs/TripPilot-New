import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage(
          "This password reset link is invalid or has expired. Please request a new one.",
        );
      }

      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      setErrorMessage(
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Your password has been updated successfully. Redirecting to login...",
      );

      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      console.error("Password update error:", error);

      setErrorMessage(
        "Something went wrong. Please try again.",
      );

      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="mt-4 text-sm text-slate-500">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

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
                  Secure your account
                </p>

                <h1 className="text-4xl font-bold leading-tight">
                  Choose a new
                  <br />
                  password.
                </h1>

                <p className="mt-6 max-w-md leading-7 text-slate-400">
                  Create a new password for your TripPilot
                  account and get back to planning your next
                  adventure.
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
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>

            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-slate-900">
                Reset your password
              </h2>

              <p className="mt-2 text-slate-500">
                Enter and confirm your new password below.
              </p>

              {/* INVALID SESSION */}
              {errorMessage &&
                errorMessage.includes("invalid or has expired") && (
                  <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3 text-sm text-red-700">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <p>{errorMessage}</p>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="mt-4 inline-block text-sm font-semibold text-red-700 underline"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                )}

              {/* FORM */}
              {!errorMessage.includes(
                "invalid or has expired",
              ) && (
                <form
                  onSubmit={handlePasswordReset}
                  className="mt-8"
                >
                  {/* NEW PASSWORD */}
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New password
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                    <Lock
                      size={18}
                      className="shrink-0 text-slate-400"
                    />

                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      placeholder="Create a new password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="w-full bg-transparent py-3.5 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Password must contain at least 6 characters.
                  </p>

                  {/* CONFIRM PASSWORD */}
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
                  >
                    Confirm new password
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                    <Lock
                      size={18}
                      className="shrink-0 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Enter your new password again"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="w-full bg-transparent py-3.5 outline-none"
                    />
                  </div>

                  {/* ERROR */}
                  {errorMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <p>{errorMessage}</p>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {successMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      <CheckCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <p>{successMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Updating password..."
                      : "Update Password"}
                  </button>
                </form>
              )}

              <p className="mt-7 text-center text-sm text-slate-500">
                Remember your password?{" "}

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

export default ResetPassword;