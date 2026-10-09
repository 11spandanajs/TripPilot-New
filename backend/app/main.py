import math
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

app = FastAPI(
    title="TripPilot API",
    description="AI-powered expert travel manager backend",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "message": "TripPilot API is running",
        "version": "2.0.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "TripPilot backend",
    }


# ============================================================
# INDIAN DESTINATION FALLBACKS
# ============================================================

INDIAN_DESTINATIONS = {
    "goa": {
        "latitude": 15.4909,
        "longitude": 73.8278,
        "country": "India",
        "name": "Goa",
    },
    "manali": {
        "latitude": 32.2432,
        "longitude": 77.1892,
        "country": "India",
        "name": "Manali",
    },
    "bengaluru": {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "country": "India",
        "name": "Bengaluru",
    },
    "bangalore": {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "country": "India",
        "name": "Bengaluru",
    },
    "mumbai": {
        "latitude": 19.0760,
        "longitude": 72.8777,
        "country": "India",
        "name": "Mumbai",
    },
    "delhi": {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "country": "India",
        "name": "Delhi",
    },
    "new delhi": {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "country": "India",
        "name": "Delhi",
    },
    "hyderabad": {
        "latitude": 17.3850,
        "longitude": 78.4867,
        "country": "India",
        "name": "Hyderabad",
    },
    "chennai": {
        "latitude": 13.0827,
        "longitude": 80.2707,
        "country": "India",
        "name": "Chennai",
    },
    "kochi": {
        "latitude": 9.9312,
        "longitude": 76.2673,
        "country": "India",
        "name": "Kochi",
    },
    "mysuru": {
        "latitude": 12.2958,
        "longitude": 76.6394,
        "country": "India",
        "name": "Mysuru",
    },
    "mysore": {
        "latitude": 12.2958,
        "longitude": 76.6394,
        "country": "India",
        "name": "Mysuru",
    },
    "ooty": {
        "latitude": 11.4064,
        "longitude": 76.6932,
        "country": "India",
        "name": "Ooty",
    },
    "jaipur": {
        "latitude": 26.9124,
        "longitude": 75.7873,
        "country": "India",
        "name": "Jaipur",
    },
    "udaipur": {
        "latitude": 24.5854,
        "longitude": 73.7125,
        "country": "India",
        "name": "Udaipur",
    },
    "pondicherry": {
        "latitude": 11.9416,
        "longitude": 79.8083,
        "country": "India",
        "name": "Pondicherry",
    },
    "puducherry": {
        "latitude": 11.9416,
        "longitude": 79.8083,
        "country": "India",
        "name": "Pondicherry",
    },
    "agra": {
        "latitude": 27.1767,
        "longitude": 78.0081,
        "country": "India",
        "name": "Agra",
    },
    "varanasi": {
        "latitude": 25.3176,
        "longitude": 82.9739,
        "country": "India",
        "name": "Varanasi",
    },
}


# ============================================================
# WEATHER
# ============================================================

WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


async def geocode_destination(destination: str) -> Dict[str, Any]:
    cleaned = destination.strip().lower()

    if cleaned in INDIAN_DESTINATIONS:
        return INDIAN_DESTINATIONS[cleaned]

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": destination,
        "format": "json",
        "limit": 5,
        "addressdetails": 1,
    }

    headers = {
        "User-Agent": "TripPilot/1.0 travel-planner",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            params=params,
            headers=headers,
        )

        response.raise_for_status()
        results = response.json()

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Could not find destination: {destination}",
        )

    india_result = next(
        (
            item
            for item in results
            if item.get("address", {})
            .get("country", "")
            .lower()
            == "india"
        ),
        None,
    )

    result = india_result or results[0]
    address = result.get("address", {})

    return {
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
        "country": address.get("country"),
        "name": result.get("display_name", destination),
    }


@app.get("/api/weather")
async def get_weather(destination: str):
    location = await geocode_destination(destination)

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m"
        ),
        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_probability_max,"
            "sunrise,"
            "sunset"
        ),
        "timezone": "auto",
        "forecast_days": 7,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            params=params,
        )
        response.raise_for_status()

    data = response.json()
    current = data.get("current", {})
    current_code = current.get("weather_code")

    return {
        "destination": destination,
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "current": {
            **current,
            "description": WEATHER_CODES.get(
                current_code,
                "Unknown",
            ),
        },
        "daily": data.get("daily", {}),
    }


# ============================================================
# PLACES
# ============================================================

PLACE_CATEGORY_MAP = {
    "tourism": "attraction",
    "tourism.attraction": "attraction",
    "tourism.sights": "attraction",
    "entertainment.museum": "museum",
    "catering.restaurant": "restaurant",
    "catering.cafe": "cafe",
    "accommodation.hotel": "hotel",
    "healthcare.hospital": "hospital",
    "healthcare.pharmacy": "pharmacy",
    "leisure.park": "park",
    "commercial.shopping_mall": "shopping",
    "public_transport": "transport",
}

ITINERARY_TYPES = {
    "attraction",
    "museum",
    "park",
    "shopping",
}

EXCLUDED_ITINERARY_TYPES = {
    "hospital",
    "pharmacy",
    "hotel",
    "transport",
    "place",
}


def calculate_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    earth_radius = 6371.0

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return earth_radius * c


def estimate_travel_minutes(distance_km: float) -> int:
    if distance_km <= 1:
        return max(5, round(distance_km * 8))

    if distance_km <= 3:
        speed = 20
    elif distance_km <= 8:
        speed = 25
    else:
        speed = 30

    minutes = (distance_km / speed) * 60
    minutes *= 1.15

    return max(5, round(minutes))


def clean_place_name(name: str) -> str:
    return " ".join(name.strip().split())


# ============================================================
# STRICT PLACE CLASSIFICATION
# ============================================================

def classify_place(place: Dict[str, Any]) -> str:
    """
    Strict travel classification.

    Suspicious/user-generated listings are rejected BEFORE
    keyword classification so fake/warning listings cannot
    accidentally become valid attractions.
    """

    name = (
        place.get("name")
        or ""
    ).strip().lower()

    category = (
        place.get("type")
        or ""
    ).strip().lower()

    combined = f"{name} {category}"

    # --------------------------------------------------------
    # 1. SUSPICIOUS / SYNTHETIC LISTINGS
    # --------------------------------------------------------

    suspicious_phrases = [
        "scam",
        "scamer",
        "scammers",
        "scammed",
        "fraud",
        "fake",
        "warning",
        "beware",
        "rip off",
        "rip-off",
        "ripoff",
        "avoid this",
        "do not visit",
        "don't visit",
        "200k",
        "200 k",
        "200000",
        "200,000",
        "100k",
        "100 k",
        "100000",
        "100,000",
        "free entrance",
        "entrance to",
        "entry to",
        "recommended place",
        "things to do",
        "tourist attraction",
        "tourist spot",
        "must visit",
        "best place",
    ]

    if any(
        phrase in name
        for phrase in suspicious_phrases
    ):
        return "unknown"

    # --------------------------------------------------------
    # 2. FOOD
    # --------------------------------------------------------

    if category in {
        "restaurant",
        "cafe",
        "food",
    } or any(
        word in combined
        for word in [
            "restaurant",
            "cafe",
            "café",
            "coffee shop",
            "bakery",
            "diner",
            "bar & grill",
            "grill",
        ]
    ):
        return "food"

    # --------------------------------------------------------
    # 3. ACCOMMODATION
    # --------------------------------------------------------

    if category in {
        "hotel",
        "accommodation",
        "guest_house",
        "hostel",
    } or any(
        word in combined
        for word in [
            "hotel",
            "resort",
            "hostel",
            "guest house",
            "guesthouse",
            "homestay",
        ]
    ):
        return "accommodation"

    # --------------------------------------------------------
    # 4. MEDICAL
    # --------------------------------------------------------

    if category in {
        "hospital",
        "pharmacy",
        "clinic",
        "healthcare",
    } or any(
        word in combined
        for word in [
            "hospital",
            "pharmacy",
            "clinic",
            "medical center",
            "medical centre",
        ]
    ):
        return "medical"

    # --------------------------------------------------------
    # 5. TRANSPORT
    # --------------------------------------------------------

    if category in {
        "transport",
        "bus",
        "train",
        "station",
        "airport",
    } or any(
        word in combined
        for word in [
            "bus station",
            "railway station",
            "train station",
            "metro station",
            "airport",
            "bus stop",
        ]
    ):
        return "transport"

    # --------------------------------------------------------
    # 6. BEACH
    # --------------------------------------------------------

    if any(
        word in combined
        for word in [
            "beach",
            "shore",
            "coast",
            "waterfront",
            "seafront",
            "bay",
            "lagoon",
        ]
    ):
        return "beach"

    # --------------------------------------------------------
    # 7. CULTURE / HERITAGE
    # --------------------------------------------------------

    if any(
        word in combined
        for word in [
            "fort",
            "palace",
            "castle",
            "monument",
            "memorial",
            "cathedral",
            "church",
            "basilica",
            "temple",
            "mosque",
            "shrine",
            "museum",
            "heritage",
            "historical",
            "historic",
            "ruins",
        ]
    ):
        return "culture"

    # --------------------------------------------------------
    # 8. NATURE
    # --------------------------------------------------------

    if any(
        word in combined
        for word in [
            "park",
            "garden",
            "waterfall",
            "lake",
            "hill",
            "mount",
            "mountain",
            "viewpoint",
            "dam",
            "sanctuary",
            "wildlife",
            "forest",
            "nature",
            "reserve",
            "national park",
        ]
    ):
        return "nature"

    # --------------------------------------------------------
    # 9. SHOPPING
    # --------------------------------------------------------

    if any(
        word in combined
        for word in [
            "mall",
            "market",
            "bazaar",
            "shopping",
            "shopping centre",
            "shopping center",
        ]
    ):
        return "shopping"

    return "unknown"


# ============================================================
# COST ESTIMATION
# ============================================================

def estimate_place_cost(
    place: Dict[str, Any],
    travelers: int,
) -> Dict[str, Any]:
    """
    Never invent attraction ticket prices.
    """

    category = place.get("travel_category")
    name = (
        place.get("name")
        or ""
    ).lower()

    if category in {
        "beach",
        "park",
        "nature",
    } and not any(
        word in name
        for word in [
            "museum",
            "aquarium",
            "water park",
            "zoo",
            "sanctuary",
        ]
    ):
        return {
            "estimated_cost": 0,
            "cost_min": 0,
            "cost_max": 0,
            "cost_label": "Free entry",
            "cost_basis": (
                "Public/open-access location; "
                "parking or optional activities may cost extra."
            ),
            "cost_known": True,
        }

    return {
        "estimated_cost": 0,
        "cost_min": None,
        "cost_max": None,
        "cost_label": "Price not available",
        "cost_basis": (
            "No reliable attraction ticket price is "
            "available in the current place data."
        ),
        "cost_known": False,
    }


# ============================================================
# MEAL / ACCOMMODATION PRICING
# ============================================================

MEAL_RANGES_PER_PERSON = {
    "low": {
        "min": 200,
        "max": 400,
    },
    "moderate": {
        "min": 350,
        "max": 700,
    },
    "comfortable": {
        "min": 600,
        "max": 1200,
    },
    "premium": {
        "min": 1000,
        "max": 2000,
    },
    "unknown": {
        "min": 350,
        "max": 700,
    },
}


ACCOMMODATION_RANGES = {
    "default": {
        "low": (1800, 3000),
        "moderate": (3000, 5500),
        "comfortable": (5500, 9000),
        "premium": (9000, 18000),
        "unknown": (3000, 5500),
    },
    "goa": {
        "low": (2000, 3500),
        "moderate": (3500, 6500),
        "comfortable": (6500, 11000),
        "premium": (11000, 22000),
        "unknown": (3500, 6500),
    },
    "manali": {
        "low": (1800, 3200),
        "moderate": (3000, 5500),
        "comfortable": (5500, 9000),
        "premium": (9000, 18000),
        "unknown": (3000, 5500),
    },
}


def accommodation_range(
    destination: str,
    budget_level: str,
    nights: int,
    travelers: int,
) -> Dict[str, Any]:

    key = destination.strip().lower()

    ranges = ACCOMMODATION_RANGES.get(
        key,
        ACCOMMODATION_RANGES["default"],
    )

    low, high = ranges.get(
        budget_level,
        ranges["unknown"],
    )

    rooms = max(
        1,
        math.ceil(travelers / 2),
    )

    total_min = low * nights * rooms
    total_max = high * nights * rooms

    return {
        "nights": nights,
        "rooms": rooms,
        "per_room_per_night_min": low,
        "per_room_per_night_max": high,
        "total_min": total_min,
        "total_max": total_max,
        "label": f"₹{low:,}–₹{high:,} per room/night",
        "basis": (
            "Typical planning range; actual hotel rates vary "
            "by dates, location, season and room type."
        ),
    }


# ============================================================
# GEOAPIFY PLACES
# ============================================================

async def fetch_nearby_places(
    latitude: float,
    longitude: float,
    radius: int = 10000,
    limit: int = 100,
) -> List[Dict[str, Any]]:

    if not GEOAPIFY_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEOAPIFY_API_KEY is missing in backend/.env",
        )

    url = "https://api.geoapify.com/v2/places"

    categories = (
        "tourism,"
        "entertainment.museum,"
        "catering.restaurant,"
        "catering.cafe,"
        "accommodation.hotel,"
        "healthcare.hospital,"
        "healthcare.pharmacy,"
        "leisure.park,"
        "commercial.shopping_mall,"
        "public_transport"
    )

    params = {
        "categories": categories,
        "filter": (
            f"circle:{longitude},{latitude},{radius}"
        ),
        "bias": (
            f"proximity:{longitude},{latitude}"
        ),
        "limit": limit,
        "apiKey": GEOAPIFY_API_KEY,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            url,
            params=params,
        )

        if response.is_error:
            try:
                error_data = response.json()
            except Exception:
                error_data = response.text

            print(
                "Geoapify places error:",
                error_data,
            )

            raise HTTPException(
                status_code=502,
                detail={
                    "message": (
                        "Geoapify places service "
                        "returned an error."
                    ),
                    "geoapify_error": error_data,
                },
            )

    data = response.json()

    places = []

    for feature in data.get(
        "features",
        [],
    ):

        properties = feature.get(
            "properties",
            {},
        )

        coordinates = (
            feature.get(
                "geometry",
                {},
            )
            .get(
                "coordinates",
                [],
            )
        )

        if len(coordinates) < 2:
            continue

        place_lon = coordinates[0]
        place_lat = coordinates[1]

        raw_categories = properties.get(
            "categories",
            [],
        )

        place_type = "place"

        for category in raw_categories:

            if category in PLACE_CATEGORY_MAP:
                place_type = PLACE_CATEGORY_MAP[
                    category
                ]
                break

            for (
                key,
                mapped_type,
            ) in PLACE_CATEGORY_MAP.items():

                if category.startswith(key):
                    place_type = mapped_type
                    break

            if place_type != "place":
                break

        name = properties.get("name")

        if not name:
            continue

        place = {
            "id": properties.get(
                "place_id",
                f"{place_lat}-{place_lon}",
            ),
            "name": clean_place_name(name),
            "type": place_type,
            "latitude": place_lat,
            "longitude": place_lon,
            "address": properties.get(
                "formatted"
            ),
            "city": properties.get("city"),
            "country": properties.get("country"),
            "opening_hours": properties.get(
                "opening_hours"
            ),
            "phone": properties.get(
                "contact",
                {},
            ).get("phone"),
            "website": properties.get(
                "website"
            ),
            "distance_km": round(
                calculate_distance_km(
                    latitude,
                    longitude,
                    place_lat,
                    place_lon,
                ),
                2,
            ),
        }

        places.append(place)

    unique_places = {}

    for place in places:
        key = (
            place["name"].lower(),
            place["type"],
        )

        if key not in unique_places:
            unique_places[key] = place

    return list(
        unique_places.values()
    )


@app.get("/api/places")
async def get_places(
    latitude: float,
    longitude: float,
    radius: int = Query(
        default=5000,
        ge=500,
        le=50000,
    ),
):

    places = await fetch_nearby_places(
        latitude,
        longitude,
        radius,
        100,
    )

    return {
        "count": len(places),
        "places": places,
    }


# ============================================================
# EXPERT TRAVEL MANAGER
# ============================================================

class ItineraryRequest(BaseModel):
    destination: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    start_date: Optional[str] = None

    days: int = Field(
        default=1,
        ge=1,
        le=30,
    )

    travelers: int = Field(
        default=1,
        ge=1,
        le=100,
    )

    budget: Optional[float] = Field(
        default=None,
        ge=0,
    )

    travel_type: Optional[str] = "Solo"

    interests: List[str] = Field(
        default_factory=list,
    )

    starting_location: Optional[str] = None

    pace: Optional[str] = "Balanced"


INTEREST_KEYWORDS = {
    "beaches": {
        "beach",
    },
    "nature": {
        "nature",
        "park",
        "garden",
        "waterfall",
        "lake",
        "hill",
        "mount",
        "forest",
        "wildlife",
        "sanctuary",
    },
    "mountains": {
        "mount",
        "hill",
        "viewpoint",
    },
    "culture": {
        "culture",
        "fort",
        "palace",
        "museum",
        "temple",
        "church",
        "cathedral",
        "basilica",
        "heritage",
    },
    "history": {
        "history",
        "fort",
        "palace",
        "monument",
        "museum",
        "heritage",
    },
    "food": {
        "food",
        "restaurant",
        "cafe",
    },
    "shopping": {
        "shopping",
        "mall",
        "market",
        "bazaar",
    },
    "photography": {
        "photography",
        "beach",
        "fort",
        "viewpoint",
        "garden",
        "sunset",
    },
    "wildlife": {
        "wildlife",
        "sanctuary",
        "forest",
        "park",
    },
    "spiritual": {
        "temple",
        "church",
        "cathedral",
        "basilica",
        "mosque",
    },
    "adventure": {
        "adventure",
        "waterfall",
        "hill",
        "mount",
        "nature",
    },
}


def normalized_interests(
    interests: List[str],
) -> List[str]:

    return [
        interest.strip().lower()
        for interest in interests
        if interest
        and interest.strip()
    ]


def interest_score(
    place: Dict[str, Any],
    interests: List[str],
) -> int:

    if not interests:
        return 1

    name = (
        place.get("name")
        or ""
    ).lower()

    place_type = (
        place.get("type")
        or ""
    ).lower()

    combined = (
        f"{name} {place_type}"
    )

    score = 0

    for interest in interests:

        keywords = INTEREST_KEYWORDS.get(
            interest,
            set(),
        )

        for keyword in keywords:
            if keyword in combined:
                score += 3

    if (
        "beaches" in interests
        and place_type == "beach"
    ):
        score += 8

    if (
        "food" in interests
        and place_type == "food"
    ):
        score += 8

    if (
        "culture" in interests
        and place_type == "culture"
    ):
        score += 8

    if (
        "nature" in interests
        and place_type == "nature"
    ):
        score += 8

    if (
        "shopping" in interests
        and place_type == "shopping"
    ):
        score += 8

    return score


def pace_limits(
    pace: str,
) -> Dict[str, int]:

    normalized = (
        pace or "Balanced"
    ).lower()

    if normalized == "relaxed":
        return {
            "major": 3,
            "total": 5,
        }

    if normalized == "packed":
        return {
            "major": 5,
            "total": 8,
        }

    return {
        "major": 4,
        "total": 6,
    }


def choose_day_count(
    days: int,
    place_count: int,
) -> int:

    if days <= 1:
        return 1

    if place_count < days * 2:
        return max(
            1,
            math.ceil(place_count / 3),
        )

    return days


# ============================================================
# GEOGRAPHIC GROUPING
# ============================================================

def create_geographic_groups(
    places: List[Dict[str, Any]],
    days: int,
) -> List[List[Dict[str, Any]]]:

    if not places:
        return [
            []
            for _ in range(days)
        ]

    if days <= 1:
        return [places]

    actual_days = min(
        days,
        len(places),
    )

    sorted_places = sorted(
        places,
        key=lambda place: (
            float(
                place.get("latitude")
                or 0
            ),
            float(
                place.get("longitude")
                or 0
            ),
        ),
    )

    groups = [
        []
        for _ in range(actual_days)
    ]

    for index in range(actual_days):

        position = round(
            index
            * (
                len(sorted_places) - 1
            )
            / max(
                actual_days - 1,
                1,
            )
        )

        groups[index].append(
            sorted_places[position]
        )

    seeded_ids = {
        id(place)
        for group in groups
        for place in group
    }

    remaining = [
        place
        for place in sorted_places
        if id(place)
        not in seeded_ids
    ]

    for place in remaining:

        best_group_index = min(
            range(actual_days),
            key=lambda group_index: min(
                calculate_distance_km(
                    place["latitude"],
                    place["longitude"],
                    existing["latitude"],
                    existing["longitude"],
                )
                for existing
                in groups[group_index]
            ),
        )

        groups[
            best_group_index
        ].append(place)

    while len(groups) < days:
        groups.append([])

    for group in groups:

        if len(group) > 1:
            group.sort(
                key=lambda place: (
                    float(
                        place.get("latitude")
                        or 0
                    ),
                    float(
                        place.get("longitude")
                        or 0
                    ),
                )
            )

    return groups


def improve_group_locality(
    group: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:

    if len(group) <= 2:
        return group

    remaining = group.copy()

    route = [
        remaining.pop(0)
    ]

    while remaining:

        current = route[-1]

        nearest_index = min(
            range(len(remaining)),
            key=lambda index: calculate_distance_km(
                current["latitude"],
                current["longitude"],
                remaining[index]["latitude"],
                remaining[index]["longitude"],
            ),
        )

        route.append(
            remaining.pop(
                nearest_index
            )
        )

    return route


# ============================================================
# PREPARE SIGHTSEEING PLACES
# ============================================================

def classify_and_prepare_places(
    places: List[Dict[str, Any]],
    travelers: int,
    interests: List[str],
) -> List[Dict[str, Any]]:

    prepared = []

    valid_categories = {
        "beach",
        "nature",
        "culture",
        "shopping",
    }

    for place in places:

        copy = dict(place)

        travel_category = classify_place(
            copy
        )

        # IMPORTANT:
        # Only genuine sightseeing categories
        # are allowed into the itinerary.
        if travel_category not in valid_categories:
            continue

        copy[
            "travel_category"
        ] = travel_category

        copy[
            "interest_score"
        ] = interest_score(
            copy,
            interests,
        )

        cost_info = estimate_place_cost(
            copy,
            travelers,
        )

        copy.update(cost_info)

        prepared.append(copy)

    prepared.sort(
        key=lambda place: (
            -place["interest_score"],
            place.get(
                "distance_km",
                999,
            ),
        )
    )

    return prepared


def choose_budget_level(
    budget: Optional[float],
    travelers: int,
    days: int,
) -> str:

    if not budget:
        return "unknown"

    per_person_day = budget / max(
        1,
        travelers * days,
    )

    if per_person_day < 1200:
        return "low"

    if per_person_day < 3000:
        return "moderate"

    if per_person_day < 7000:
        return "comfortable"

    return "premium"


def filter_for_budget(
    places: List[Dict[str, Any]],
    budget: Optional[float],
    travelers: int,
    days: int,
) -> List[Dict[str, Any]]:

    if not budget:
        return places

    level = choose_budget_level(
        budget,
        travelers,
        days,
    )

    if level == "low":

        free_places = [
            place
            for place in places
            if (
                place.get("cost_known")
                and place["estimated_cost"]
                <= 50 * travelers
            )
        ]

        if len(free_places) >= days * 3:
            return free_places

    return places


def select_places_for_days(
    places: List[Dict[str, Any]],
    days: int,
    travelers: int,
    interests: List[str],
    budget: Optional[float],
) -> List[List[Dict[str, Any]]]:

    if not places:
        return [
            []
            for _ in range(days)
        ]

    max_pool = min(
        len(places),
        max(
            20,
            days * 7,
        ),
    )

    candidate_places = places[
        :max_pool
    ]

    candidate_places = filter_for_budget(
        candidate_places,
        budget,
        travelers,
        days,
    )

    groups = create_geographic_groups(
        candidate_places,
        days,
    )

    result = []

    for group in groups:

        group = sorted(
            group,
            key=lambda place: (
                -place[
                    "interest_score"
                ],
                place.get(
                    "distance_km",
                    999,
                ),
            ),
        )

        result.append(
            improve_group_locality(
                group
            )
        )

    return result


# ============================================================
# DAY STRUCTURE
# ============================================================

DAY_PERIODS = [
    {
        "name": "Morning",
        "icon": "🌅",
        "start": "09:00",
        "end": "12:30",
        "max_places": 2,
    },
    {
        "name": "Afternoon",
        "icon": "🍴",
        "start": "12:30",
        "end": "16:30",
        "max_places": 2,
    },
    {
        "name": "Evening",
        "icon": "🌇",
        "start": "16:30",
        "end": "18:30",
        "max_places": 2,
    },
    {
        "name": "Sunset",
        "icon": "🌅",
        "start": "18:30",
        "end": "19:30",
        "max_places": 1,
    },
    {
        "name": "Night",
        "icon": "🌙",
        "start": "19:30",
        "end": "22:00",
        "max_places": 1,
    },
]


def format_time(
    hour: int,
    minute: int,
) -> str:

    suffix = (
        "AM"
        if hour < 12
        else "PM"
    )

    display_hour = hour % 12

    if display_hour == 0:
        display_hour = 12

    return (
        f"{display_hour:02d}:"
        f"{minute:02d} "
        f"{suffix}"
    )


def add_minutes(
    time_hour: int,
    time_minute: int,
    minutes: int,
):

    total = (
        time_hour * 60
        + time_minute
        + minutes
    )

    return (
        total // 60,
        total % 60,
    )


def activity_duration(
    place: Dict[str, Any],
) -> int:

    category = place.get(
        "travel_category",
        "sightseeing",
    )

    if category in {
        "beach",
        "nature",
    }:
        return 75

    if category == "culture":
        return 90

    if category == "food":
        return 60

    if category == "shopping":
        return 90

    return 60


def activity_item(
    place: Dict[str, Any],
    start_hour: int,
    start_minute: int,
    previous: Optional[Dict[str, Any]],
    travelers: int,
) -> Dict[str, Any]:

    distance = 0
    travel_minutes = 0

    if previous:

        distance = calculate_distance_km(
            previous["latitude"],
            previous["longitude"],
            place["latitude"],
            place["longitude"],
        )

        travel_minutes = estimate_travel_minutes(
            distance
        )

    duration = activity_duration(
        place
    )

    return {
        "name": place["name"],
        "type": place.get(
            "travel_category"
        ),
        "place_type": place.get(
            "type"
        ),
        "latitude": place[
            "latitude"
        ],
        "longitude": place[
            "longitude"
        ],
        "address": place.get(
            "address"
        ),
        "opening_hours": place.get(
            "opening_hours"
        ),
        "website": place.get(
            "website"
        ),
        "phone": place.get(
            "phone"
        ),
        "start_time": format_time(
            start_hour,
            start_minute,
        ),
        "duration_minutes": duration,
        "travel_distance_km": round(
            distance,
            2,
        ),
        "travel_time_minutes": travel_minutes,
        "estimated_cost": round(
            place.get(
                "estimated_cost",
                0,
            ),
            2,
        ),
        "cost_min": place.get(
            "cost_min"
        ),
        "cost_max": place.get(
            "cost_max"
        ),
        "cost_label": place.get(
            "cost_label",
            "Price not available",
        ),
        "cost_basis": place.get(
            "cost_basis"
        ),
        "cost_known": place.get(
            "cost_known",
            False,
        ),
        "cost_is_estimate": not place.get(
            "cost_known",
            False,
        ),
        "reason": (
            "Selected based on your interests, "
            "location, available time and overall trip plan."
        ),
    }


# ============================================================
# MEALS
# ============================================================

def make_meal_item(
    meal_name: str,
    start_hour: int,
    start_minute: int,
    travelers: int,
    budget_level: str,
    restaurant: Optional[Dict[str, Any]] = None,
    previous: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:

    meal_range = MEAL_RANGES_PER_PERSON.get(
        budget_level,
        MEAL_RANGES_PER_PERSON[
            "unknown"
        ],
    )

    cost_min = (
        meal_range["min"]
        * travelers
    )

    cost_max = (
        meal_range["max"]
        * travelers
    )

    midpoint = round(
        (
            cost_min
            + cost_max
        ) / 2,
        2,
    )

    distance = 0.0
    travel_minutes = 0

    if (
        restaurant
        and previous
    ):

        distance = calculate_distance_km(
            previous["latitude"],
            previous["longitude"],
            restaurant["latitude"],
            restaurant["longitude"],
        )

        travel_minutes = estimate_travel_minutes(
            distance
        )

    if restaurant:

        name = restaurant[
            "name"
        ]

        reason = (
            f"Suggested as a nearby "
            f"{meal_name.lower()} option "
            "to keep the route practical. "
            "Food cost is a planning range, "
            "not a live menu quote."
        )

        latitude = restaurant[
            "latitude"
        ]

        longitude = restaurant[
            "longitude"
        ]

        address = restaurant.get(
            "address"
        )

        opening_hours = restaurant.get(
            "opening_hours"
        )

        website = restaurant.get(
            "website"
        )

        phone = restaurant.get(
            "phone"
        )

        place_type = restaurant.get(
            "type",
            "restaurant",
        )

    else:

        name = (
            f"{meal_name} break"
        )

        reason = (
            "A realistic meal break has "
            "been included. No suitable "
            "nearby restaurant was returned "
            "by the places service."
        )

        latitude = None
        longitude = None
        address = None
        opening_hours = None
        website = None
        phone = None
        place_type = "meal"

    return {
        "name": name,
        "type": "meal",
        "place_type": place_type,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "opening_hours": opening_hours,
        "website": website,
        "phone": phone,
        "start_time": format_time(
            start_hour,
            start_minute,
        ),
        "duration_minutes": 60,
        "travel_distance_km": round(
            distance,
            2,
        ),
        "travel_time_minutes": travel_minutes,
        "estimated_cost": midpoint,
        "cost_min": cost_min,
        "cost_max": cost_max,
        "cost_label": (
            f"₹{cost_min:,}–"
            f"₹{cost_max:,} for "
            f"{travelers} traveler"
            f"{'s' if travelers != 1 else ''}"
        ),
        "cost_basis": (
            f"₹{meal_range['min']:,}–"
            f"₹{meal_range['max']:,} "
            "per person for this "
            "budget level."
        ),
        "cost_known": False,
        "cost_is_estimate": True,
        "reason": reason,
    }


def prepare_restaurants(
    places: List[Dict[str, Any]],
    interests: List[str],
) -> List[Dict[str, Any]]:

    restaurants = []

    for place in places:

        if place.get("type") not in {
            "restaurant",
            "cafe",
        }:
            continue

        copy = dict(place)

        copy[
            "travel_category"
        ] = "food"

        copy[
            "interest_score"
        ] = interest_score(
            copy,
            interests,
        )

        restaurants.append(copy)

    restaurants.sort(
        key=lambda place: (
            -place.get(
                "interest_score",
                0,
            ),
            place.get(
                "distance_km",
                999,
            ),
        )
    )

    return restaurants


def choose_meal_restaurant(
    restaurants: List[Dict[str, Any]],
    previous: Optional[Dict[str, Any]],
    used_names: set,
) -> Optional[Dict[str, Any]]:

    available = [
        restaurant
        for restaurant in restaurants
        if restaurant.get(
            "name"
        ) not in used_names
    ]

    if not available:
        available = restaurants

    if not available:
        return None

    if previous:

        return min(
            available,
            key=lambda restaurant: calculate_distance_km(
                previous["latitude"],
                previous["longitude"],
                restaurant["latitude"],
                restaurant["longitude"],
            ),
        )

    return available[0]


# ============================================================
# BUILD DAY PLAN
# ============================================================

def build_day_sections(
    group: List[Dict[str, Any]],
    travelers: int,
    days: int,
    budget: Optional[float],
    interests: List[str],
    pace: str,
    restaurants: List[Dict[str, Any]],
) -> Dict[str, Any]:

    limits = pace_limits(
        pace
    )

    budget_level = choose_budget_level(
        budget,
        travelers,
        days,
    )

    selected = group[
        :limits["total"]
    ]

    selected = diversify_places(
        selected,
        interests,
    )

    # --------------------------------------------------------
    # Remove duplicate place names
    # --------------------------------------------------------

    unique_selected = []
    seen_names = set()

    for place in selected:

        name = (
            place.get("name")
            or ""
        ).strip().lower()

        if not name:
            continue

        if name in seen_names:
            continue

        seen_names.add(name)
        unique_selected.append(
            place
        )

    selected = unique_selected

    sections = []

    index = 0
    previous = None

    total_cost = 0
    total_distance = 0
    total_travel_minutes = 0

    used_restaurant_names = set()

    # --------------------------------------------------------
    # MORNING
    # --------------------------------------------------------

    morning_items = []

    start_hour = 9
    start_minute = 0

    for _ in range(
        min(
            2,
            len(selected) - index,
        )
    ):

        place = selected[index]

        item = activity_item(
            place,
            start_hour,
            start_minute,
            previous,
            travelers,
        )

        item["reason"] = (
            "Morning sightseeing selected "
            "to start the day with a suitable "
            "nearby attraction."
        )

        morning_items.append(item)

        start_hour, start_minute = add_minutes(
            start_hour,
            start_minute,
            item["duration_minutes"]
            + item["travel_time_minutes"]
            + 15,
        )

        previous = place

        total_cost += item[
            "estimated_cost"
        ]

        total_distance += item[
            "travel_distance_km"
        ]

        total_travel_minutes += item[
            "travel_time_minutes"
        ]

        index += 1

    if morning_items:
        sections.append(
            {
                "period": "Morning",
                "icon": "🌅",
                "items": morning_items,
            }
        )

    # --------------------------------------------------------
    # AFTERNOON
    # --------------------------------------------------------

    afternoon_items = []

    lunch_restaurant = choose_meal_restaurant(
        restaurants,
        previous,
        used_restaurant_names,
    )

    lunch = make_meal_item(
        "Lunch",
        13,
        0,
        travelers,
        budget_level,
        lunch_restaurant,
        previous,
    )

    if lunch_restaurant:
        used_restaurant_names.add(
            lunch_restaurant.get(
                "name"
            )
        )

    afternoon_items.append(
        lunch
    )

    total_cost += lunch[
        "estimated_cost"
    ]

    start_hour = 14
    start_minute = 0

    for _ in range(
        min(
            2,
            len(selected) - index,
        )
    ):

        place = selected[index]

        item = activity_item(
            place,
            start_hour,
            start_minute,
            previous,
            travelers,
        )

        item["reason"] = (
            "Afternoon attraction selected "
            "to keep travel within the same "
            "geographic area."
        )

        afternoon_items.append(
            item
        )

        start_hour, start_minute = add_minutes(
            start_hour,
            start_minute,
            item["duration_minutes"]
            + item["travel_time_minutes"]
            + 15,
        )

        previous = place

        total_cost += item[
            "estimated_cost"
        ]

        total_distance += item[
            "travel_distance_km"
        ]

        total_travel_minutes += item[
            "travel_time_minutes"
        ]

        index += 1

    sections.append(
        {
            "period": "Afternoon",
            "icon": "☀️",
            "items": afternoon_items,
        }
    )

    # --------------------------------------------------------
    # EVENING
    # --------------------------------------------------------

    evening_items = []

    start_hour = 17
    start_minute = 0

    for _ in range(
        min(
            1,
            len(selected) - index,
        )
    ):

        place = selected[index]

        item = activity_item(
            place,
            start_hour,
            start_minute,
            previous,
            travelers,
        )

        item["reason"] = (
            "Evening stop selected to continue "
            "the route without unnecessary "
            "backtracking."
        )

        evening_items.append(
            item
        )

        previous = place

        total_cost += item[
            "estimated_cost"
        ]

        total_distance += item[
            "travel_distance_km"
        ]

        total_travel_minutes += item[
            "travel_time_minutes"
        ]

        index += 1

    if evening_items:
        sections.append(
            {
                "period": "Evening",
                "icon": "🌆",
                "items": evening_items,
            }
        )

    # --------------------------------------------------------
    # SUNSET
    # --------------------------------------------------------
    # IMPORTANT:
    # Select an unused scenic place.
    # This prevents the same place appearing twice.

    used_place_names = {
        (
            item.get("name")
            or ""
        ).strip().lower()
        for section in sections
        for item in section.get(
            "items",
            [],
        )
        if item.get("type") != "meal"
    }

    sunset_candidates = [
        place
        for place in selected
        if (
            place.get(
                "travel_category"
            )
            in {
                "beach",
                "nature",
                "culture",
            }
        )
        and (
            place.get("name")
            or ""
        ).strip().lower()
        not in used_place_names
    ]

    # Prefer beaches for sunset,
    # then nature, then culture.

    sunset_candidates.sort(
        key=lambda place: (
            0
            if place.get(
                "travel_category"
            ) == "beach"
            else 1
            if place.get(
                "travel_category"
            ) == "nature"
            else 2
        )
    )

    sunset_place = (
        sunset_candidates[0]
        if sunset_candidates
        else None
    )

    if sunset_place:

        item = activity_item(
            sunset_place,
            18,
            30,
            previous,
            travelers,
        )

        item["reason"] = (
            "Recommended sunset location based "
            "on its scenic beach, nature or "
            "heritage character."
        )

        sections.append(
            {
                "period": "Sunset",
                "icon": "🌅",
                "items": [item],
            }
        )

        total_distance += item[
            "travel_distance_km"
        ]

        total_travel_minutes += item[
            "travel_time_minutes"
        ]

    # --------------------------------------------------------
    # NIGHT / DINNER
    # --------------------------------------------------------

    dinner_restaurant = choose_meal_restaurant(
        restaurants,
        previous,
        used_restaurant_names,
    )

    dinner = make_meal_item(
        "Dinner",
        20,
        0,
        travelers,
        budget_level,
        dinner_restaurant,
        previous,
    )

    if dinner_restaurant:
        used_restaurant_names.add(
            dinner_restaurant.get(
                "name"
            )
        )

    sections.append(
        {
            "period": "Night",
            "icon": "🌙",
            "items": [dinner],
        }
    )

    total_cost += dinner[
        "estimated_cost"
    ]

    return {
        "sections": sections,
        "total_cost": round(
            total_cost,
            2,
        ),
        "total_distance_km": round(
            total_distance,
            2,
        ),
        "total_travel_minutes": (
            total_travel_minutes
        ),
    }


def diversify_places(
    places: List[Dict[str, Any]],
    interests: List[str],
) -> List[Dict[str, Any]]:

    if len(places) <= 2:
        return places

    result = []
    used_categories = set()

    for place in places:

        category = place.get(
            "travel_category",
            "sightseeing",
        )

        if category not in used_categories:

            result.append(place)
            used_categories.add(
                category
            )

    for place in places:

        if place not in result:
            result.append(place)

    return result


def flatten_sections(
    sections: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:

    activities = []

    for section in sections:

        for item in section[
            "items"
        ]:

            activities.append(item)

    return activities


def make_day_title(
    destination: str,
    day_number: int,
    places: List[Dict[str, Any]],
) -> str:

    categories = [
        place.get(
            "travel_category"
        )
        for place in places
    ]

    name = destination.strip()

    if "beach" in categories:

        if "culture" in categories:
            return (
                f"{name} — "
                "Coast + Culture"
            )

        return (
            f"{name} — "
            "Beaches & Coastal Explore"
        )

    if "culture" in categories:
        return (
            f"{name} — "
            "Heritage & Culture"
        )

    if "nature" in categories:
        return (
            f"{name} — "
            "Nature & Scenic Explore"
        )

    if "shopping" in categories:
        return (
            f"{name} — "
            "Explore & Shopping"
        )

    return (
        f"{name} — Explore"
    )


# ============================================================
# BUDGET SUMMARY
# ============================================================

def calculate_budget_summary(
    itinerary_days: List[Dict[str, Any]],
    total_budget: Optional[float],
    accommodation: Dict[str, Any],
    travelers: int,
) -> Dict[str, Any]:

    meal_min = 0
    meal_max = 0

    known_attraction_total = 0
    unknown_cost_items = 0

    for day in itinerary_days:

        for item in day.get(
            "activities",
            [],
        ):

            if item.get("type") == "meal":

                meal_min += (
                    item.get(
                        "cost_min"
                    )
                    or 0
                )

                meal_max += (
                    item.get(
                        "cost_max"
                    )
                    or 0
                )

            elif item.get(
                "cost_known"
            ):

                known_attraction_total += (
                    item.get(
                        "estimated_cost"
                    )
                    or 0
                )

            else:

                unknown_cost_items += 1

    accommodation_min = (
        accommodation.get(
            "total_min",
            0,
        )
    )

    accommodation_max = (
        accommodation.get(
            "total_max",
            0,
        )
    )

    known_min = (
        meal_min
        + known_attraction_total
        + accommodation_min
    )

    known_max = (
        meal_max
        + known_attraction_total
        + accommodation_max
    )

    if total_budget is None:

        return {
            "budget_provided": False,
            "total_budget": None,
            "estimated_total": round(
                (
                    known_min
                    + known_max
                ) / 2,
                2,
            ),
            "estimated_min": round(
                known_min,
                2,
            ),
            "estimated_max": round(
                known_max,
                2,
            ),
            "remaining": None,
            "within_budget": None,
            "costs_complete": (
                unknown_cost_items == 0
            ),
            "unknown_cost_items": (
                unknown_cost_items
            ),
            "message": (
                "Your itinerary uses transparent "
                "price ranges. Some attraction "
                "ticket prices are not available, "
                "so they are not counted as ₹0."
            ),
        }

    remaining_min = round(
        total_budget - known_min,
        2,
    )

    remaining_max = round(
        total_budget - known_max,
        2,
    )

    if known_max <= total_budget:

        message = (
            "The current accommodation + "
            "meal + known-entry estimate fits "
            "within your budget. Some attraction "
            "prices are still unpriced and should "
            "be checked before booking."
        )

    elif known_min <= total_budget < known_max:

        message = (
            "Your budget falls inside the "
            "estimated cost range. Actual "
            "spending will depend on hotel "
            "and meal choices, dates and "
            "attraction fees."
        )

    else:

        message = (
            "The current estimated range is "
            "above your budget. TripPilot "
            "should reduce hotel, meal or "
            "paid-activity choices before "
            "finalizing the plan."
        )

    return {
        "budget_provided": True,
        "total_budget": total_budget,
        "estimated_total": round(
            (
                known_min
                + known_max
            ) / 2,
            2,
        ),
        "estimated_min": round(
            known_min,
            2,
        ),
        "estimated_max": round(
            known_max,
            2,
        ),
        "remaining_min": remaining_min,
        "remaining_max": remaining_max,
        "remaining": round(
            (
                remaining_min
                + remaining_max
            ) / 2,
            2,
        ),
        "within_budget": (
            known_max <= total_budget
        ),
        "costs_complete": (
            unknown_cost_items == 0
        ),
        "unknown_cost_items": (
            unknown_cost_items
        ),
        "message": message,
    }


# ============================================================
# ITINERARY GENERATION
# ============================================================

@app.post("/api/itinerary/generate")
async def generate_itinerary(
    request: ItineraryRequest,
):

    # --------------------------------------------------------
    # 1. Validate request
    # --------------------------------------------------------

    if not request.destination.strip():

        raise HTTPException(
            status_code=400,
            detail="Destination is required.",
        )

    # --------------------------------------------------------
    # 2. Resolve destination
    # --------------------------------------------------------

    if (
        request.latitude is not None
        and request.longitude is not None
    ):

        latitude = request.latitude
        longitude = request.longitude

    else:

        location = await geocode_destination(
            request.destination
        )

        latitude = location[
            "latitude"
        ]

        longitude = location[
            "longitude"
        ]

    # --------------------------------------------------------
    # 3. Fetch places
    # --------------------------------------------------------

    places = await fetch_nearby_places(
        latitude,
        longitude,
        radius=10000,
        limit=100,
    )

    # --------------------------------------------------------
    # 4. Prepare candidates
    # --------------------------------------------------------

    interests = normalized_interests(
        request.interests
    )

    prepared_places = (
        classify_and_prepare_places(
            places,
            request.travelers,
            interests,
        )
    )

    restaurants = prepare_restaurants(
        places,
        interests,
    )

    # --------------------------------------------------------
    # 5. Sort
    # --------------------------------------------------------

    prepared_places.sort(
        key=lambda place: (
            -place[
                "interest_score"
            ],
            place.get(
                "distance_km",
                999,
            ),
        )
    )

    # --------------------------------------------------------
    # 6. Select geographic groups
    # --------------------------------------------------------

    actual_days = choose_day_count(
        request.days,
        len(prepared_places),
    )

    day_groups = select_places_for_days(
        prepared_places,
        actual_days,
        request.travelers,
        interests,
        request.budget,
    )

    # --------------------------------------------------------
    # 7. Build days
    # --------------------------------------------------------

    itinerary_days = []

    for index, group in enumerate(
        day_groups,
        start=1,
    ):

        day_plan = build_day_sections(
            group,
            request.travelers,
            actual_days,
            request.budget,
            interests,
            request.pace or "Balanced",
            restaurants,
        )

        sections = day_plan[
            "sections"
        ]

        activities = flatten_sections(
            sections
        )

        itinerary_days.append(
            {
                "day": index,
                "title": make_day_title(
                    request.destination,
                    index,
                    group,
                ),
                "sections": sections,
                "activities": activities,
                "activity_count": len(
                    activities
                ),
                "estimated_cost": (
                    day_plan[
                        "total_cost"
                    ]
                ),
                "estimated_distance_km": (
                    day_plan[
                        "total_distance_km"
                    ]
                ),
                "estimated_travel_minutes": (
                    day_plan[
                        "total_travel_minutes"
                    ]
                ),
            }
        )

    # --------------------------------------------------------
    # 8. Accommodation
    # --------------------------------------------------------

    nights = max(
        0,
        actual_days - 1,
    )

    budget_level = choose_budget_level(
        request.budget,
        request.travelers,
        actual_days,
    )

    accommodation = accommodation_range(
        request.destination,
        budget_level,
        nights,
        request.travelers,
    )

    # --------------------------------------------------------
    # 9. Budget summary
    # --------------------------------------------------------

    budget_summary = (
        calculate_budget_summary(
            itinerary_days,
            request.budget,
            accommodation,
            request.travelers,
        )
    )

    # --------------------------------------------------------
    # 10. Final response
    # --------------------------------------------------------

    return {
        "success": True,
        "planner": (
            "TripPilot Expert "
            "Travel Manager"
        ),
        "destination": request.destination,
        "resolved_location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "days_requested": request.days,
        "days_planned": actual_days,
        "travelers": request.travelers,
        "travel_type": request.travel_type,
        "interests": request.interests,
        "pace": request.pace,
        "budget": request.budget,
        "budget_level": budget_level,
        "accommodation": accommodation,
        "budget_summary": budget_summary,
        "planning_notes": [
            "Places are grouped to reduce unnecessary travel.",
            "Meal breaks use realistic per-person planning ranges instead of a flat ₹1,000 amount.",
            "Accommodation is shown as a nightly range rather than a fake fixed hotel price.",
            "Attraction tickets are never displayed as ₹0 unless the location is classified as free/open access.",
            "When a reliable attraction ticket price is unavailable, TripPilot shows 'Price not available' and does not count it as free.",
            "Hospitals, pharmacies, hotels and transport locations are excluded from sightseeing recommendations.",
            "Restaurants and cafes are used only for meal stops.",
            "Suspicious or warning-style listings are excluded before itinerary classification.",
            "The same sightseeing place is not intentionally reused as the sunset stop.",
            "Travel times are estimates and may vary with real traffic.",
            "The itinerary prioritizes realistic travel rather than maximizing the number of attractions.",
        ],
        "itinerary": itinerary_days,
    }