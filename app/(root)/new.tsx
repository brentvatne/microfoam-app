import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import { NativeStack } from "expo-router";

import * as PourStore from "../../src/storage/PourStore";
import NewLogForm from "../../src/forms/NewLogForm";

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

export default function LogFormScreen({ navigation }) {
  return (
    <>
      <NativeStack.Screen options={{ title: "Log a new pour" }} />
      <NewLogForm
        onCreate={async (data) => {
          const photoUri = await copyPhotoToDocumentsAsync(data.photoUri);

          // TODO: verify it was successful
          PourStore.create({
            date_time: data.dateTime.getTime(),
            rating: data.rating,
            photo_url: photoUri,
          });

          // Go back to tabs from the modal
          navigation.navigate("index");
        }}
      />

      <StatusBar style="light" />
    </>
  );
}
