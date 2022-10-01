import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLink, NativeStack } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";

import * as PourStore from "~/storage/PourStore";
import LogForm from "~/components/LogForm";
import { TailwindColor } from "~/constants/styles";

export default function EditPourScreen({ route }) {
  const id = route.params?.id;
  const link = useLink();
  const pours = PourStore.all();
  const pour = pours.find((p) => p.id === parseInt(id, 10));

  return (
    <>
      <NativeStack.Screen
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
                link.back();
              }}
            >
              <AntDesign
                name="close"
                size={24}
                color={TailwindColor["blue-500"]}
              />
            </BorderlessButton>
          ),
        }}
      />
      <LogForm
        initialData={pour}
        onSave={async (data) => {
          // TODO: verify it was successful
          await PourStore.updateAsync(id, {
            id: id,
            date_time: data.dateTime.getTime(),
            rating: data.rating,
            photo_url: data.photoUri,
            notes: data.notes,
          });

          // Go back to tabs from the modal
          link.back();
        }}
      />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
