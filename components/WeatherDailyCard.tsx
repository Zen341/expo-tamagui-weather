import { Card, Paragraph, Theme, XStack } from "tamagui";
import WeatherIcon from "./WeatherIcon";
import { format, isSameDay } from "date-fns";

interface Props {
  time: Date;
  temperature_2m_max: number | null | undefined;
  temperature_2m_min: number | null | undefined;
  weather_code: number | null | undefined;
  cardProps?: React.ComponentProps<typeof Card>;
}

const WeatherDailyCard: React.FC<Props> = ({
  time,
  temperature_2m_max,
  temperature_2m_min,
  weather_code,
  cardProps,
}) => {
  const renderTime = (time: Date) => {
    const today = new Date();
    if (isSameDay(time, today)) {
      return "Today";
    }
    return format(time, "EEEE");
  };

  return (
    <Theme name={"blue"}>
      <Card bordered py="$2" px="$3" {...cardProps}>
        <XStack justify={"space-between"} gap={"$2"}>
          <Paragraph>{renderTime(time)}</Paragraph>
          <XStack gap={"$2"}>
            <WeatherIcon weatherCode={weather_code} />
            <Paragraph>
              {temperature_2m_max?.toFixed(0)}&deg;/
              {temperature_2m_min?.toFixed(0)}
              &deg;
            </Paragraph>
          </XStack>
        </XStack>
      </Card>
    </Theme>
  );
};

export default WeatherDailyCard;
