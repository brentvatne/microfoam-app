import { Alert, Button, View } from "react-native";
import * as PourStore from "../../../storage/PourStore";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

export default function Settings() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
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

      <Button
        title="Export data as JSON"
        onPress={() => exportDatabaseAsync()}
      />
      <Button
        title="Import database from JSON"
        onPress={() => importDatabaseAsync()}
      />
    </View>
  );
}

async function importDatabaseAsync() {
  const result = await DocumentPicker.getDocumentAsync();
  console.log(result);
  if (result.type === "success") {
    const data = await FileSystem.readAsStringAsync(result.uri);
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
