import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLink, NativeStack } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";

import * as PourStore from "../../storage/PourStore";
import LogForm from "../../components/LogForm";

export default function NewPourScreen() {
  const link = useLink();

  return (
    <>
      <NativeStack.Screen
        options={{
          title: "Log a new pour",
          headerLeft: () => (
            <BorderlessButton
              style={{
                marginTop: Platform.OS === "android" ? 4 : 2,
                marginRight: Platform.OS === "android" ? 20 : 0,
              }}
              borderless={false}
              onPress={() => {
                link.back();
              }}
            >
              <AntDesign name="close" size={24} color="black" />
            </BorderlessButton>
          ),
        }}
      />
      <LogForm
        onSave={async (data) => {
            // TODO: verify it was successful
            await PourStore.createAsync({
              date_time: data.dateTime.getTime(),
              rating: data.rating,
              photo_url: data.photoUri,
              notes: data.notes,
            });

          // Go back to tabs from the modal
          link.push("/");
        }}
      />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
