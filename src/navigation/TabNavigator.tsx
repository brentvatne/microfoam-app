import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LogStack from "./LogStack";
import ReferenceScreen from "../screens/ReferenceScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Logs" component={LogStack} />
      <Tab.Screen name="Reference" component={ReferenceScreen} />
    </Tab.Navigator>
  );
}
