import { Tabs, NativeStack } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function TabsContainer() {
  return (
    <>
      <Tabs>
        <Tabs.Screen
          name="(home)"
          options={{
            headerShown: false,
            title: "Pours",
            tabBarIcon: ({ color, size }) => {
              return <AntDesign name="rest" size={size} color={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="reference"
          options={{
            title: "Reference",
            tabBarIcon: ({ color, size }) => {
              return <AntDesign name="book" size={size} color={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => {
              return <AntDesign name="setting" size={size} color={color} />;
            },
          }}
        />
      </Tabs>
      <NativeStack.Screen options={{ headerShown: false }} />
    </>
  );
}
