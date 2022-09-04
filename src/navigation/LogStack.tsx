import { Button } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogListScreen from "../screens/LogListScreen";

const Stack = createNativeStackNavigator();

export default function LogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={LogListScreen}
        name="LogList"
        options={({ navigation }) => ({
          title: "Logs",
          headerRight: () => (
            <Button
              onPress={() => navigation.navigate("LogForm")}
              title="New"
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}
