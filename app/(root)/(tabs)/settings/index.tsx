import { Alert, Text, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import * as Application from "expo-application";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { NativeStack, useLink } from "expo-router";

import * as db from "~/storage/db";
import { isLocalFile } from "~/storage/fs";
import * as PourStore from "~/storage/PourStore";
import Button from "~/components/Button";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";
import { useAuthSession } from "~/storage/supabase";

function AuthButton() {
  const session = useAuthSession();
  const link = useLink();

  if (session) {
    return (
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <Button
          title="Manage session"
          onPress={() => link.push("/settings/auth")}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 3,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              marginTop: -10,
              marginBottom: 15,
              fontSize: FontSize.lg,
              color: TailwindColor["gray-600"],
            }}
          >
            Signed in as{" "}
            <Text style={{ fontWeight: "bold" }}>{session.user.email}</Text>
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <Button title="Sign in" onPress={() => link.push("/settings/auth")} />
    );
  }
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

        <AuthButton />

        <UploadButton />

        <Button
          title="Export data as JSON"
          onPress={() => maybeExportDatabaseAsync()}
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
              "All data will be lost. Make sure you have backed up anything important first!",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                { text: "OK", onPress: () => PourStore.destroyAll() },
              ],
              { cancelable: true }
            );
          }}
        />

        <Button
          title="Drop and re-initialize database"
          onPress={() => {
            Alert.alert(
              "Drop and re-initialize database?",
              "All data will be lost. Make sure you have backed up anything important first!",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: () => {
                    PourStore.destroyAll();
                    db.clear();
                  },
                },
              ],
              { cancelable: true }
            );
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

function UploadButton() {
  const link = useLink();
  const pours = PourStore.usePours();
  const numPoursWithLocalPhotos = pours.filter((p) =>
    isLocalFile(p.photo_url)
  ).length;

  const word = numPoursWithLocalPhotos === 1 ? "photo" : "photos";
  const message =
    numPoursWithLocalPhotos === 0
      ? `✅ All ${word} are synced`
      : `⚠️ ${numPoursWithLocalPhotos} ${word} not yet synced`;

  return (
    <View style={{ flexDirection: "column", alignItems: "center" }}>
      <Button
        title="Upload photos"
        onPress={() => link.push("/settings/upload")}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 3,
        }}
      >
        <Text
          style={{
            marginTop: -10,
            marginBottom: 15,
            fontSize: FontSize.lg,
            color: TailwindColor["gray-600"],
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
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

async function maybeExportDatabaseAsync() {
  const pours = PourStore.all();
  const poursWithLocalPhotos = pours.filter((pour) =>
    isLocalFile(pour.photo_url)
  );

  if (poursWithLocalPhotos.length > 0) {
    Alert.alert(
      `${poursWithLocalPhotos.length} ${
        poursWithLocalPhotos.length === 1 ? "photo is" : "photos are"
      } not uploaded yet`,
      "If you proceed with the export, these photos won't point to publicly accessible web URLs. Do you want to proceed anyways?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Proceed with export", onPress: () => exportDatabaseAsync() },
      ],
      { cancelable: true }
    );
    return;
  } else {
    exportDatabaseAsync();
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
    marginBottom: Margin[4],
    color: TailwindColor["gray-700"],
    fontSize: FontSize.xxl,
    textAlign: "center",
  },
});
