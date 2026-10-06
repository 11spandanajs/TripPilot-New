import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  LogOut,
  User,
  MapPin,
  CalendarDays,
  Heart,
  ArrowRight,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Trip = {
  id: string;
  title: string | null;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number | null;
  currency: string;
  travel_type: string | null;
  status: string;
  created_at: string;
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  const loadTrips = async (userId: string) => {
    setTripsLoading(true);

    const { data, error } = await supabase
      .from("trips")
      .select(
        `
        id,
        title,
        destination,
        start_date,
        end_date,
        travelers,
        budget,
        currency,
        travel_type,
        status,
        created_at
        `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading trips:", error);
      setTrips([]);
    } else {
      setTrips(data ?? []);
    }

    setTripsLoading(false);
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      await loadTrips(user.id);

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          navigate("/login");
          return;
        }

        setUser(session.user);
        loadTrips(session.user.id);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Traveler";

  const email = user?.email || "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Compass size={22} />
            </div>

            <span className="text-xl font-bold text-slate-900">
              TripPilot
            </span>
          </button>

          {/* USER AREA */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {fullName}
              </p>

              <p className="text-xs text-slate-500">
                {email}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <User size={20} />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={17} />

              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* WELCOME */}
        <section className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Your travel dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome, {fullName}! 👋
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Your next adventure starts here. Create a trip,
            explore destinations and let TripPilot help you
            plan your journey.
          </p>

          <button
            type="button"
            onClick={() => navigate("/plan-trip")}
            className="mt-7 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Plan a New Trip
          </button>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => navigate("/plan-trip")}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <MapPin size={22} />
            </div>

            <h2 className="mt-5 font-bold text-slate-900">
              Plan a Trip
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a personalized travel itinerary.
            </p>
          </button>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <CalendarDays size={22} />
            </div>

            <h2 className="mt-5 font-bold text-slate-900">
              My Trips
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {tripsLoading
                ? "Loading your trips..."
                : `${trips.length} saved trip${
                    trips.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Heart size={22} />
            </div>

            <h2 className="mt-5 font-bold text-slate-900">
              Favorites
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Save destinations and places you love.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <User size={22} />
            </div>

            <h2 className="mt-5 font-bold text-slate-900">
              Profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage your TripPilot account.
            </p>
          </div>
        </section>

        {/* SAVED TRIPS */}
        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
                Your trips
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Saved adventures
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/plan-trip")}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + New Trip
            </button>
          </div>

          {/* LOADING */}
          {tripsLoading ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

              <p className="mt-3 text-sm text-slate-500">
                Loading your trips...
              </p>
            </div>
          ) : trips.length === 0 ? (
            /* EMPTY */
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <MapPin
                size={32}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 font-bold text-slate-900">
                No trips yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Start planning your first adventure.
              </p>

              <button
                type="button"
                onClick={() => navigate("/plan-trip")}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Plan Your First Trip
              </button>
            </div>
          ) : (
            /* TRIP CARDS */
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
                >
                  {/* IMAGE */}
                  <div className="h-32 bg-gradient-to-br from-sky-100 via-blue-50 to-purple-100">
                    <div className="flex h-full items-center justify-center">
                      <MapPin
                        size={36}
                        className="text-sky-600 transition group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* INFORMATION */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {trip.title ||
                            `${trip.destination} Trip`}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin size={14} />
                          {trip.destination}
                        </p>
                      </div>

                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold capitalize text-sky-700">
                        {trip.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Start date
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {trip.start_date
                            ? new Date(
                                `${trip.start_date}T00:00:00`,
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Not set"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Travelers
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {trip.travelers}
                        </p>
                      </div>
                    </div>

                    {trip.travel_type && (
                      <p className="mt-4 text-sm text-slate-500">
                        Travel style:{" "}
                        <span className="font-semibold text-slate-700">
                          {trip.travel_type}
                        </span>
                      </p>
                    )}

                    {trip.budget !== null && (
                      <p className="mt-2 text-sm font-medium text-slate-600">
                        Budget: {trip.currency}{" "}
                        {Number(
                          trip.budget,
                        ).toLocaleString("en-IN")}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-semibold text-slate-400">
                        View trip details
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-sky-600 group-hover:text-white">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;