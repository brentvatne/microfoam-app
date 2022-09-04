import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogFormScreen from '../screens/LogFormScreen';

const Stack = createNativeStackNavigator();

export default function ModalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={LogFormScreen}
        name="New Log"
      />
    </Stack.Navigator>
  );
}
