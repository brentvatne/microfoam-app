// This file is a workaround for a bug in expo-dev-client that launches
// at a janky initial URL.

import { Redirect } from 'expo-router';

export default function App() {
  return <Redirect href="/" />
}