import { NativeStack, useLink, Children } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import format from "date-fns/format";

import { TailwindColor } from "~/constants/styles";
import * as PourStore from "~/storage/PourStore";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function DetailsLayout({ route }) {
  const link = useLink();
  const pour = PourStore.usePour(route.params?.id);

  return (
    <>
      <NativeStack.Screen
        options={{
          title: format(new Date(pour.date_time), "PPPP"),
          headerRight: () => (
            <BorderlessButton
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              onPress={() => {
                link.push(`/${route.params.id}`);
              }}
            >
              <AntDesign
                name="edit"
                size={24}
                color={TailwindColor["blue-500"]}
              />
            </BorderlessButton>
          ),
        }}
      />
      <Children />
    </>
  );
}
