import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

type Place = {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  opening_hours?: string;
  phone?: string;
  website?: string;
};

type TripMapProps = {
  latitude: number;
  longitude: number;
  destination: string;
  country?: string;
};

function MapViewUpdater({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 10);
  }, [map, latitude, longitude]);

  return null;
}

function getPlaceIcon(type: string) {
  let emoji = "📍";

  if (
    [
      "attraction",
      "museum",
      "gallery",
      "viewpoint",
      "zoo",
      "theme_park",
      "aquarium",
    ].includes(type)
  ) {
    emoji = "🏛️";
  } else if (["restaurant", "cafe"].includes(type)) {
    emoji = "🍽️";
  } else if (
    ["hotel", "hostel", "guest_house"].includes(type)
  ) {
    emoji = "🏨";
  } else if (
    ["hospital", "clinic", "pharmacy"].includes(type)
  ) {
    emoji = "🏥";
  } else if (
    ["mall", "supermarket", "department_store"].includes(type)
  ) {
    emoji = "🛍️";
  } else if (["park", "garden"].includes(type)) {
    emoji = "🌳";
  } else if (type === "bus_stop") {
    emoji = "🚌";
  } else if (type === "station") {
    emoji = "🚆";
  }

  return L.divIcon({
    html: `
      <div
        style="
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          line-height: 1;
          background: white;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
        "
      >
        ${emoji}
      </div>
    `,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

const destinationIcon = L.divIcon({
  html: `
    <div
      style="
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        line-height: 1;
        filter: drop-shadow(
          0 3px 3px rgba(0, 0, 0, 0.25)
        );
      "
    >
      📍
    </div>
  `,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

export default function TripMap({
  latitude,
  longitude,
  destination,
  country,
}: TripMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/places?latitude=${latitude}&longitude=${longitude}&radius=5000`,
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load nearby places.",
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setPlaces(data.places ?? []);
        }
      } catch (error) {
        console.error(
          "Places loading error:",
          error,
        );

        if (!cancelled) {
          setError(
            "Nearby places could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const placeMarkers = useMemo(() => {
    return places.filter(
      (place) =>
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude),
    );
  }, [places]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        <MapContainer
          center={[latitude, longitude]}
          zoom={10}
          scrollWheelZoom={true}
          className="h-[520px] w-full"
        >
          <MapViewUpdater
            latitude={latitude}
            longitude={longitude}
          />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[latitude, longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-slate-900">
                  {destination}
                </p>

                {country && (
                  <p className="text-sm text-slate-500">
                    {country}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-400">
                  Your destination
                </p>
              </div>
            </Popup>
          </Marker>

          {placeMarkers.map((place) => (
            <Marker
              key={`${place.type}-${place.id}`}
              position={[
                place.latitude,
                place.longitude,
              ]}
              icon={getPlaceIcon(place.type)}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <p className="font-semibold text-slate-900">
                    {place.name}
                  </p>

                  <p className="mt-1 text-xs capitalize text-sky-600">
                    {place.type.replaceAll("_", " ")}
                  </p>

                  {place.address && (
                    <p className="mt-2 text-sm text-slate-500">
                      {place.address}
                    </p>
                  )}

                  {place.city && (
                    <p className="text-sm text-slate-500">
                      {place.city}
                    </p>
                  )}

                  {place.opening_hours && (
                    <p className="mt-2 text-xs text-slate-500">
                      Hours: {place.opening_hours}
                    </p>
                  )}

                  {place.phone && (
                    <p className="mt-1 text-xs text-slate-500">
                      Phone: {place.phone}
                    </p>
                  )}

                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-medium text-sky-600 hover:underline"
                    >
                      Visit website
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute left-4 top-4 z-[1000] rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">
            Nearby places
          </p>

          {loading && (
            <p className="mt-1 text-xs text-slate-500">
              Loading places...
            </p>
          )}

          {!loading && !error && (
            <p className="mt-1 text-xs text-slate-500">
              {places.length} places found
            </p>
          )}

          {error && (
            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          📍 Destination
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          🏛️ Attractions
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          🍽️ Food
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          🏨 Hotels
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          🏥 Healthcare
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          🌳 Parks
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          🚌 Transport
        </span>
      </div>
    </div>
  );
}