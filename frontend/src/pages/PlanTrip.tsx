import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  Search,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type DestinationResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

function PlanTrip() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  const [destinationResults, setDestinationResults] = useState<
    DestinationResult[]
  >([]);

  const [selectedDestination, setSelectedDestination] =
    useState<DestinationResult | null>(null);

  const [searchingDestination, setSearchingDestination] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const travelStyles = [
    "Solo",
    "Couple",
    "Family",
    "Friends",
    "Business",
  ];

  const searchDestination = async () => {
    const query = destination.trim();

    if (!query) {
      setDestinationResults([]);
      setSelectedDestination(null);
      return;
    }

    setSearchingDestination(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Destination search failed.");
      }

      const data = (await response.json()) as DestinationResult[];

      setDestinationResults(data);

      if (data.length === 0) {
        setErrorMessage(
          "No matching destinations found. Try another search.",
        );
      }
    } catch (error) {
      console.error("Destination search error:", error);

      setErrorMessage(
        "Unable to search destinations right now. Please try again.",
      );
    } finally {
      setSearchingDestination(false);
    }
  };

  const handleSelectDestination = (
    result: DestinationResult,
  ) => {
    setSelectedDestination(result);
    setDestination(
      result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        result.display_name.split(",")[0],
    );
    setDestinationResults([]);
    setErrorMessage("");
  };

  const handleGenerateTrip = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!destination.trim()) {
      setErrorMessage("Please enter a destination.");
      return;
    }

    if (!selectedDestination) {
      setErrorMessage(
        "Please search and select a destination from the list.",
      );
      return;
    }

    if (!startDate) {
      setErrorMessage("Please select a start date.");
      return;
    }

    if (travelers < 1) {
      setErrorMessage("Travelers must be at least 1.");
      return;
    }

    if (days < 1) {
      setErrorMessage("Number of days must be at least 1.");
      return;
    }

    if (!travelStyle) {
      setErrorMessage("Please select a travel style.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Please log in before creating a trip.");
        setLoading(false);
        return;
      }

      const city =
        selectedDestination.address?.city ||
        selectedDestination.address?.town ||
        selectedDestination.address?.village ||
        destination.trim();

      const country =
        selectedDestination.address?.country || "";

      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          title: `${city} Trip`,
          destination: city,
          start_date: startDate,
          travelers,
          budget: budget ? Number(budget) : null,
          currency: "INR",
          travel_type: travelStyle,

          preferences: {
            days,

            destination_location: {
              display_name:
                selectedDestination.display_name,

              city,

              state:
                selectedDestination.address?.state || null,

              country,

              country_code:
                selectedDestination.address?.country_code ||
                null,

              latitude: Number(selectedDestination.lat),

              longitude: Number(selectedDestination.lon),

              place_id: selectedDestination.place_id,
            },
          },

          status: "planning",
        })
        .select()
        .single();

      if (tripError) {
        console.error(
          "Trip creation error:",
          tripError,
        );

        setErrorMessage(tripError.message);
        setLoading(false);
        return;
      }

      const tripDays = Array.from(
        { length: days },
        (_, index) => {
          const dayNumber = index + 1;

          const date = new Date(startDate);

          date.setDate(
            date.getDate() + index,
          );

          return {
            trip_id: trip.id,
            day_number: dayNumber,
            date: date
              .toISOString()
              .split("T")[0],
            title: `Day ${dayNumber}`,
            notes: null,
          };
        },
      );

      const { error: daysError } =
        await supabase
          .from("trip_days")
          .insert(tripDays);

      if (daysError) {
        console.error(
          "Trip days creation error:",
          daysError,
        );

        setErrorMessage(
          "Trip was saved, but we could not create the trip days.",
        );

        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Your trip has been saved successfully! 🎉",
      );

      setLoading(false);
    } catch (error) {
      console.error(
        "Unexpected trip creation error:",
        error,
      );

      setErrorMessage(
        "Something went wrong while creating your trip.",
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Compass size={22} />
            </div>

            <span className="text-xl font-bold">
              TripPilot
            </span>
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-sky-600">
              Plan your trip
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Where are you going?
            </h1>

            <p className="mt-3 text-slate-500">
              Tell us a little about your trip and
              TripPilot will create your personalized
              travel plan.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* DESTINATION */}
            <div className="md:col-span-2">
              <label
                htmlFor="destination"
                className="mb-2 block text-sm font-semibold"
              >
                Destination
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <MapPin
                  size={18}
                  className="text-slate-400"
                />

                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(event) => {
                    setDestination(
                      event.target.value,
                    );
                    setSelectedDestination(null);
                    setDestinationResults([]);
                    setErrorMessage("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchDestination();
                    }
                  }}
                  placeholder="e.g. Goa, Manali, Bali"
                  className="w-full py-4 outline-none"
                />

                <button
                  type="button"
                  onClick={searchDestination}
                  disabled={
                    searchingDestination ||
                    !destination.trim()
                  }
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search size={16} />

                  {searchingDestination
                    ? "Searching..."
                    : "Search"}
                </button>
              </div>

              {/* SEARCH RESULTS */}
              {destinationResults.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {destinationResults.map(
                    (result) => {
                      const city =
                        result.address?.city ||
                        result.address?.town ||
                        result.address?.village ||
                        "";

                      const country =
                        result.address?.country ||
                        "";

                      return (
                        <button
                          key={result.place_id}
                          type="button"
                          onClick={() =>
                            handleSelectDestination(
                              result,
                            )
                          }
                          className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-sky-50"
                        >
                          <MapPin
                            size={18}
                            className="mt-1 shrink-0 text-sky-600"
                          />

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {city ||
                                result.display_name.split(
                                  ",",
                                )[0]}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {result.display_name}
                            </p>

                            {country && (
                              <p className="mt-1 text-xs text-slate-400">
                                {country}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}

              {/* SELECTED DESTINATION */}
              {selectedDestination && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check
                      size={17}
                      className="text-green-700"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Destination selected
                    </p>

                    <p className="text-sm text-green-700">
                      {
                        selectedDestination.display_name
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* DATE */}
            <div>
              <label
                htmlFor="start-date"
                className="mb-2 block text-sm font-semibold"
              >
                Start date
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <CalendarDays
                  size={18}
                  className="text-slate-400"
                />

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(
                      event.target.value,
                    )
                  }
                  className="w-full py-4 outline-none"
                />
              </div>
            </div>

            {/* TRAVELERS */}
            <div>
              <label
                htmlFor="travelers"
                className="mb-2 block text-sm font-semibold"
              >
                Travelers
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <Users
                  size={18}
                  className="text-slate-400"
                />

                <input
                  id="travelers"
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(event) =>
                    setTravelers(
                      Number(event.target.value),
                    )
                  }
                  className="w-full py-4 outline-none"
                />
              </div>
            </div>

            {/* DAYS */}
            <div>
              <label
                htmlFor="days"
                className="mb-2 block text-sm font-semibold"
              >
                Number of days
              </label>

              <input
                id="days"
                type="number"
                min="1"
                value={days}
                onChange={(event) =>
                  setDays(
                    Number(event.target.value),
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-sky-500"
              />
            </div>

            {/* BUDGET */}
            <div>
              <label
                htmlFor="budget"
                className="mb-2 block text-sm font-semibold"
              >
                Budget
              </label>

              <input
                id="budget"
                type="number"
                min="0"
                value={budget}
                onChange={(event) =>
                  setBudget(event.target.value)
                }
                placeholder="₹ 40,000"
                className="w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* TRAVEL STYLE */}
          <div className="mt-8">
            <label className="mb-3 block text-sm font-semibold">
              Travel style
            </label>

            <div className="flex flex-wrap gap-3">
              {travelStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() =>
                    setTravelStyle(style)
                  }
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                    travelStyle === style
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 hover:border-sky-500 hover:bg-sky-50"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* GENERATE */}
          <button
            type="button"
            onClick={handleGenerateTrip}
            disabled={loading}
            className="mt-10 w-full rounded-xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Saving your trip..."
              : "Generate My Trip"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default PlanTrip;