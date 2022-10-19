import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, RootContainer } from "expo-router";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { ThemeColors } from "~/constants/colors";

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ThemeColors.dark.tint,
    text: "#fff",
    notification: "#fff",
  },
};

export default function Root() {
  return (
    <>
      <ContainerConfiguration />
      <Stack screenOptions={{ presentation: "modal" }} />
    </>
  );
}

function ContainerConfiguration() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === "light" ? "dark" : "light"} />
      <RootContainer
        theme={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}
      />
    </>
  );
}
