// Open-Meteo: fully free, no API key, no signup. Forecast horizon is 16
// days, which is exactly why trip dates are capped there (see lib/dates.ts).

export type WeatherCondition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export type DailyWeather = {
  date: string; // ISO YYYY-MM-DD
  tempMaxC: number;
  tempMinC: number;
  condition: WeatherCondition;
  label: string;
};

function conditionFromCode(code: number): { condition: WeatherCondition; label: string } {
  if (code === 0) return { condition: "clear", label: "Clear" };
  if (code === 1 || code === 2) return { condition: "clear", label: "Mostly sunny" };
  if (code === 3) return { condition: "cloudy", label: "Overcast" };
  if (code === 45 || code === 48) return { condition: "fog", label: "Foggy" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { condition: "rain", label: "Rainy" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: "snow", label: "Snowy" };
  if ([95, 96, 99].includes(code)) return { condition: "storm", label: "Thunderstorms" };
  return { condition: "cloudy", label: "Cloudy" };
}

/**
 * Best-effort daily forecast for a destination over a date range. Returns
 * null on any failure (geocoding miss, network error, dates outside the
 * forecast horizon) — callers should treat weather as optional context,
 * never a hard dependency for itinerary generation.
 */
export async function getDailyForecast(
  destination: string,
  startDate: string,
  endDate: string,
): Promise<DailyWeather[] | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    const place = geoData?.results?.[0];
    if (!place || typeof place.latitude !== "number") return null;

    const forecastRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${startDate}&end_date=${endDate}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!forecastRes.ok) return null;
    const forecastData = await forecastRes.json();
    const daily = forecastData?.daily;
    if (!daily?.time?.length) return null;

    return daily.time.map((date: string, i: number) => {
      const { condition, label } = conditionFromCode(daily.weather_code[i]);
      return {
        date,
        tempMaxC: Math.round(daily.temperature_2m_max[i]),
        tempMinC: Math.round(daily.temperature_2m_min[i]),
        condition,
        label,
      };
    });
  } catch {
    return null;
  }
}
