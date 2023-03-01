import { Stack, useRouter, Slot, useSearchParams } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";

import { AntDesign } from "~/components/Themed";

export default function DetailsLayout() {
  const params = useSearchParams();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: null,
          headerRight: () => (
            <BorderlessButton
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              onPress={() => {
                router.push(`/${params.id}`);
              }}
            >
              <AntDesign name="edit" size={24} />
            </BorderlessButton>
          ),
        }}
      />
      <Slot />
    </>
  );
}
