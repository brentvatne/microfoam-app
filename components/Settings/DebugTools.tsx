import { Alert, StyleSheet } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";

import { isLocalFile } from "~/storage/fs";
import * as PourStore from "~/storage/PourStore";
import Button from "~/components/Button";
import { Text } from "~/components/Themed";
import { FontSize, Margin } from "~/constants/styles";

export default function DebugTools() {
  return (
    <>
      <Text style={styles.header}>Debug tools</Text>

      <Button
        title="Re-generate blurhashes"
        onPress={() => regenerateBlurhashesAsync()}
      />

      <Button
        title="Export data as JSON"
        onPress={() => maybeExportDatabaseAsync()}
      />

      <Button
        title="Import database from JSON"
        onPress={() => importDatabaseAsync()}
      />

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
              { text: "OK", onPress: () => PourStore.destroyAllAsync() },
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
                  PourStore.destroyAllAsync();
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
    </>
  );
}

async function regenerateBlurhashesAsync() {
  const pours = PourStore.all().filter((pour) => !pour.blurhash);
  for (const pour of pours) {
    console.log(`before: ${JSON.stringify(pour)}`);
    const result = await PourStore.regenerateBlurhashAsync(pour);
    console.log(`after: ${JSON.stringify(result)}`);
  }
  alert(`done! ${pours.length} blurhashes regenerated`);
}

function getPoursWithLocalPhotos() {
  return PourStore.all().filter((pour) => isLocalFile(pour.photoUrl));
}

async function maybeExportDatabaseAsync() {
  const poursWithLocalPhotos = getPoursWithLocalPhotos();

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

async function importDatabaseAsync() {
  const result = await DocumentPicker.getDocumentAsync();
  if (result.type === "success") {
    const data = await FileSystem.readAsStringAsync(result.uri);
    try {
      PourStore.loadExternalJSONAsync(data);
      alert("Imported data successfully");
    } catch (e) {
      alert("Import failed");
    }
  }
}

const styles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    marginTop: Margin[5],
    marginBottom: Margin[4],
    fontSize: FontSize.xxl,
    textAlign: "center",
  },
});
