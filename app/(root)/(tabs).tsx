import { Tabs, NativeStack } from "expo-router";

export default function TabsContainer() {
  return (
    <>
      <Tabs>
        <Tabs.Screen name="(home)" options={{ headerShown: false }} />
        <Tabs.Screen name="reference" options={{ title: "Reference" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
      <NativeStack.Screen options={{ headerShown: false }} />
    </>
  );
}
