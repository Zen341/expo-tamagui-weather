import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToastController } from "@tamagui/toast";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import CustomSafeAreaView from "components/CustomSafeAreaView";
import WeatherDailyCard from "components/WeatherDailyCard";
import WeatherHourlyCard from "components/WeatherHourlyCard";
import WeatherIcon from "components/WeatherIcon";
import { ASYNC_STORAGE_KEYS, QUERY_KEYS } from "constants/key";
import { format } from "date-fns";
import * as Location from "expo-location";
import { useRefreshByUser } from "hooks/useRefreshByUser";
import { useRefreshOnFocus } from "hooks/useRefreshOnFocus";
import { SafeJsonParse } from "lib/json";
import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import {
  getWeather,
  getWeatherCodeLabel,
  WeatherDataType,
} from "services/openmeteo";
import {
  Anchor,
  Button,
  Card,
  H1,
  Paragraph,
  ScrollView,
  Spinner,
  Theme,
  useTheme,
  XStack,
  YStack,
} from "tamagui";

export default function TabOneScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const today = new Date();
  // This state is only used to force a re-render when the next hour arrives
  const [hourTick, setHourTick] = useState(0);
  const toast = useToastController();

  const getWeatherDataFromCache = async (location: Location.LocationObject) => {
    const now = Date.now();
    const stringCacheWeatherData = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.CACHE_WEATHER
    );
    const stringCacheWeatherTime = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.CACHE_WEATHER_TIME
    );
    const cacheWeatherData = stringCacheWeatherData
      ? (SafeJsonParse(stringCacheWeatherData) as WeatherDataType)
      : null;
    const cacheWeatherTime = stringCacheWeatherTime
      ? Number(stringCacheWeatherTime)
      : 0;

    if (
      !stringCacheWeatherData ||
      !stringCacheWeatherTime ||
      now - cacheWeatherTime > 60 * 60 * 1000
    ) {
      const weatherData = await getWeather(
        location.coords.latitude!,
        location.coords.longitude!
      );
      if (weatherData) {
        AsyncStorage.setItem(
          ASYNC_STORAGE_KEYS.CACHE_WEATHER,
          JSON.stringify(weatherData)
        );
        AsyncStorage.setItem(
          ASYNC_STORAGE_KEYS.CACHE_WEATHER_TIME,
          now.toString()
        );
      }
      return weatherData || cacheWeatherData;
    } else {
      return cacheWeatherData;
    }
  };

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocation(null);
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setErrorMsg(null);
  }

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Schedule refresh exactly at the next hour
  useEffect(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(now.getHours() + 1);

    const msUntilNextHour = nextHour.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      // Force a re-render → triggers useMemo to recompute
      setHourTick((v) => v + 1);
    }, msUntilNextHour);

    return () => clearTimeout(timeout);
  }, [hourTick]);

  const {
    data: weatherData,
    isLoading: isLoadingWeather,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.WEATHER, location],
    queryFn: () => {
      return getWeatherDataFromCache(location!);
    },
    enabled: !!location,
    placeholderData: keepPreviousData,
    // 1 hour
    // staleTime: 60 * 60 * 1000,
  });

  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const weatherCode = weatherData?.weatherData.current.weather_code;
  const weatherHourly = useMemo(() => {
    const hourly = weatherData?.weatherData.hourly;

    if (!hourly) {
      return [];
    }

    // --- Next full hour ---
    const now = new Date();
    const nextHourDate = new Date(now);
    nextHourDate.setMinutes(0, 0, 0);
    nextHourDate.setHours(now.getHours() + 1);

    // --- Find first hourly entry that is >= next full hour ---
    const startIndex = hourly.time.findIndex((t) => {
      const date = t instanceof Date ? t : new Date(t);
      return date >= nextHourDate;
    });

    if (startIndex === -1) return [];

    // --- Build 24-hour slice ---
    const items = Array.from({ length: 24 }, (_, i) => {
      const idx = startIndex + i;

      return {
        time: hourly.time[idx],
        temperature_2m: hourly?.temperature_2m?.[idx],
        weather_code: hourly?.weather_code?.[idx],
      };
    }).filter((item) => item.time !== undefined);

    return items;
  }, [weatherData, hourTick]);

  const weatherDaily = useMemo(() => {
    const daily = weatherData?.weatherData.daily;

    if (!daily) {
      return [];
    }

    const count = daily?.time.length || 0;
    if (count === 0) {
      return [];
    }

    return Array.from({ length: count }, (_, i) => {
      const time = daily.time[i];
      const temperature_2m_max = daily?.temperature_2m_max?.[i];
      const temperature_2m_min = daily?.temperature_2m_min?.[i];
      const weather_code = daily?.weather_code?.[i];
      return {
        time,
        temperature_2m_max,
        temperature_2m_min,
        weather_code,
      };
    });
  }, [weatherData]);

  if (!location && !!errorMsg) {
    return (
      <YStack
        items={"center"}
        gap="$8"
        px="$10"
        pt="$5"
        bg="$background"
        flex={1}
      >
        <Paragraph color={theme.red1}>{errorMsg}</Paragraph>
        <Button onPress={getCurrentLocation}>Grant Location Permission</Button>
      </YStack>
    );
  }

  if (isLoadingWeather) {
    return (
      <YStack
        items={"center"}
        gap="$8"
        px="$10"
        pt="$5"
        bg="$background"
        flex={1}
      >
        <Spinner size="large" />
      </YStack>
    );
  }

  return (
    <CustomSafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingByUser}
            onRefresh={refetchByUser}
          />
        }
        p="$5"
      >
        <YStack gap={"$4"}>
          <Card bordered pt="$2" pb="$3" px="$3">
            <YStack>
              <XStack justify={"space-between"} items={"center"} gap={"$2"}>
                <H1>
                  {weatherData?.weatherData.current.temperature_2m.toFixed(0)}
                  &#8451;
                </H1>
                <YStack items={"center"}>
                  <Paragraph>{format(today, "dd/MM/yyyy")}</Paragraph>
                  <XStack items={"center"} gap={"$1"}>
                    <WeatherIcon weatherCode={weatherCode} />
                    <Paragraph>{getWeatherCodeLabel(weatherCode)}</Paragraph>
                  </XStack>
                </YStack>
              </XStack>
              <FlatList
                horizontal
                data={weatherHourly}
                renderItem={({ item, index }) => (
                  <WeatherHourlyCard
                    {...item}
                    cardProps={{
                      ml: index === 0 ? 0 : "$2",
                    }}
                  />
                )}
                keyExtractor={(item) => item.time.toString()}
              />
            </YStack>
          </Card>

          <Card bordered py="$3" px="$3">
            {weatherDaily.map((item, index) => (
              <WeatherDailyCard
                {...item}
                key={index}
                cardProps={{
                  mt: index === 0 ? 0 : "$2",
                }}
              />
            ))}
          </Card>

          <Theme name="red">
            <Button
              onPress={async () => {
                await AsyncStorage.multiRemove([
                  ASYNC_STORAGE_KEYS.CACHE_WEATHER,
                  ASYNC_STORAGE_KEYS.CACHE_WEATHER_TIME,
                ]);
                toast.show("Cache cleared!");
              }}
            >
              Clear Cache
            </Button>
          </Theme>

          <Anchor
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            text={"center"}
          >
            Weather data by Open-Meteo.com
          </Anchor>
        </YStack>
      </ScrollView>
    </CustomSafeAreaView>
  );
}
