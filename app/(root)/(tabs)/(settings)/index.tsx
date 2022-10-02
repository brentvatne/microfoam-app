import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Alert,
  Text,
  StyleSheet,
  View,
} from "react-native";
import * as Application from "expo-application";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { v4 as uuid } from "uuid";
import { BorderlessButton } from "react-native-gesture-handler";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { NativeStack } from "expo-router";

import * as db from "~/storage/db";
import * as PourStore from "~/storage/PourStore";
import { getPathToPhoto, isLocalFile } from "~/storage/fs";
import { supabase } from "~/storage/supabase";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";

function Button({
  onPress,
  title,
  disabled,
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <BorderlessButton
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
      enabled={!disabled}
      onPress={onPress}
    >
      <Text
        style={{
          color: disabled
            ? TailwindColor["gray-500"]
            : TailwindColor["blue-500"],
          fontSize: FontSize.xl,
          marginBottom: Margin[3],
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </BorderlessButton>
  );
}

function ImageUploadTool() {
  const [isUploading, setIsUploading] = useState(false);
  const pours = PourStore.usePours();
  const numPoursWithLocalPhotos = pours.filter((p) =>
    isLocalFile(p.photo_url)
  ).length;

  const word = numPoursWithLocalPhotos === 1 ? "photo" : "photos";

  const message =
    numPoursWithLocalPhotos === 0
      ? `✅ All ${word} are synced`
      : isUploading
      ? `Uploading... ${numPoursWithLocalPhotos} ${word} remaining`
      : `⚠️ ${numPoursWithLocalPhotos} ${word} not yet synced`;

  return (
    <View style={{ flexDirection: "column", alignItems: "center" }}>
      <Button
        title="Upload photos"
        onPress={async () => {
          try {
            setIsUploading(true);
            await uploadImagesAsync();
          } catch (e) {
            alert(e.message);
          } finally {
            setIsUploading(false);
          }
        }}
        disabled={isUploading || numPoursWithLocalPhotos === 0}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 3,
        }}
      >
        {isUploading ? (
          <ActivityIndicator
            size="small"
            style={{ marginTop: -5, marginRight: 5, alignSelf: "flex-start" }}
          />
        ) : null}
        <Text
          style={{ marginTop: -5, marginBottom: 15, fontSize: FontSize.lg }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

export default function Settings() {
  return (
    <>
      <NativeStack.Screen options={{ title: "Settings" }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: TailwindColor.white }}
        contentContainerStyle={{
          minHeight: "100%",
          backgroundColor: "white",
        }}
      >
        <Text style={[styles.header, { marginTop: Margin[7] }]}>
          Data Management
        </Text>

        <ImageUploadTool />

        <Button
          title="Export data as JSON"
          onPress={() => exportDatabaseAsync()}
        />
        <Button
          title="Import database from JSON"
          onPress={() => importDatabaseAsync()}
        />

        <Text style={styles.header}>Debug tools</Text>

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

        <Button
          title="Drop and create database"
          onPress={() => {
            PourStore.destroyAll();
            db.clear();
          }}
        />

        <Button
          title="Check for update"
          onPress={async () => {
            const result = await Updates.fetchUpdateAsync();
            if (result.isNew) {
              Alert.alert(
                "New update available",
                "Restart the app to apply the update",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Restart", onPress: () => Updates.reloadAsync() },
                ],
                { cancelable: true }
              );
            } else {
              alert("No update available");
            }
          }}
        />

        <Text style={styles.header}>Debug info</Text>
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
    </>
  );
}

async function uploadImageAsync(filename: string) {
  const extension = filename.split(".").pop();
  const destination = `${uuid()}.${extension}`;
  // const resizedImage = await manipulateAsync(
  //   getPathToPhoto(filename),
  //   [{ resize: { width: 400 } }],
  //   { compress: 0.5, format: SaveFormat.JPEG }
  // );

  const formData = new FormData();
  const photo = {
    // uri: resizedImage.uri,
    uri: getPathToPhoto(filename),
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
  const poursToUpload = pours.filter((p) => isLocalFile(p.photo_url));

  await Promise.all(
    poursToUpload.map(async (pour) => {
      try {
        const url = await uploadImageAsync(pour.photo_url);
        PourStore.updateAsync(pour.id, { ...pour, photo_url: url });
      } catch (e) {
        alert(e.message);
      } finally {
        // ..
      }
    })
  );

  alert("All images are synced");
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

const styles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    marginTop: Margin[5],
    marginBottom: Margin[3],
    color: TailwindColor["gray-700"],
    fontSize: FontSize.xxl,
    textAlign: "center",
  },
});
