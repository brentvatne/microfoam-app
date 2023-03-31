import { Alert, StyleSheet } from "react-native";
import * as Application from "expo-application";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { Stack, useRouter } from "expo-router";
import { setTheme, Theme } from "expo-settings";

import { isLocalFile } from "~/storage/fs";
import * as PourStore from "~/storage/PourStore";
import Button from "~/components/Button";
import { ScrollView, Text, View } from "~/components/Themed";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";
import { useAuthSession } from "~/storage/supabase";

function AuthButton() {
  const session = useAuthSession();
  const router = useRouter();

  if (session) {
    return (
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <Button
          title="Manage session"
          onPress={() => router.push("/settings/auth")}
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
            darkColor={TailwindColor["gray-400"]}
            lightColor={TailwindColor["gray-600"]}
            numberOfLines={1}
            style={{
              marginTop: -10,
              marginBottom: 15,
              fontSize: FontSize.lg,
            }}
          >
            Signed in as{" "}
            <Text
              darkColor={TailwindColor["gray-400"]}
              lightColor={TailwindColor["gray-600"]}
              style={{ fontWeight: "bold" }}
            >
              {session.user.email}
            </Text>
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <Button title="Sign in" onPress={() => router.push("/settings/auth")} />
    );
  }
}

export default function Settings() {
  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: "100%" }}
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
          title="Use light theme"
          onPress={() => {
            setTheme(Theme.Light);
          }}
        />

        <Button
          title="Use dark theme"
          onPress={() => {
            setTheme(Theme.Dark);
          }}
        />

        <Button
          title="Use system theme"
          onPress={() => {
            setTheme(Theme.System);
          }}
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

        <Text style={styles.header}>Debug info</Text>
        <Text
          darkColor={TailwindColor["gray-100"]}
          lightColor={TailwindColor["gray-700"]}
          style={{
            marginTop: Margin[1],
            fontSize: FontSize.base,
            textAlign: "center",
          }}
        >
          Version: {Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion})
        </Text>
        <Text
          darkColor={TailwindColor["gray-100"]}
          lightColor={TailwindColor["gray-700"]}
          style={{
            marginTop: Margin[1],
            fontSize: FontSize.base,
            textAlign: "center",
          }}
        >
          ID: {Updates.updateId ?? "(no update id)"}
        </Text>
        <Text
          darkColor={TailwindColor["gray-100"]}
          lightColor={TailwindColor["gray-700"]}
          style={{
            fontSize: FontSize.base,
            textAlign: "center",
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
  const router = useRouter();
  const pours = PourStore.usePours();
  const numPoursWithLocalPhotos = pours.filter((p) =>
    isLocalFile(p.photoUrl)
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
        onPress={() => router.push("/settings/upload")}
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
          darkColor={TailwindColor["gray-400"]}
          lightColor={TailwindColor["gray-600"]}
          style={{
            marginTop: -10,
            marginBottom: 15,
            fontSize: FontSize.lg,
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

async function maybeExportDatabaseAsync() {
  const pours = PourStore.all();
  const poursWithLocalPhotos = pours.filter((pour) =>
    isLocalFile(pour.photoUrl)
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

function Header({ children }) {
  return (
    <Text
      darkColor={TailwindColor["gray-100"]}
      lightColor={TailwindColor["gray-700"]}
      style={styles.header}
    >
      {children}
    </Text>
  );
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
