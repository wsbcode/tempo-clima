export interface GeocodingResult {
   name: string;
   latitude: number;
   longitude: number;
   country_code: string;
   timezone: string;
}

export interface GeocodingApiResponse {
   results?: GeocodingResult[];
}

export interface ForecastCurrent {
   temperature_2m: number;
   relative_humidity_2m: number;
   apparent_temperature: number;
   is_day: number;
   wind_speed_10m: number;
   wind_direction_10m: number;
   precipitation_probability: number;
   precipitation: number;
   weather_code: number;
}

export interface ForecastCurrentUnits {
   temperature_2m: string;
   relative_humidity_2m: string;
   apparent_temperature: string;
   is_day: string;
   wind_speed_10m: string;
   wind_direction_10m: string;
   precipitation_probability: string;
   precipitation: string;
   weather_code: string;
}

export interface ForecastApiResponse {
   current?: ForecastCurrent;
   current_units?: ForecastCurrentUnits;
}

export interface CombinedWeatherData {
   name: string;
   country_code: string;
   timezone: string;
   latitude: number;
   longitude: number;
   current: ForecastCurrent;
   current_units: ForecastCurrentUnits;
}
