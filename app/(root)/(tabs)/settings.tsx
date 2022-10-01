import { ScrollView, Alert, Button, Text, View } from "react-native";
import * as Application from "expo-application";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { v4 as uuid } from "uuid";

import * as db from "../../../storage/db";
import * as PourStore from "../../../storage/PourStore";
import { supabase } from "../../../storage/supabase";
import { FontSize, Margin, TailwindColor } from "../../../constants/styles";

export default function Settings() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: TailwindColor.white }}
      contentContainerStyle={{
        minHeight: "100%",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Button
        title="Clear data"
        onPress={() => {
          Alert.alert(
            "Clear data?",
            "Are you sure you want to clear all data?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              { text: "OK", onPress: () => PourStore.destroyAll() },
            ],
            { cancelable: false }
          );
        }}
      />

      <Button title="Upload images" onPress={() => uploadImagesAsync()} />
      <Button
        title="Drop and create database"
        onPress={() => {
          PourStore.destroyAll();
          db.clear();
        }}
      />
      <Button
        title="Export data as JSON"
        onPress={() => exportDatabaseAsync()}
      />
      <Button
        title="Import database from JSON"
        onPress={() => importDatabaseAsync()}
      />

      <Text
        style={{
          fontWeight: "bold",
          marginTop: Margin[5],
          marginBottom: Margin[1],
          color: TailwindColor["gray-700"],
          fontSize: FontSize.lg,
          textAlign: "center",
        }}
      >
        Debug info
      </Text>
      <Text
        style={{
          marginTop: Margin[1],
          fontSize: FontSize.base,
          textAlign: "center",
          color: TailwindColor["gray-700"],
        }}
      >
        Version: {Application.nativeApplicationVersion} (
        {Application.nativeBuildVersion})
      </Text>
      <Text
        style={{
          marginTop: Margin[1],
          fontSize: FontSize.base,
          textAlign: "center",
          color: TailwindColor["gray-700"],
        }}
      >
        ID: {Updates.updateId ?? "(no update id)"}
      </Text>
      <Text
        style={{
          fontSize: FontSize.base,
          textAlign: "center",
          color: TailwindColor["gray-700"],
          marginTop: Margin[1],
        }}
      >
        Released: {Updates.manifest.createdAt ?? "(no release date)"}
      </Text>
    </ScrollView>
  );
}

async function uploadImageAsync(localUri: string) {
  // TODO: resize image, none of this 2mb image nonsense
  const filename = localUri.split("/").pop();
  const extension = filename.split(".").pop();
  const destination = `${uuid()}.${extension}`;

  const formData = new FormData();
  const photo = {
    uri: localUri,
    name: filename,
    type: `image/${extension}`,
  };
  // @ts-ignore: formData expects a string or Blob here
  formData.append("file", photo);

  console.log(`uploading ${filename} to ${destination}`);

  let { error } = await supabase.storage
    .from("photos")
    .upload(destination, formData);

  if (error) {
    throw error;
  }

  // TODO: is this stable? probably not, need to get public url from supabase each time?
  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(destination);

  return publicUrl;
}

async function uploadImagesAsync() {
  console.log("uploading...");
  // upload PourStore photos to supabase
  const pours = PourStore.all();
  await Promise.all(
    pours.map(async (pour) => {
      if (!pour.photo_url?.startsWith("https://")) {
        console.log(`uploading ${pour.photo_url}`);
        const url = await uploadImageAsync(pour.photo_url);
        console.log(`done uploading: ${url}`);
        PourStore.updateAsync(pour.id, { ...pour, photo_url: url });
      }
    })
  );

  alert("All images are backed up");
}

async function importDatabaseAsync() {
  const result = await DocumentPicker.getDocumentAsync();
  console.log(result);
  if (result.type === "success") {
    const data = await FileSystem.readAsStringAsync(result.uri);
    console.log(data);
    try {
      PourStore.loadFromJSON(data);
      alert("Imported data successfully");
    } catch (e) {
      alert("Import failed");
    }
  }
}

async function exportDatabaseAsync() {
  const data = PourStore.toJSON();
  const backupUri = `${FileSystem.cacheDirectory}backup.json`;
  try {
    await FileSystem.writeAsStringAsync(backupUri, data);
    await Sharing.shareAsync(backupUri, { mimeType: "text/json" });
  } catch (e) {
    alert(e.message);
  }
}
