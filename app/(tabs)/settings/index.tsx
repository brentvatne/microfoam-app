import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import * as Application from "expo-application";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { Stack, useRouter } from "expo-router";
import { setTheme, Theme } from "expo-settings";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { isLocalFile } from "~/storage/fs";
import * as PourStore from "~/storage/PourStore";
import Button from "~/components/Button";
import {
  ScrollView,
  Text,
  View,
  useTheme,
  useUnresolvedTheme,
} from "~/components/Themed";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import { supabase, useAuthSession } from "~/storage/supabase";

export default function Settings() {
  const session = useAuthSession();
  const theme = useTheme();
  const unresolvedTheme = useUnresolvedTheme();
  const [showDebugTools, setShowDebugTools] = useState(false);

  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: "100%", paddingTop: Padding[5] }}
      >
        <AuthButton />

        <UploadPhotosButton />
        <Button
          title="Upload data to server"
          disabled={!session}
          onPress={() => maybeUploadDatabaseAsync()}
        />
        <Button
          title="Download data from server"
          disabled={!session}
          onPress={() => maybeDownloadDabaseAsync()}
        />

        <Button
          title={theme === "dark" ? "Use light theme" : "Use dark theme"}
          onPress={() => {
            setTheme(theme === "dark" ? Theme.Light : Theme.Dark);
          }}
        />

        <Button
          title={
            unresolvedTheme === Theme.System
              ? "Disable using system theme"
              : "Use system theme"
          }
          onPress={() => {
            setTheme(
              unresolvedTheme === Theme.System ? Theme.Light : Theme.System
            );
          }}
        />

        <ApplicationInfo
          onTripleTap={() => setShowDebugTools(!showDebugTools)}
        />
        {showDebugTools ? <DebugTools /> : null}
      </ScrollView>
    </>
  );
}

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

function UploadPhotosButton() {
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

function ApplicationInfo({ onTripleTap }: { onTripleTap: () => void }) {
  const gesture = Gesture.Tap()
    .numberOfTaps(3)
    .runOnJS(true)
    .onStart(() => {
      onTripleTap();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View>
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
      </View>
    </GestureDetector>
  );
}

function DebugTools() {
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

async function getUserAsync() {
  // Get the current user
  const response = await supabase.auth.getUser();
  const user = response?.data?.user;

  // Check if the user is signed in
  if (!user) {
    console.error("User is not signed in");
    return;
  }

  return user;
}

async function maybeUploadDatabaseAsync() {
  const poursWithLocalPhotos = getPoursWithLocalPhotos();

  // Just take care of this automatically in next pass, move photo upload to debug tools
  if (poursWithLocalPhotos.length > 0) {
    Alert.alert(
      "Upload photos first",
      "Please upload all photos before uploading the database"
    );
    return;
  }

  const user = await getUserAsync();

  try {
    const { error } = await supabase
      .from("snapshots")
      .insert({ data: PourStore.toJSON(), user_id: user.id });
    if (!error) {
      Alert.alert("Success", "Data uploaded successfully");
    } else {
      Alert.alert("Error", `Data upload failed: ${error.message}`);
    }
  } catch (e) {
    alert(e.message);
  }
}

async function maybeDownloadDabaseAsync() {
  const user = await getUserAsync();

  const { data, error } = await supabase
    .from("snapshots")
    .select("data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching data:", error.message);
  } else {
    // Access the data column of the most recent row (if any)
    const mostRecentData = data.length > 0 ? data[0].data : null;
    await PourStore.loadExternalJSONAsync(mostRecentData);
    alert("Data downloaded successfully");
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

async function regenerateBlurhashesAsync() {
  const pours = PourStore.all().filter((pour) => !pour.blurhash);
  for (const pour of pours) {
    console.log(`before: ${JSON.stringify(pour)}`);
    const result = await PourStore.regenerateBlurhashAsync(pour);
    console.log(`after: ${JSON.stringify(result)}`);
  }
  alert(`done! ${pours.length} blurhashes regenerated`);
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
    fontSize: FontSize.xxl,
    textAlign: "center",
  },
});
