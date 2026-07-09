import type {
   CombinedWeatherData,
   ForecastApiResponse,
   ForecastCurrent,
   ForecastCurrentUnits,
   GeocodingApiResponse,
   GeocodingResult,
} from "../types/weather";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const FORECAST_CURRENT_FIELDS =
   "precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code";

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === "object" && value !== null;
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
   if (!isRecord(value)) {
      return false;
   }

   return (
      typeof value.name === "string" &&
      typeof value.latitude === "number" &&
      typeof value.longitude === "number" &&
      typeof value.country_code === "string" &&
      typeof value.timezone === "string"
   );
}

function isForecastCurrent(value: unknown): value is ForecastCurrent {
   if (!isRecord(value)) {
      return false;
   }

   return (
      typeof value.temperature_2m === "number" &&
      typeof value.relative_humidity_2m === "number" &&
      typeof value.apparent_temperature === "number" &&
      typeof value.is_day === "number" &&
      typeof value.wind_speed_10m === "number" &&
      typeof value.wind_direction_10m === "number" &&
      typeof value.precipitation_probability === "number" &&
      typeof value.precipitation === "number" &&
      typeof value.weather_code === "number"
   );
}

function isForecastCurrentUnits(value: unknown): value is ForecastCurrentUnits {
   if (!isRecord(value)) {
      return false;
   }

   return (
      typeof value.temperature_2m === "string" &&
      typeof value.relative_humidity_2m === "string" &&
      typeof value.apparent_temperature === "string" &&
      typeof value.is_day === "string" &&
      typeof value.wind_speed_10m === "string" &&
      typeof value.wind_direction_10m === "string" &&
      typeof value.precipitation_probability === "string" &&
      typeof value.precipitation === "string" &&
      typeof value.weather_code === "string"
   );
}

export async function searchCity(cityName: string): Promise<GeocodingResult | null> {
   const normalizedCity = cityName.trim();

   if (!normalizedCity) {
      return null;
   }

   const params = new URLSearchParams({
      name: normalizedCity,
      count: "1",
      language: "pt",
      format: "json",
   });

   try {
      const response = await fetch(`${GEOCODING_ENDPOINT}?${params.toString()}`);

      if (!response.ok) {
         return null;
      }

      const payload: unknown = (await response.json()) as GeocodingApiResponse;

      if (!isRecord(payload) || !Array.isArray(payload.results) || payload.results.length === 0) {
         return null;
      }

      const firstResult = payload.results[0];

      if (!isGeocodingResult(firstResult)) {
         return null;
      }

      return {
         name: firstResult.name,
         latitude: firstResult.latitude,
         longitude: firstResult.longitude,
         country_code: firstResult.country_code,
         timezone: firstResult.timezone,
      };
   } catch {
      return null;
   }
}

export async function getWeather(
   latitude: number,
   longitude: number,
   timezone: string
): Promise<{ current: ForecastCurrent; current_units: ForecastCurrentUnits } | null> {
   if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone.trim()) {
      return null;
   }

   const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: FORECAST_CURRENT_FIELDS,
      timezone: timezone.trim(),
   });

   try {
      const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`);

      if (!response.ok) {
         return null;
      }

      const payload: unknown = (await response.json()) as ForecastApiResponse;

      if (
         !isRecord(payload) ||
         !isForecastCurrent(payload.current) ||
         !isForecastCurrentUnits(payload.current_units)
      ) {
         return null;
      }

      return {
         current: payload.current,
         current_units: payload.current_units,
      };
   } catch {
      return null;
   }
}

export async function searchWeather(cityName: string): Promise<CombinedWeatherData | null> {
   const city = await searchCity(cityName);

   if (!city) {
      return null;
   }

   const weather = await getWeather(city.latitude, city.longitude, city.timezone);

   if (!weather) {
      return null;
   }

   return {
      name: city.name,
      country_code: city.country_code,
      timezone: city.timezone,
      latitude: city.latitude,
      longitude: city.longitude,
      current: weather.current,
      current_units: weather.current_units,
   };
}
