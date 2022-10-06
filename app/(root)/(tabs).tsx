import { Tabs, NativeStack } from "expo-router";
import { AntDesign } from "~/components/Themed";

export default function TabsContainer() {
  return (
    <>
      <NativeStack.Screen options={{ headerShown: false }} />
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
