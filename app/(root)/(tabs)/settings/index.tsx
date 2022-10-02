import { ScrollView, Alert, Text, StyleSheet } from "react-native";
import * as Application from "expo-application";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { NativeStack, useLink } from "expo-router";

import * as db from "~/storage/db";
import * as PourStore from "~/storage/PourStore";
import Button from "~/components/Button";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";

export default function Settings() {
  const link = useLink();

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

        <Button
          title="Upload photos"
          onPress={() => link.push("/settings/upload")}
        />

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
    marginBottom: Margin[4],
    color: TailwindColor["gray-700"],
    fontSize: FontSize.xxl,
    textAlign: "center",
  },
});
