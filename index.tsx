import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

// Side effect
import * as db from "./src/storage/db";

// Must be exported or Fast Refresh won't update the context module
export function App() {
  // @ts-ignore
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
