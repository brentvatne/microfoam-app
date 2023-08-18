import { useRef } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, Stack, useSearchParams } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";

import * as PourStore from "~/storage/PourStore";
import LogForm, { LogFormHandle } from "~/components/LogForm";
import { AntDesign } from "~/components/Themed";

export default function EditPourScreen() {
  const params = useSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const pour = PourStore.usePour(id);
  const ref = useRef<LogFormHandle>(null);

  const handleSaveAsync = async (data) => {
    await PourStore.updateAsync(id, {
      id,
      dateTime: data.dateTime.getTime(),
      rating: data.rating,
      photoUrl: data.photoUri,
      notes: data.notes,
      pattern: data.pattern,
    });

    // Go back to tabs from the modal
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit pour",
          headerLeft: () => (
            <BorderlessButton
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={{
                marginTop: Platform.OS === "android" ? 4 : 3,
                marginRight: Platform.OS === "android" ? 20 : 0,
              }}
              borderless={false}
              onPress={() => {
                router.back();
              }}
            >
              <AntDesign name="close" size={24} />
            </BorderlessButton>
          ),
          headerRight: () => (
            <BorderlessButton
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={{
                marginTop: Platform.OS === "android" ? 4 : 3,
              }}
              borderless={false}
              onPress={() => {
                const data = ref?.current?.getData();
                if (data) {
                  handleSaveAsync(data);
                }
              }}
            >
              <AntDesign name="check" size={24} />
            </BorderlessButton>
          ),
        }}
      />
      <LogForm
        initialData={pour}
        ref={ref}
        onSave={handleSaveAsync}
        onDelete={() => {
          PourStore.destroy({ id });
          router.push("/");
        }}
      />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
