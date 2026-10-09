
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Heart, MapPin } from "lucide-react";

export type Place = {
  id: string | number;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  opening_hours?: string | null;
  phone?: string | null;
  website?: string | null;
  distance_km?: number | null;
};

type TripMapProps = {
  latitude: number;
  longitude: number;
  destination: string;
  country?: string;
  favoriteIds?: string[];
  onToggleFavorite?: (place: Place) => void;
};

function makeIcon(emoji: string, selected = false) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:38px;height:38px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:${selected ? "#dbeafe" : "#ffffff"};
      border:2px solid ${selected ? "#2563eb" : "#e2e8f0"};
      box-shadow:0 3px 10px rgba(15,23,42,.18);
      font-size:19px;
    ">${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
}

function getPlaceEmoji(type?: string) {
  const value = (type ?? "").toLowerCase();

  if (value.includes("restaurant") || value.includes("food")) return "🍽️";
  if (value.includes("cafe")) return "☕";
  if (value.includes("hotel") || value.includes("accommodation")) return "🏨";
  if (value.includes("hospital")) return "🏥";
  if (value.includes("pharmacy")) return "💊";
  if (value.includes("shopping")) return "🛍️";
  if (value.includes("park")) return "🌳";
  if (value.includes("transport") || value.includes("bus")) return "🚌";
  if (value.includes("museum")) return "🏛️";
  return "📍";
}

function MapViewUpdater({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 13);
  }, [map, latitude, longitude]);

  return null;
}

export default function TripMap({
  latitude,
  longitude,
  destination,
  country,
  favoriteIds = [],
  onToggleFavorite,
}: TripMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const destinationIcon = useMemo(
    () => makeIcon("📍", true),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/places?latitude=${latitude}&longitude=${longitude}&radius=5000`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Places request failed (${response.status}).`);
        }

        const data = await response.json();
        const results: Place[] = Array.isArray(data.places)
          ? data.places
          : [];

        setPlaces(
          results.filter(
            (place) =>
              typeof place.latitude === "number" &&
              typeof place.longitude === "number",
          ),
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Places loading error:", err);
        setError("Places could not be loaded. Please try again later.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPlaces();

    return () => controller.abort();
  }, [latitude, longitude]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "520px", width: "100%" }}
      >
        <MapViewUpdater latitude={latitude} longitude={longitude} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[latitude, longitude]}
          icon={destinationIcon}
        >
          <Popup>
            <strong>{destination}</strong>
            {country ? <div>{country}</div> : null}
            <div>Your selected destination</div>
          </Popup>
        </Marker>

        {places.map((place) => {
          const isFavorite = favoriteIds.includes(String(place.id));

          return (
            <Marker
              key={String(place.id)}
              position={[place.latitude, place.longitude]}
              icon={makeIcon(getPlaceEmoji(place.type), isFavorite)}
            >
              <Popup>
                <div style={{ minWidth: "180px", maxWidth: "240px" }}>
                  <strong>{place.name}</strong>

                  {place.type && (
                    <div style={{ marginTop: "4px", color: "#64748b" }}>
                      {place.type}
                    </div>
                  )}

                  {place.address && (
                    <div style={{ marginTop: "6px" }}>
                      {place.address}
                    </div>
                  )}

                  {place.opening_hours && (
                    <div style={{ marginTop: "6px" }}>
                      <strong>Hours:</strong> {place.opening_hours}
                    </div>
                  )}

                  {place.phone && (
                    <div style={{ marginTop: "4px" }}>
                      <strong>Phone:</strong> {place.phone}
                    </div>
                  )}

                  {place.website && (
                    <div style={{ marginTop: "4px" }}>
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit website
                      </a>
                    </div>
                  )}

                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(place)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "10px",
                        padding: "7px 10px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: isFavorite ? "#fff1f2" : "#ffffff",
                        color: isFavorite ? "#e11d48" : "#334155",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <Heart
                        size={15}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                      {isFavorite ? "Remove favorite" : "Save place"}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute left-3 top-3 z-[1000] rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          {places.length} nearby places
        </div>
      </div>

      {loading && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-white px-3 py-2 text-sm shadow">
          Loading nearby places…
        </div>
      )}

      {error && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] rounded-xl bg-white p-3 text-sm text-amber-800 shadow">
          {error}
        </div>
      )}
    </div>
  );
}