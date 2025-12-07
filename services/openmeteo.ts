import { fetchWeatherApi } from "openmeteo";

export type WeatherDataType = {
  latitude: number;
  longitude: number;
  elevation: number;
  utcOffsetSeconds: number;
  weatherData: {
    current: {
      time: Date;
      temperature_2m: number;
      weather_code: number;
    };
    hourly: {
      time: Date[];
      temperature_2m: Float32Array<ArrayBufferLike> | null;
      weather_code: Float32Array<ArrayBufferLike> | null;
    };
    daily: {
      time: Date[];
      temperature_2m_max: Float32Array<ArrayBufferLike> | null;
      temperature_2m_min: Float32Array<ArrayBufferLike> | null;
      weather_code: Float32Array<ArrayBufferLike> | null;
    };
  };
};

export const getWeather = async (
  lat: number,
  lon: number
): Promise<WeatherDataType | null> => {
  if (!lat || !lon) {
    return null;
  }

  const params = {
    latitude: lat,
    longitude: lon,
    daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
    hourly: ["temperature_2m", "weather_code"],
    current: ["temperature_2m", "weather_code"],
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const latitude = response.latitude();
  const longitude = response.longitude();
  const elevation = response.elevation();
  const utcOffsetSeconds = response.utcOffsetSeconds();

  const current = response.current()!;
  const hourly = response.hourly()!;
  const daily = response.daily()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: current.variables(0)!.value(),
      weather_code: current.variables(1)!.value(),
    },
    hourly: {
      time: Array.from(
        {
          length:
            (Number(hourly.timeEnd()) - Number(hourly.time())) /
            hourly.interval(),
        },
        (_, i) =>
          new Date(
            (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) *
              1000
          )
      ),
      temperature_2m: hourly.variables(0)!.valuesArray(),
      weather_code: hourly.variables(1)!.valuesArray(),
    },
    daily: {
      time: Array.from(
        {
          length:
            (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
        },
        (_, i) =>
          new Date(
            (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
              1000
          )
      ),
      temperature_2m_max: daily.variables(0)!.valuesArray(),
      temperature_2m_min: daily.variables(1)!.valuesArray(),
      weather_code: daily.variables(2)!.valuesArray(),
    },
  };

  return {
    latitude,
    longitude,
    elevation,
    utcOffsetSeconds,
    weatherData,
  };
};

/*
	Weather code
	WMO Weather interpretation codes (WW)
	Code	Description
	0	Clear sky
	1, 2, 3	Mainly clear, partly cloudy, and overcast
	45, 48	Fog and depositing rime fog
	51, 53, 55	Drizzle: Light, moderate, and dense intensity
	56, 57	Freezing Drizzle: Light and dense intensity
	61, 63, 65	Rain: Slight, moderate and heavy intensity
	66, 67	Freezing Rain: Light and heavy intensity
	71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
	77	Snow grains
	80, 81, 82	Rain showers: Slight, moderate, and violent
	85, 86	Snow showers slight and heavy
	95 *	Thunderstorm: Slight or moderate
	96, 99 *	Thunderstorm with slight and heavy hail
	(*) Thunderstorm forecast with hail is only available in Central Europe
*/
export enum WeatherCode {
  ClearSky = 0,
  MainlyClear = 1,
  PartlyCloudy = 2,
  Overcast = 3,
  Fog = 45,
  FogDepositingRimeFog = 48,
  DrizzleLight = 51,
  DrizzleModerate = 53,
  DrizzleDense = 55,
  FreezingDrizzleLight = 56,
  FreezingDrizzleHeavy = 57,
  RainSlight = 61,
  RainModerate = 63,
  RainHeavy = 65,
  FreezingRainLight = 66,
  FreezingRainHeavy = 67,
  SnowFallSlight = 71,
  SnowFallModerate = 73,
  SnowFallHeavy = 75,
  SnowGrains = 77,
  RainShowersSlight = 80,
  RainShowersModerate = 81,
  RainShowersViolent = 82,
  SnowShowersSlight = 85,
  SnowShowersHeavy = 86,
  ThunderstormSlight = 95,
  ThunderstormModerate = 96,
  ThunderstormHeavy = 99,
}

export const WeatherCodeLabel: Record<WeatherCode, string> = {
  [WeatherCode.ClearSky]: "Clear sky",
  [WeatherCode.MainlyClear]: "Mainly clear",
  [WeatherCode.PartlyCloudy]: "Partly cloudy",
  [WeatherCode.Overcast]: "Overcast",
  [WeatherCode.Fog]: "Fog",
  [WeatherCode.FogDepositingRimeFog]: "Depositing rime fog",
  [WeatherCode.DrizzleLight]: "Light drizzle",
  [WeatherCode.DrizzleModerate]: "Moderate drizzle",
  [WeatherCode.DrizzleDense]: "Dense drizzle",
  [WeatherCode.FreezingDrizzleLight]: "Light freezing drizzle",
  [WeatherCode.FreezingDrizzleHeavy]: "Heavy freezing drizzle",
  [WeatherCode.RainSlight]: "Slight rain",
  [WeatherCode.RainModerate]: "Moderate rain",
  [WeatherCode.RainHeavy]: "Heavy rain",
  [WeatherCode.FreezingRainLight]: "Light freezing rain",
  [WeatherCode.FreezingRainHeavy]: "Heavy freezing rain",
  [WeatherCode.SnowFallSlight]: "Slight snow fall",
  [WeatherCode.SnowFallModerate]: "Moderate snow fall",
  [WeatherCode.SnowFallHeavy]: "Heavy snow fall",
  [WeatherCode.SnowGrains]: "Snow grains",
  [WeatherCode.RainShowersSlight]: "Slight rain showers",
  [WeatherCode.RainShowersModerate]: "Moderate rain showers",
  [WeatherCode.RainShowersViolent]: "Violent rain showers",
  [WeatherCode.SnowShowersSlight]: "Slight snow showers",
  [WeatherCode.SnowShowersHeavy]: "Heavy snow showers",
  [WeatherCode.ThunderstormSlight]: "Slight thunderstorm",
  [WeatherCode.ThunderstormModerate]: "Moderate thunderstorm",
  [WeatherCode.ThunderstormHeavy]: "Heavy thunderstorm",
};

export const getWeatherCodeLabel = (
  weatherCode: WeatherCode | null | undefined
) => {
  if (weatherCode === null || weatherCode === undefined) {
    return "--";
  }
  return WeatherCodeLabel[weatherCode];
};
