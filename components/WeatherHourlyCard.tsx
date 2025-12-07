import { format } from "date-fns";
import { Card, Paragraph, Theme, YStack } from "tamagui";
import WeatherIcon from "./WeatherIcon";
import { CardProps } from "tamagui";

interface Props {
  time: Date;
  temperature_2m: number | null | undefined;
  weather_code: number | null | undefined;
  cardProps?: CardProps;
}

const WeatherHourlyCard: React.FC<Props> = ({
  time,
  temperature_2m,
  weather_code,
  cardProps,
}) => {
  return (
    <Theme name={"blue"}>
      <Card bordered py="$1" px="$2" {...cardProps}>
        <YStack items={"center"}>
          <Paragraph>{format(time, "HH:mm")}</Paragraph>
          <WeatherIcon weatherCode={weather_code} />
          <Paragraph>{temperature_2m?.toFixed(0)}&#8451;</Paragraph>
        </YStack>
      </Card>
    </Theme>
  );
};

export default WeatherHourlyCard;
