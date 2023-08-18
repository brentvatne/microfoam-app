import { useRef, useState } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, Stack } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import { AntDesign } from "~/components/Themed";

import * as PourStore from "~/storage/PourStore";
import LogForm, { LogFormHandle } from "~/components/LogForm";

export default function NewPourScreen() {
  const router = useRouter();
  const ref = useRef<LogFormHandle>(null);
  const [hasPickedPhoto, setHasPickedPhoto] = useState(false);
  const handleSaveAsync = async (data) => {
    if (!data.photoUri) {
      alert("A photo is required");
      return;
    }

    await PourStore.createAsync({
      dateTime: data.dateTime.getTime(),
      rating: data.rating,
      photoUrl: data.photoUri,
      notes: data.notes,
      pattern: data.pattern,
    });

    // Go back to tabs from the modal (not sure if desirable?)
    // router.push(`/details/${row.id}`);

    router.push(`/`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Log a new pour",
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
          // Maybe not worth including in new page right now
          headerRight: () =>
            hasPickedPhoto ? (
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
            ) : null,
        }}
      />
      <LogForm
        onSave={handleSaveAsync}
        onPickPhoto={() => {
          if (!hasPickedPhoto) {
            setHasPickedPhoto(true);
          }
        }}
        ref={ref}
      />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
