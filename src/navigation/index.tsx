import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/** Root Navigator - a modal stack that contains all other navigators **/
import TabNavigator from "./TabNavigator";
import LogFormScreen from "../screens/LogFormScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen component={TabNavigator} name="Tabs" />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen component={LogFormScreen} name="LogForm" />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
