import { useState } from "react";
import { Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { setTheme, Theme } from "expo-settings";

import { isLocalFile } from "~/storage/fs";
import * as PourStore from "~/storage/PourStore";
import Button from "~/components/Button";
import { DebugTools, ApplicationInfo } from "~/components/Settings";
import {
  ScrollView,
  Text,
  View,
  useTheme,
  useUnresolvedTheme,
} from "~/components/Themed";
import { FontSize, Padding, TailwindColor } from "~/constants/styles";
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

function getPoursWithLocalPhotos() {
  return PourStore.all().filter((pour) => isLocalFile(pour.photoUrl));
}
