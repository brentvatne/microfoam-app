import { Tabs, Stack } from "expo-router";
import { AntDesign } from "~/components/Themed";

export default function TabsContainer() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs>
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Pours",
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              return <AntDesign name="rest" size={size} color={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="reference"
          options={{
            // Hide the reference tab for now
            href: null,
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
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              return <AntDesign name="setting" size={size} color={color} />;
            },
          }}
        />
      </Tabs>
    </>
  );
}
