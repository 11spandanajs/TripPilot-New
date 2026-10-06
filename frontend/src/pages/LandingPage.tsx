import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CloudSun,
  Compass,
  Map,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";

function LandingPage() {
  const destinations = [
    {
      name: "Goa",
      location: "India",
      description: "Beaches, sunsets & unforgettable escapes",
      image:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "Manali",
      location: "India",
      description: "Mountains, snow & peaceful adventures",
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "Bali",
      location: "Indonesia",
      description: "Tropical beauty, culture & relaxation",
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "Paris",
      location: "France",
      description: "Art, architecture & unforgettable moments",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI Trip Planner",
      description:
        "Create personalized day-by-day itineraries based on your interests, budget and travel style.",
    },
    {
      icon: CloudSun,
      title: "Smart Weather",
      description:
        "Check current and upcoming weather so your plans can adapt to the conditions.",
    },
    {
      icon: Map,
      title: "Explore on Map",
      description:
        "Discover attractions, restaurants, hotels and useful places around your destination.",
    },
    {
      icon: Wallet,
      title: "Budget Planner",
      description:
        "Organize your estimated expenses and keep your entire trip within your budget.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: MapPin,
      title: "Choose a destination",
      description:
        "Tell TripPilot where you want to go and what kind of experience you want.",
    },
    {
      number: "02",
      icon: CalendarDays,
      title: "Customize your trip",
      description:
        "Set dates, travelers, budget, interests and your preferred travel style.",
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Get your plan",
      description:
        "TripPilot creates a personalized itinerary designed around your journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* NAVBAR */}
      <header className="absolute left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-slate-950/40 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                <Compass size={22} />
              </div>

              <div>
                <p className="text-lg font-bold leading-none text-white">
                  TripPilot
                </p>

                <p className="mt-1 hidden text-[10px] text-white/60 sm:block">
                  Your AI-powered travel companion
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              <a
                href="#features"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Features
              </a>

              <a
                href="#destinations"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Destinations
              </a>

              <a
                href="#how-it-works"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                How it works
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:block"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Get Started
              </Link>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[750px] overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=90"
            alt="Mountain travel destination"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/55" />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/10" />

          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[750px] max-w-7xl items-center px-5 pb-28 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <Sparkles size={15} className="text-sky-300" />
              AI-powered travel planning
            </div>

            <h1 className="mt-7 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your journey.
              <br />

              <span className="text-sky-300">
                Perfectly planned.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              Plan smarter, discover more and travel with
              confidence. TripPilot brings AI itineraries,
              weather, maps, places and budget planning into one
              simple travel companion.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/plan-trip"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl transition hover:bg-slate-100"
              >
                Start Planning
                <ArrowRight size={18} />
              </Link>

              <a
                href="#destinations"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Explore destinations
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-300" />
                Personalized itineraries
              </div>

              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-300" />
                Smart trip planning
              </div>

              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-300" />
                Built for travelers
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="absolute bottom-8 left-1/2 w-[calc(100%-2.5rem)] max-w-5xl -translate-x-1/2 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <div className="rounded-2xl border border-white/20 bg-white p-3 shadow-2xl">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <MapPin size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Where are you going?
                  </p>

                  <p className="truncate text-sm font-semibold text-slate-800">
                    Choose your next destination
                  </p>
                </div>

                <Search
                  size={19}
                  className="ml-auto hidden text-slate-400 sm:block"
                />
              </div>

              <Link
                to="/plan-trip"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Plan My Trip
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

  

      {/* FEATURES */}
      <section
        id="features"
        className="bg-slate-50 px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Travel planning, simplified.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              From the first destination search to the final
              itinerary, TripPilot keeps your journey organized.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="flex min-h-[255px] flex-col rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-sky-600">
                    Explore feature
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section
        id="destinations"
        className="bg-white px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                Get inspired
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Where will you go next?
              </h2>

              <p className="mt-3 max-w-2xl text-base text-slate-500">
                Explore popular destinations and start building
                your next adventure.
              </p>
            </div>

            <Link
              to="/plan-trip"
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 transition hover:text-sky-700"
            >
              Plan a trip
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* DESTINATION GRID */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.name}
                to="/plan-trip"
                className="group flex h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE — GUARANTEED HEIGHT */}
                <div className="relative h-[270px] w-full shrink-0 overflow-hidden bg-slate-200">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="block h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                      <MapPin size={13} />
                      {destination.location}
                    </div>

                    <h3 className="mt-1 text-2xl font-bold text-white">
                      {destination.name}
                    </h3>
                  </div>
                </div>

                {/* TEXT — GUARANTEED HEIGHT */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="text-sm leading-6 text-slate-500">
                    {destination.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Explore trip
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-sky-600 group-hover:text-white">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-slate-50 px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              From idea to itinerary
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              Plan your next adventure in just a few simple
              steps.
            </p>
          </div>

          <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="flex min-h-[270px] flex-col rounded-2xl border border-slate-200 bg-white p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Icon size={22} />
                    </div>

                    <span className="text-4xl font-black text-slate-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SMART TRAVEL */}
      <section className="bg-white px-5 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
              Built around your journey
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Your trip should feel personal.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
              TripPilot takes your destination, dates, budget,
              travelers and interests into account to help you
              build a trip that actually fits you.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Personalized itinerary planning",
                "Destination weather information",
                "Places and attractions discovery",
                "Budget-conscious travel planning",
                "Interactive maps and trip organization",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={14} />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/plan-trip"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Build My Trip
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85"
                alt="Travel landscape"
                className="h-[500px] w-full object-cover"
              />

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <CloudSun size={23} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Smart weather
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Plan around the forecast
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute right-6 top-6 hidden rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Map size={20} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Explore
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Places nearby
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                One place for your trip
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Keep your travel plans organized in one
                dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
              <Star size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Personalized experiences
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Build trips around your interests and travel
                style.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <Compass size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Travel with confidence
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Get the information you need before and during
                your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-20 sm:px-6 lg:py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-950 px-7 py-16 text-center sm:px-12">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
              <Compass size={27} />
            </div>

            <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
              Ready to plan your next adventure?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Tell TripPilot where you want to go. We'll help
              you organize the journey.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Start Planning for Free
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-5 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Compass size={18} />
            </div>

            <div>
              <p className="font-bold text-slate-950">
                TripPilot
              </p>

              <p className="text-xs text-slate-400">
                Your AI-powered travel companion
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>

            <a
              href="#destinations"
              className="hover:text-slate-900"
            >
              Destinations
            </a>

            <a
              href="#how-it-works"
              className="hover:text-slate-900"
            >
              How it works
            </a>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 TripPilot
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;