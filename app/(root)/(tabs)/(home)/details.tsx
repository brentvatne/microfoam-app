import { Text } from "react-native";
import { NativeStack, Link, Children } from "expo-router";
import { format } from "date-fns";

import { TailwindColor, FontSize } from "~/constants/styles";
import * as PourStore from "~/storage/PourStore";

export default function DetailsLayout({ route }) {
  const pour = PourStore.usePour(route.params?.id);

  return (
    <>
      <NativeStack.Screen
        options={{
          title: format(new Date(pour.date_time), "PPPP"),
          headerRight: () => (
            <Link href={`/${route.params.id}`} style={{ marginRight: 16 }}>
              <Text
                style={{
                  fontSize: FontSize.lg,
                  color: TailwindColor["blue-600"],
                }}
              >
                Edit
              </Text>
            </Link>
          ),
        }}
      />
      <Children />
    </>
  );
}
