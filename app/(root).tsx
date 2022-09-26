import { NativeStack } from "expo-router";

export default function Root() {
  return <NativeStack screenOptions={{ presentation: "modal" }} />;
}