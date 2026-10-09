
import { Heart, MapPin, Trash2 } from "lucide-react";
import type { Place } from "./TripMap";

type FavoritePlacesProps = {
  places: Place[];
  onRemove: (place: Place) => void;
};

export default function FavoritePlaces({
  places,
  onRemove,
}: FavoritePlacesProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
            <Heart className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Saved places
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of places you want to visit.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700">
          {places.length}
        </span>
      </div>

      {places.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-800">
            No saved places yet
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Open a place marker on the map and choose “Save place”.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {places.map((place) => (
            <div
              key={String(place.id)}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-lg">
                📍
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">
                  {place.name}
                </h3>

                {place.type && (
                  <p className="mt-1 text-xs font-medium capitalize text-slate-500">
                    {place.type.replaceAll("_", " ")}
                  </p>
                )}

                {place.address && (
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {place.address}
                  </p>
                )}

                {place.distance_km !== null &&
                  place.distance_km !== undefined && (
                    <p className="mt-2 text-xs text-slate-500">
                      {place.distance_km} km away
                    </p>
                  )}

                <a
                  className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
                  href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on OpenStreetMap
                </a>
              </div>

              <button
                type="button"
                onClick={() => onRemove(place)}
                aria-label={`Remove ${place.name} from saved places`}
                title="Remove saved place"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}