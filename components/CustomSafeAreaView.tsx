import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "tamagui";

const CustomSafeAreaView = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.background.val,
        flex: 1,
      }}
    >
      {children}
    </SafeAreaView>
  );
};

export default CustomSafeAreaView;
