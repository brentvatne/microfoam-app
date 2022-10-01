import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import { useLink, NativeStack } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";

import * as PourStore from "../../storage/PourStore";
import NewLogForm from "../../components/NewLogForm";

async function ensureDirectoryExistsAsync(directory) {
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory);
  }
}

const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory}photos`;

async function copyPhotoToDocumentsAsync(uri) {
  const name = uri.split("/").pop();
  await ensureDirectoryExistsAsync(PHOTOS_DIRECTORY);
  const newPath = `${PHOTOS_DIRECTORY}/${name}`;
  await FileSystem.copyAsync({
    from: uri,
    to: newPath,
  });
  return newPath;
}

export default function LogFormScreen() {
  const link = useLink();

  return (
    <>
      <NativeStack.Screen
        options={{
          title: "Log a new pour",
          headerLeft: () => (
            <BorderlessButton
              style={{ marginTop: Platform.OS === 'android' ? 4 : 2, marginRight: Platform.OS === 'android' ? 20 : 0 }}
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
      <NewLogForm
        onCreate={async (data) => {
          const photoUri = await copyPhotoToDocumentsAsync(data.photoUri);

          // TODO: verify it was successful
          PourStore.create({
            date_time: data.dateTime.getTime(),
            rating: data.rating,
            photo_url: photoUri,
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
