import { NativeStack, useLink, Children } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import format from "date-fns/format";

import * as PourStore from "~/storage/PourStore";
import { AntDesign } from "~/components/Themed";

export default function DetailsLayout({ route }) {
  const link = useLink();
  const pour = PourStore.usePour(route.params?.id);

  return (
    <>
      <NativeStack.Screen
        options={{
          title: null,
          headerRight: () => (
            <BorderlessButton
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              onPress={() => {
                link.push(`/${route.params.id}`);
              }}
            >
              <AntDesign name="edit" size={24} />
            </BorderlessButton>
          ),
        }}
      />
      <Children />
    </>
  );
}
