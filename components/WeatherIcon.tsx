import { WeatherCode } from "services/openmeteo";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Snowflake,
  Sun,
} from "@tamagui/lucide-icons";

interface Props {
  weatherCode?: WeatherCode | null | undefined;
}

const WeatherIcon: React.FC<Props> = ({ weatherCode }) => {
  switch (weatherCode) {
    case WeatherCode.ClearSky:
    case WeatherCode.MainlyClear:
      return <Sun />;

    case WeatherCode.PartlyCloudy:
      return <CloudSun />;

    case WeatherCode.Overcast:
      return <Cloud />;

    case WeatherCode.Fog:
    case WeatherCode.FogDepositingRimeFog:
      return <CloudFog />;

    case WeatherCode.DrizzleLight:
    case WeatherCode.DrizzleModerate:
    case WeatherCode.DrizzleDense:
      return <CloudDrizzle />;

    case WeatherCode.FreezingDrizzleLight:
    case WeatherCode.FreezingDrizzleHeavy:
      return <CloudSnow />;

    case WeatherCode.RainSlight:
    case WeatherCode.RainModerate:
    case WeatherCode.RainHeavy:
      return <CloudRain />;

    case WeatherCode.FreezingRainLight:
    case WeatherCode.FreezingRainHeavy:
      return <CloudHail />;

    case WeatherCode.SnowFallSlight:
    case WeatherCode.SnowFallModerate:
    case WeatherCode.SnowFallHeavy:
      return <CloudSnow />;

    case WeatherCode.SnowGrains:
      return <Snowflake />;

    case WeatherCode.RainShowersSlight:
    case WeatherCode.RainShowersModerate:
    case WeatherCode.RainShowersViolent:
      return <CloudRainWind />;

    case WeatherCode.SnowShowersSlight:
    case WeatherCode.SnowShowersHeavy:
      return <CloudSnow />;

    case WeatherCode.ThunderstormSlight:
    case WeatherCode.ThunderstormModerate:
      return <CloudLightning />;

    default:
      return <></>;
  }
};

export default WeatherIcon;
