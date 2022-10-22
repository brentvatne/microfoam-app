import { Stack, useLink, Children } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";

import { AntDesign } from "~/components/Themed";

export default function DetailsLayout({ route }) {
  const link = useLink();

  return (
    <>
      <Stack.Screen
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
