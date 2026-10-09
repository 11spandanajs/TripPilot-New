
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BudgetPlanner from "../components/BudgetPlanner";
import FavoritePlaces from "../components/FavoritePlaces";
import type { Place } from "../components/TripMap";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Cloud,
  CloudRain,
  CloudSun,
  Coffee,
  Compass,
  Hotel,
  IndianRupee,
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  Sun,
  Users,
  Wallet,
  Wind,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import TripMap from "../components/TripMap";

type AnyRecord = Record<string, any>;

type WeatherData = {
  destination?: string;
  latitude?: number;
  longitude?: number;
  current?: AnyRecord;
  daily?: AnyRecord;
};

type ItineraryItem = {
  name?: string | null;
  title?: string | null;
  type?: string | null;
  place_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  opening_hours?: string | null;
  website?: string | null;
  phone?: string | null;
  start_time?: string | null;
  duration_minutes?: number | null;
  travel_distance_km?: number | null;
  travel_time_minutes?: number | null;
  estimated_cost?: number | null;
  cost_is_estimate?: boolean;
  cost_known?: boolean;
  cost_label?: string | null;
  cost_min?: number | null;
  cost_max?: number | null;
  cost_basis?: string | null;
  reason?: string | null;
};

type ItinerarySection = {
  period?: string | null;
  icon?: string | null;
  items?: ItineraryItem[];
};

type ItineraryDay = {
  day?: number | null;
  title?: string | null;
  sections?: ItinerarySection[];
  activities?: ItineraryItem[];
  activity_count?: number | null;
  estimated_cost?: number | null;
  estimated_distance_km?: number | null;
  estimated_travel_minutes?: number | null;
};

type BudgetSummary = {
  budget_provided?: boolean;
  total_budget?: number | null;
  estimated_total?: number | null;
  estimated_min?: number | null;
  estimated_max?: number | null;
  remaining?: number | null;
  within_budget?: boolean | null;
  message?: string | null;
  costs_complete?: boolean;
  unknown_cost_items?: string[];
};

type Accommodation = {
  cost_label?: string | null;
  cost_basis?: string | null;
  total_min?: number | null;
  total_max?: number | null;
  nights?: number | null;
  rooms?: number | null;
  estimated_total?: number | null;
};

type ItineraryResponse = {
  itinerary?: ItineraryDay[];
  budget_summary?: BudgetSummary;
  planning_notes?: string[];
  accommodation?: Accommodation;
  budget_level?: string;
};

type Trip = {
  id: string;
  user_id: string;
  title?: string | null;
  destination: string;
  country?: string | null;
  start_date?: string | null;
  travelers?: number | null;
  budget?: number | null;
  currency?: string | null;
  travel_type?: string | null;
  status?: string | null;
  preferences?: AnyRecord | null;
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "Date not set";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Price not available";
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatNumber(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return value.toFixed(digits);
}

function getActivityName(item: ItineraryItem) {
  return item.name?.trim() || item.title?.trim() || "Planned activity";
}

function getWeatherIcon(description?: string) {
  const text = (description ?? "").toLowerCase();

  if (
    text.includes("rain") ||
    text.includes("drizzle") ||
    text.includes("shower")
  ) {
    return <CloudRain className="h-5 w-5" />;
  }

  if (text.includes("cloud") || text.includes("overcast")) {
    return <Cloud className="h-5 w-5" />;
  }

  if (text.includes("partly") || text.includes("few")) {
    return <CloudSun className="h-5 w-5" />;
  }

  return <Sun className="h-5 w-5" />;
}

function getSectionIcon(period?: string | null) {
  const value = (period ?? "").toLowerCase();

  if (value.includes("morning")) return <Sun className="h-5 w-5" />;
  if (value.includes("afternoon")) return <CloudSun className="h-5 w-5" />;
  if (value.includes("evening")) return <Sun className="h-5 w-5" />;

  if (value.includes("night") || value.includes("dinner")) {
    return <Coffee className="h-5 w-5" />;
  }

  return <Compass className="h-5 w-5" />;
}

function getCostDisplay(item: ItineraryItem) {
  const label = item.cost_label?.trim();

  if (label) return label;
  if (item.cost_known === false) return "Price not available";

  if (
    item.cost_min !== null &&
    item.cost_min !== undefined &&
    item.cost_max !== null &&
    item.cost_max !== undefined
  ) {
    if (item.cost_min === item.cost_max) {
      return formatCurrency(item.cost_min);
    }

    return `${formatCurrency(item.cost_min)}–${formatCurrency(item.cost_max)}`;
  }

  if (
    item.estimated_cost !== null &&
    item.estimated_cost !== undefined &&
    item.estimated_cost > 0
  ) {
    return `Approx. ${formatCurrency(item.estimated_cost)}`;
  }

  return "Price not available";
}

function getCostExplanation(item: ItineraryItem) {
  if (item.cost_basis) return item.cost_basis;
  if (item.cost_is_estimate) return "Approximate planning estimate";

  if (item.cost_known === false) {
    return "Ticket price not available in the current place data";
  }

  return null;
}

function isMeal(item: ItineraryItem) {
  const text = `${item.type ?? ""} ${item.place_type ?? ""} ${item.name ?? ""}`.toLowerCase();

  return (
    text.includes("restaurant") ||
    text.includes("cafe") ||
    text.includes("food") ||
    text.includes("lunch") ||
    text.includes("dinner") ||
    text.includes("breakfast")
  );
}

function isAccommodation(item: ItineraryItem) {
  const text = `${item.type ?? ""} ${item.place_type ?? ""} ${item.name ?? ""}`.toLowerCase();

  return (
    text.includes("hotel") ||
    text.includes("accommodation") ||
    text.includes("resort")
  );
}

function getItemType(item: ItineraryItem) {
  if (isMeal(item)) return "Meal";
  if (isAccommodation(item)) return "Accommodation";

  return item.type || item.place_type || "Experience";
}

function getInitials(text?: string | null) {
  if (!text) return "TP";

  return text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function WeatherCard({ weather }: { weather: WeatherData | null }) {
  if (!weather) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <Cloud className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Weather</p>
            <p className="text-sm text-slate-500">
              Weather information is not available yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const current = weather.current ?? {};
  const daily = weather.daily ?? {};

  const temperature =
    current.temperature_2m ??
    current.temperature ??
    current.apparent_temperature;

  const weatherDescription =
    current.weather_description ??
    current.description ??
    current.weather;

  const humidity = current.relative_humidity_2m ?? current.humidity;
  const wind = current.wind_speed_10m ?? current.wind_speed;

  const dates: string[] = Array.isArray(daily.time) ? daily.time : [];
  const maxTemps: any[] = Array.isArray(daily.temperature_2m_max)
    ? daily.temperature_2m_max
    : [];
  const minTemps: any[] = Array.isArray(daily.temperature_2m_min)
    ? daily.temperature_2m_min
    : [];
  const descriptions: any[] = Array.isArray(daily.weather_description)
    ? daily.weather_description
    : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Weather</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">
            {weather.destination ?? "Your destination"}
          </h3>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          {getWeatherIcon(weatherDescription)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Now
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {temperature !== undefined && temperature !== null
              ? `${Math.round(temperature)}°`
              : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {weatherDescription ?? "Current conditions"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Humidity
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {humidity !== undefined && humidity !== null
              ? `${Math.round(humidity)}%`
              : "—"}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Cloud className="h-4 w-4" />
            Comfortable planning view
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Wind
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {wind !== undefined && wind !== null
              ? `${Math.round(wind)} km/h`
              : "—"}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Wind className="h-4 w-4" />
            Current wind
          </div>
        </div>
      </div>

      {dates.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">Forecast</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {dates.slice(0, 7).map((date, index) => {
              const dateObject = new Date(`${date}T00:00:00`);

              const label = Number.isNaN(dateObject.getTime())
                ? date
                : dateObject.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                  });

              const max = maxTemps[index];
              const min = minTemps[index];
              const description = descriptions[index];

              return (
                <div
                  key={`forecast-${date}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <p className="text-xs font-semibold text-slate-600">{label}</p>
                  <div className="my-3 text-blue-600">
                    {getWeatherIcon(description)}
                  </div>
                  <p className="text-sm font-bold text-slate-950">
                    {max !== undefined ? `${Math.round(max)}°` : "—"}
                  </p>
                  {min !== undefined && (
                    <p className="text-xs text-slate-500">
                      {Math.round(min)}° low
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({
  item,
  index,
}: {
  item: ItineraryItem;
  index: number;
}) {
  const name = getActivityName(item);
  const type = getItemType(item);
  const cost = getCostDisplay(item);
  const costExplanation = getCostExplanation(item);

  const duration =
    item.duration_minutes !== null && item.duration_minutes !== undefined
      ? `${item.duration_minutes} min`
      : null;

  const distance =
    item.travel_distance_km !== null && item.travel_distance_km !== undefined
      ? `${formatNumber(item.travel_distance_km)} km`
      : null;

  const travelTime =
    item.travel_time_minutes !== null && item.travel_time_minutes !== undefined
      ? `${Math.round(item.travel_time_minutes)} min travel`
      : null;

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
            {index + 1}
          </div>
          <div className="mt-2 h-full w-px bg-slate-200" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {item.start_time && (
                <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <Clock3 className="h-4 w-4" />
                  {item.start_time}
                </p>
              )}
              <h4 className="text-lg font-bold text-slate-950">{name}</h4>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {type}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
              <p className="flex items-center justify-end gap-1 text-sm font-bold text-slate-900">
                <IndianRupee className="h-3.5 w-3.5" />
                {cost.replace(/^₹/, "")}
              </p>
              {costExplanation && (
                <p className="mt-1 max-w-[180px] text-[11px] leading-4 text-slate-500">
                  {costExplanation}
                </p>
              )}
            </div>
          </div>

          {item.reason && (
            <p className="mt-4 text-sm leading-6 text-slate-600">{item.reason}</p>
          )}

          {item.address && (
            <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{item.address}</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Clock3 className="h-3.5 w-3.5" />
                {duration}
              </span>
            )}
            {distance && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Navigation className="h-3.5 w-3.5" />
                {distance}
              </span>
            )}
            {travelTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Car className="h-3.5 w-3.5" />
                {travelTime}
              </span>
            )}
          </div>

          {item.opening_hours && (
            <div className="mt-3 text-xs text-slate-500">
              <span className="font-semibold">Hours:</span> {item.opening_hours}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  sectionIndex,
}: {
  section: ItinerarySection;
  sectionIndex: number;
}) {
  const [open, setOpen] = useState(true);
  const items = Array.isArray(section.items) ? section.items : [];
  const period = section.period?.trim() || "Plan";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
            {getSectionIcon(period)}
          </div>
          <div>
            <h4 className="font-bold text-slate-950">{period}</h4>
            <p className="text-sm text-slate-500">
              {items.length} {items.length === 1 ? "activity" : "activities"}
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4 sm:px-5">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">
              No activities planned for this period.
            </div>
          ) : (
            items.map((item, itemIndex) => (
              <ActivityCard
                key={`section-${sectionIndex}-item-${itemIndex}`}
                item={item}
                index={itemIndex}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DayPlan({
  day,
  dayIndex,
}: {
  day: ItineraryDay;
  dayIndex: number;
}) {
  const [open, setOpen] = useState(true);
  const dayNumber = day.day ?? dayIndex + 1;
  const title = day.title?.trim() || `Day ${dayNumber}`;
  const sections = Array.isArray(day.sections) ? day.sections : [];
  const activities = Array.isArray(day.activities) ? day.activities : [];

  const totalActivities =
    day.activity_count ??
    (sections.length > 0
      ? sections.reduce(
          (total, section) => total + (section.items?.length ?? 0),
          0,
        )
      : activities.length);

  const totalDistance = day.estimated_distance_km;
  const travelMinutes = day.estimated_travel_minutes;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-950 px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-200">Day {dayNumber}</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight">{title}</h3>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
          >
            {open ? "Collapse" : "Expand"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
            {totalActivities} {totalActivities === 1 ? "activity" : "activities"}
          </span>
          {totalDistance !== null && totalDistance !== undefined && (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
              {formatNumber(totalDistance)} km route
            </span>
          )}
          {travelMinutes !== null && travelMinutes !== undefined && (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
              {Math.round(travelMinutes)} min travel
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="space-y-4 p-4 sm:p-6">
          {sections.length > 0 ? (
            sections.map((section, sectionIndex) => (
              <SectionBlock
                key={`day-${dayNumber}-section-${sectionIndex}`}
                section={section}
                sectionIndex={sectionIndex}
              />
            ))
          ) : activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((item, itemIndex) => (
                <ActivityCard
                  key={`day-${dayNumber}-activity-${itemIndex}`}
                  item={item}
                  index={itemIndex}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Compass className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">No activities available</p>
              <p className="mt-1 text-sm text-slate-500">
                Try generating the itinerary again.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function BudgetCard({ summary }: { summary: BudgetSummary | null }) {
  if (!summary) return null;

  const estimatedMin = summary.estimated_min;
  const estimatedMax = summary.estimated_max;
  const estimatedTotal = summary.estimated_total;

  const hasRange =
    estimatedMin !== null &&
    estimatedMin !== undefined &&
    estimatedMax !== null &&
    estimatedMax !== undefined;

  const budget = summary.total_budget;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Trip budget</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">Cost overview</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Estimated trip cost
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {hasRange
              ? `${formatCurrency(estimatedMin)}–${formatCurrency(estimatedMax)}`
              : estimatedTotal && estimatedTotal > 0
                ? `Approx. ${formatCurrency(estimatedTotal)}`
                : "Not available"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Based on the available attraction, meal and accommodation planning information.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Your budget
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {budget ? formatCurrency(budget) : "Not specified"}
          </p>
          {summary.within_budget !== null &&
            summary.within_budget !== undefined && (
              <div
                className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                  summary.within_budget ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {summary.within_budget
                  ? "Within planned budget"
                  : "May exceed planned budget"}
              </div>
            )}
        </div>
      </div>

      {summary.message && (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          {summary.message}
        </div>
      )}

      {summary.costs_complete === false && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Some attraction ticket prices are not available from the current place data,
          so they are not falsely counted as ₹0.
        </p>
      )}
    </div>
  );
}

function AccommodationCard({
  accommodation,
}: {
  accommodation: Accommodation | null;
}) {
  if (!accommodation) return null;

  const label =
    accommodation.cost_label ||
    (accommodation.total_min !== undefined &&
    accommodation.total_max !== undefined
      ? `${formatCurrency(accommodation.total_min)}–${formatCurrency(accommodation.total_max)}`
      : null);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
          <Hotel className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Accommodation</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">Planning estimate</h3>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-5">
        <p className="text-2xl font-bold text-slate-950">
          {label ?? "Price not available"}
        </p>
        {accommodation.cost_basis && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {accommodation.cost_basis}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {accommodation.nights !== undefined && accommodation.nights !== null && (
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              {accommodation.nights} {accommodation.nights === 1 ? "night" : "nights"}
            </span>
          )}
          {accommodation.rooms !== undefined && accommodation.rooms !== null && (
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              {accommodation.rooms} {accommodation.rooms === 1 ? "room" : "rooms"}
            </span>
          )}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Accommodation figures are planning ranges, not live hotel quotes.
        </p>
      </div>
    </div>
  );
}

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  // Favorites currently stay in memory. Persistence can be added later.
  const [favoritePlaces, setFavoritePlaces] = useState<Place[]>([]);

  const toggleFavoritePlace = (place: Place) => {
    setFavoritePlaces((current) => {
      const alreadySaved = current.some(
        (item) => String(item.id) === String(place.id),
      );

      if (alreadySaved) {
        return current.filter(
          (item) => String(item.id) !== String(place.id),
        );
      }

      return [...current, place];
    });
  };

  const removeFavoritePlace = (place: Place) => {
    setFavoritePlaces((current) =>
      current.filter((item) => String(item.id) !== String(place.id)),
    );
  };

  const loadWeather = async (currentTrip: Trip) => {
    try {
      setRefreshingWeather(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/weather?destination=${encodeURIComponent(
          currentTrip.destination,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          `Weather request failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as WeatherData;
      setWeather(data);
    } catch (err) {
      console.error("Weather loading error:", err);
    } finally {
      setRefreshingWeather(false);
    }
  };

  const loadItinerary = async (currentTrip: Trip) => {
    try {
      setGenerating(true);

      const preferences = currentTrip.preferences ?? {};
      const daysFromPreferences = Number(preferences.days ?? 0);

      const interests = Array.isArray(preferences.interests)
        ? preferences.interests
        : [];

      const pace =
        typeof preferences.pace === "string"
          ? preferences.pace
          : "balanced";

      // Reuse the exact destination coordinates selected during trip creation.
      const destinationLocation = preferences.destination_location ?? {};

      const latitude =
        typeof destinationLocation.latitude === "number"
          ? destinationLocation.latitude
          : null;

      const longitude =
        typeof destinationLocation.longitude === "number"
          ? destinationLocation.longitude
          : null;

      let days = daysFromPreferences;

      if (!days) {
        const { data: tripDays } = await supabase
          .from("trip_days")
          .select("day_number")
          .eq("trip_id", currentTrip.id)
          .order("day_number", { ascending: true });

        days = tripDays?.length ?? 1;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/itinerary/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: currentTrip.destination,
            latitude,
            longitude,
            start_date: currentTrip.start_date,
            days,
            travelers: currentTrip.travelers ?? 1,
            budget: currentTrip.budget ?? null,
            travel_type: currentTrip.travel_type ?? "Solo",
            interests,
            pace,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || `Itinerary request failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as ItineraryResponse;
      setItinerary(data);
      setError("");
    } catch (err: any) {
      console.error("Itinerary generation error:", err);
      setError(err?.message || "Unable to generate the itinerary.");
    } finally {
      setGenerating(false);
    }
  };

  const loadTrip = async () => {
    if (!tripId) {
      setError("Trip ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      const { data, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .eq("user_id", user.id)
        .single();

      if (tripError) throw tripError;

      const currentTrip = data as Trip;
      setTrip(currentTrip);

      await Promise.all([
        loadWeather(currentTrip),
        loadItinerary(currentTrip),
      ]);
    } catch (err: any) {
      console.error("Trip loading error:", err);
      setError(err?.message || "Unable to load this trip.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrip();
  }, [tripId]);

  const itineraryDays = useMemo(
    () => (Array.isArray(itinerary?.itinerary) ? itinerary.itinerary : []),
    [itinerary],
  );

  const totalActivities = useMemo(
    () =>
      itineraryDays.reduce(
        (total, day) =>
          total +
          (day.activity_count ??
            day.sections?.reduce(
              (sectionTotal, section) =>
                sectionTotal + (section.items?.length ?? 0),
              0,
            ) ??
            day.activities?.length ??
            0),
        0,
      ),
    [itineraryDays],
  );

  const preferences = trip?.preferences ?? {};
  const heroTitle = trip?.title?.trim() || `${trip?.destination ?? "Trip"} Trip`;
  const avatar = getInitials(trip?.destination);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-8 h-72 animate-pulse rounded-[2rem] bg-slate-200" />
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Compass className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-950">Trip not found</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This trip could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const mapLatitude = weather?.latitude;
  const mapLongitude = weather?.longitude;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
              {avatar}
            </div>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">
              TripPilot
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-900">Something needs attention</p>
              <p className="mt-1 text-sm text-amber-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setError("");
                void loadItinerary(trip);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {/* Trip overview */}
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                {trip.status ?? "Planning"}
              </span>
              {trip.travel_type && (
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  {trip.travel_type}
                </span>
              )}
            </div>

            <div className="mt-6 max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-medium text-blue-200">
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                {heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Your personalized travel plan with weather, routes, places, timing and
                realistic cost planning.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium">Start date</span>
                </div>
                <p className="mt-2 font-bold">{formatDate(trip.start_date)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Travelers</span>
                </div>
                <p className="mt-2 font-bold">{trip.travelers ?? 1}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-medium">Budget</span>
                </div>
                <p className="mt-2 font-bold">
                  {trip.budget ? formatCurrency(trip.budget) : "Not specified"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-medium">AI plan</span>
                </div>
                <p className="mt-2 font-bold">
                  {generating ? "Generating..." : `${totalActivities} activities`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick statistics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Itinerary
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {itineraryDays.length} {itineraryDays.length === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Places
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">{totalActivities}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Planning style
                </p>
                <p className="mt-1 text-xl font-bold capitalize text-slate-950">
                  {String(preferences.pace ?? "Balanced")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cost planning
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">Realistic ranges</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map, itinerary and sidebar */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="space-y-6">
            {mapLatitude !== undefined &&
              mapLatitude !== null &&
              mapLongitude !== undefined &&
              mapLongitude !== null && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex items-center justify-between px-2 pb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Explore the destination
                      </p>
                      <h2 className="text-xl font-bold text-slate-950">
                        Places around {trip.destination}
                      </h2>
                    </div>
                  </div>

                  <TripMap
                    latitude={mapLatitude}
                    longitude={mapLongitude}
                    destination={trip.destination}
                    country={trip.country ?? undefined}
                    favoriteIds={favoritePlaces.map((place) => String(place.id))}
                    onToggleFavorite={toggleFavoritePlace}
                  />
                </div>
              )}

            {/* Saved places */}
            <FavoritePlaces
              places={favoritePlaces}
              onRemove={removeFavoritePlace}
            />

            {/* Itinerary */}
            <div>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">AI travel manager</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Your day-by-day plan
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Activities are organized by time of day with travel distance,
                    duration, weather-aware planning and cost information where available.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={generating}
                  onClick={() => void loadItinerary(trip)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
                  {generating ? "Generating..." : "Regenerate plan"}
                </button>
              </div>

              {generating && itineraryDays.length === 0 && (
                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center">
                  <Sparkles className="mx-auto h-9 w-9 text-blue-600" />
                  <h3 className="mt-4 font-bold text-slate-950">Building your itinerary</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                    TripPilot is finding places, grouping nearby activities, checking
                    travel distances and preparing your daily route.
                  </p>
                </div>
              )}

              {!generating && itineraryDays.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Compass className="mx-auto h-10 w-10 text-slate-400" />
                  <h3 className="mt-4 text-lg font-bold text-slate-950">No itinerary yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Generate your itinerary to see a structured day-by-day travel plan.
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadItinerary(trip)}
                    className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Generate itinerary
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {itineraryDays.map((day, dayIndex) => (
                  <DayPlan
                    key={`itinerary-day-${dayIndex}`}
                    day={day}
                    dayIndex={dayIndex}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <WeatherCard weather={weather} />

            <BudgetCard summary={itinerary?.budget_summary ?? null} />

            <BudgetPlanner
              budget={trip.budget}
              days={itineraryDays.length || Number(preferences.days ?? 1)}
              travelers={trip.travelers ?? 1}
            />

            <AccommodationCard accommodation={itinerary?.accommodation ?? null} />

            {Array.isArray(itinerary?.planning_notes) &&
              itinerary.planning_notes.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowNotes((value) => !value)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">TripPilot notes</p>
                        <h3 className="mt-1 text-lg font-bold text-slate-950">
                          Planning information
                        </h3>
                      </div>
                    </div>
                    {showNotes ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {showNotes && (
                    <div className="space-y-3 px-6 pb-6">
                      {itinerary.planning_notes.map((note, index) => (
                        <div
                          key={`note-${index}`}
                          className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <p className="text-sm leading-6 text-slate-600">{note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* Trip preferences */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Trip preferences</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">
                    What you're looking for
                  </h3>
                </div>
              </div>

              {Array.isArray(preferences.interests) && preferences.interests.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {preferences.interests.map((interest: any, index: number) => (
                    <span
                      key={`interest-${index}-${String(interest)}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      {String(interest)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-slate-500">
                  Your itinerary is being planned using the destination, travel style,
                  budget and available place data.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={refreshingWeather}
              onClick={() => void loadWeather(trip)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshingWeather ? "animate-spin" : ""}`}
              />
              Refresh weather
            </button>
          </aside>
        </section>

        {/* Cost transparency */}
        <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950">
                TripPilot keeps prices transparent
              </h3>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">
                When a reliable entry price is available, it is shown as a known price
                or planning estimate. Places without reliable ticket information are
                shown as “Price not available” rather than being incorrectly treated
                as free. Meal and accommodation figures are planning ranges rather
                than fake fixed prices.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
