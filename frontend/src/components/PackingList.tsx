import { useMemo, useState } from "react";

import {
  Backpack,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  HeartPulse,
  Shirt,
  Smartphone,
  Sparkles,
  Sun,
} from "lucide-react";

type PackingListProps = {
  days: number;
  travelers: number;
  interests?: string[];
  destination?: string;
};

type PackingItem = {
  id: string;
  name: string;
  category: string;
  quantity: string;
};

const BASE_ITEMS: PackingItem[] = [
  {
    id: "clothes",
    name: "Comfortable clothes",
    category: "Clothing",
    quantity: "According to trip length",
  },
  {
    id: "underwear",
    name: "Underwear",
    category: "Clothing",
    quantity: "Days + 1",
  },
  {
    id: "sleepwear",
    name: "Sleepwear",
    category: "Clothing",
    quantity: "1–2",
  },
  {
    id: "shoes",
    name: "Comfortable walking shoes",
    category: "Clothing",
    quantity: "1 pair",
  },
  {
    id: "toiletries",
    name: "Toiletries",
    category: "Toiletries",
    quantity: "1 set",
  },
  {
    id: "toothbrush",
    name: "Toothbrush & toothpaste",
    category: "Toiletries",
    quantity: "1 set",
  },
  {
    id: "sunscreen",
    name: "Sunscreen",
    category: "Toiletries",
    quantity: "1",
  },
  {
    id: "medicines",
    name: "Personal medicines",
    category: "Health",
    quantity: "As required",
  },
  {
    id: "first-aid",
    name: "Basic first-aid kit",
    category: "Health",
    quantity: "1",
  },
  {
    id: "phone",
    name: "Mobile phone",
    category: "Electronics",
    quantity: "1",
  },
  {
    id: "charger",
    name: "Phone charger",
    category: "Electronics",
    quantity: "1",
  },
  {
    id: "powerbank",
    name: "Power bank",
    category: "Electronics",
    quantity: "1",
  },
  {
    id: "id",
    name: "Government ID",
    category: "Documents",
    quantity: "1 per traveler",
  },
  {
    id: "tickets",
    name: "Tickets & booking confirmations",
    category: "Documents",
    quantity: "As required",
  },
];

export default function PackingList({
  days,
  travelers,
  interests = [],
  destination = "",
}: PackingListProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<string[]>([
    "Clothing",
    "Toiletries",
    "Health",
    "Electronics",
    "Documents",
    "Trip Essentials",
  ]);

  const items = useMemo(() => {
    const generatedItems = [...BASE_ITEMS];

    const interestText = interests
      .join(" ")
      .toLowerCase();

    const destinationText = destination.toLowerCase();

    if (
      interestText.includes("beach") ||
      destinationText.includes("goa") ||
      destinationText.includes("maldives")
    ) {
      generatedItems.push(
        {
          id: "swimwear",
          name: "Swimwear",
          category: "Beach Essentials",
          quantity: "1–2",
        },
        {
          id: "sunglasses",
          name: "Sunglasses",
          category: "Beach Essentials",
          quantity: "1",
        },
        {
          id: "beach-towel",
          name: "Beach towel",
          category: "Beach Essentials",
          quantity: "1",
        },
        {
          id: "flip-flops",
          name: "Flip-flops",
          category: "Beach Essentials",
          quantity: "1 pair",
        },
      );
    }

    if (
      interestText.includes("mountain") ||
      interestText.includes("adventure") ||
      interestText.includes("wildlife") ||
      destinationText.includes("manali") ||
      destinationText.includes("ladakh")
    ) {
      generatedItems.push(
        {
          id: "jacket",
          name: "Warm jacket",
          category: "Adventure",
          quantity: "1",
        },
        {
          id: "hiking-shoes",
          name: "Sturdy walking/hiking shoes",
          category: "Adventure",
          quantity: "1 pair",
        },
        {
          id: "water-bottle",
          name: "Reusable water bottle",
          category: "Adventure",
          quantity: "1",
        },
      );
    }

    if (
      interestText.includes("photography")
    ) {
      generatedItems.push(
        {
          id: "camera",
          name: "Camera",
          category: "Photography",
          quantity: "1",
        },
        {
          id: "memory-card",
          name: "Extra memory card",
          category: "Photography",
          quantity: "1",
        },
      );
    }

    if (
      interestText.includes("spiritual") ||
      interestText.includes("culture") ||
      interestText.includes("history")
    ) {
      generatedItems.push({
        id: "modest-clothes",
        name: "Modest clothing for religious places",
        category: "Trip Essentials",
        quantity: "As required",
      });
    }

    generatedItems.push(
      {
        id: "wallet",
        name: "Wallet & payment cards",
        category: "Trip Essentials",
        quantity: "1",
      },
      {
        id: "water",
        name: "Reusable water bottle",
        category: "Trip Essentials",
        quantity: "1",
      },
      {
        id: "bag",
        name: "Small day bag",
        category: "Trip Essentials",
        quantity: "1",
      },
      {
        id: "tissues",
        name: "Tissues / wet wipes",
        category: "Trip Essentials",
        quantity: "1 pack",
      },
    );

    return generatedItems;
  }, [destination, interests]);

  const categories = Array.from(
    new Set(items.map((item) => item.category)),
  );

  const completedCount = checkedItems.length;

  const toggleItem = (id: string) => {
    setCheckedItems((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const progress =
    items.length > 0
      ? Math.round(
          (completedCount / items.length) * 100,
        )
      : 0;

  const categoryIcon = (category: string) => {
    if (category === "Clothing") {
      return <Shirt className="h-5 w-5 text-indigo-500" />;
    }

    if (category === "Electronics") {
      return (
        <Smartphone className="h-5 w-5 text-sky-500" />
      );
    }

    if (category === "Health") {
      return (
        <HeartPulse className="h-5 w-5 text-red-500" />
      );
    }

    if (category === "Documents") {
      return (
        <FileText className="h-5 w-5 text-amber-500" />
      );
    }

    if (category === "Beach Essentials") {
      return <Sun className="h-5 w-5 text-orange-500" />;
    }

    return (
      <Backpack className="h-5 w-5 text-emerald-500" />
    );
  };

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <Backpack className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Smart Packing List
              </h2>

              <p className="text-sm text-slate-500">
                {days} day{days !== 1 ? "s" : ""} ·{" "}
                {travelers} traveler
                {travelers !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Personalized for your destination and interests
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-5 py-4 md:min-w-[190px]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Packed
            </span>

            <span className="font-bold text-slate-800">
              {completedCount}/{items.length}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {progress}% complete
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const categoryItems = items.filter(
            (item) => item.category === category,
          );

          const isOpen =
            openCategories.includes(category);

          const categoryCompleted =
            categoryItems.filter((item) =>
              checkedItems.includes(item.id),
            ).length;

          return (
            <div
              key={category}
              className="overflow-hidden rounded-2xl border border-slate-100"
            >
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between bg-slate-50 p-4 text-left transition hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    {categoryIcon(category)}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {category}
                    </p>

                    <p className="text-xs text-slate-400">
                      {categoryCompleted}/
                      {categoryItems.length} packed
                    </p>
                  </div>
                </div>

                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {categoryItems.map((item) => {
                    const isChecked =
                      checkedItems.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                            isChecked
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium ${
                              isChecked
                                ? "text-slate-400 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.quantity}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
        <p className="font-semibold">
          Packing tip
        </p>

        <p className="mt-1 leading-6">
          Pack according to the weather, activities and
          duration of your trip. Keep important documents,
          medicines and electronics easily accessible.
        </p>
      </div>
    </section>
  );
}