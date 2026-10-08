import {
  Car,
  CircleDollarSign,
  Hotel,
  Utensils,
  Ticket,
  Wallet,
} from "lucide-react";

type BudgetPlannerProps = {
  budget?: number | null;
  days: number;
  travelers: number;
  itineraryBudget?: {
    accommodation?: {
      min?: number;
      max?: number;
    };
    food?: {
      min?: number;
      max?: number;
    };
    activities?: {
      min?: number;
      max?: number;
    };
    transport?: {
      min?: number;
      max?: number;
    };
    total?: {
      min?: number;
      max?: number;
    };
  };
};

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function BudgetRow({
  icon,
  label,
  min,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>

        <div>
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-400">
            Estimated planning range
          </p>
        </div>
      </div>

      <p className="font-bold text-slate-800">
        {formatCurrency(min)} – {formatCurrency(max)}
      </p>
    </div>
  );
}

export default function BudgetPlanner({
  budget,
  days,
  travelers,
  itineraryBudget,
}: BudgetPlannerProps) {
  const accommodationMin =
    itineraryBudget?.accommodation?.min ?? days * 3000;

  const accommodationMax =
    itineraryBudget?.accommodation?.max ?? days * 5500;

  const foodMin =
    itineraryBudget?.food?.min ??
    days * travelers * 350 * 2;

  const foodMax =
    itineraryBudget?.food?.max ??
    days * travelers * 700 * 2;

  const activitiesMin =
    itineraryBudget?.activities?.min ?? 0;

  const activitiesMax =
    itineraryBudget?.activities?.max ?? days * travelers * 500;

  const transportMin =
    itineraryBudget?.transport?.min ?? days * 300;

  const transportMax =
    itineraryBudget?.transport?.max ?? days * 800;

  const totalMin =
    itineraryBudget?.total?.min ??
    accommodationMin +
      foodMin +
      activitiesMin +
      transportMin;

  const totalMax =
    itineraryBudget?.total?.max ??
    accommodationMax +
      foodMax +
      activitiesMax +
      transportMax;

  const hasBudget = typeof budget === "number" && budget > 0;

  const budgetStatus = !hasBudget
    ? "No budget set"
    : budget < totalMin
      ? "Likely over budget"
      : budget < totalMax
        ? "Within possible range"
        : "Comfortably within budget";

  const statusClass =
    budgetStatus === "Likely over budget"
      ? "bg-red-50 text-red-600"
      : budgetStatus === "Within possible range"
        ? "bg-amber-50 text-amber-600"
        : budgetStatus === "Comfortably within budget"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-50 text-slate-500";

  const chartTotal =
    accommodationMax +
    foodMax +
    activitiesMax +
    transportMax;

  const accommodationPercentage =
    chartTotal > 0
      ? (accommodationMax / chartTotal) * 100
      : 0;

  const foodPercentage =
    chartTotal > 0
      ? (foodMax / chartTotal) * 100
      : 0;

  const activitiesPercentage =
    chartTotal > 0
      ? (activitiesMax / chartTotal) * 100
      : 0;

  const transportPercentage =
    chartTotal > 0
      ? (transportMax / chartTotal) * 100
      : 0;

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Budget Planner
              </h2>

              <p className="text-sm text-slate-500">
                Estimated spending for {days} day
                {days !== 1 ? "s" : ""} · {travelers} traveler
                {travelers !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusClass}`}
        >
          <CircleDollarSign className="h-4 w-4" />
          {budgetStatus}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Estimated total
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(totalMin)}
            <span className="mx-2 text-lg text-slate-400">–</span>
            {formatCurrency(totalMax)}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            These are planning estimates, not live booking prices.
            Actual costs may vary depending on dates, availability,
            season and travel choices.
          </p>

          {hasBudget && (
            <div className="mt-5 rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Your trip budget
                </span>

                <span className="font-bold text-slate-800">
                  {formatCurrency(budget)}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    budget < totalMin
                      ? "bg-red-500"
                      : budget < totalMax
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (budget / Math.max(totalMax, 1)) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-slate-800">
              Spending breakdown
            </p>

            <p className="text-xs text-slate-400">
              Based on upper estimate
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>Accommodation</span>
                <span>{Math.round(accommodationPercentage)}%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{
                    width: `${accommodationPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>Food</span>
                <span>{Math.round(foodPercentage)}%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{
                    width: `${foodPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>Activities</span>
                <span>{Math.round(activitiesPercentage)}%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: `${activitiesPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>Transport</span>
                <span>{Math.round(transportPercentage)}%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-sky-500"
                  style={{
                    width: `${transportPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <BudgetRow
          icon={<Hotel className="h-5 w-5 text-indigo-500" />}
          label="Accommodation"
          min={accommodationMin}
          max={accommodationMax}
        />

        <BudgetRow
          icon={<Utensils className="h-5 w-5 text-orange-500" />}
          label="Food"
          min={foodMin}
          max={foodMax}
        />

        <BudgetRow
          icon={<Ticket className="h-5 w-5 text-emerald-500" />}
          label="Activities"
          min={activitiesMin}
          max={activitiesMax}
        />

        <BudgetRow
          icon={<Car className="h-5 w-5 text-sky-500" />}
          label="Transport"
          min={transportMin}
          max={transportMax}
        />
      </div>
    </section>
  );
}