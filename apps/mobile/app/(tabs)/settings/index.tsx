import { useState } from "react";
import { Button, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as StoreReview from 'expo-store-review';

import { setTheme, Theme } from "~/modules/expo-settings";

import { isLocalFile } from "~/storage/fs";
import * as PourStore from "~/storage/PourStore";
import * as Alert from "~/utils/alert";
import { DebugTools, ApplicationInfo, AuthButton } from "~/components/Settings";
import { List, ListItem, ListSeparator } from "~/components/Lists";
import {
  AntDesign,
  ScrollView,
  useTheme,
  useUnresolvedTheme,
} from "~/components/Themed";
import { Margin, Padding } from "~/constants/styles";
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
        lightColor="#f2f2f2"
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: "100%", paddingTop: Padding[5] }}
      >
        <AuthButton />

        <List>
          <View style={{ marginTop: Margin[1] }} />
          <ListItem title="Rate the app" onPress={() => StoreReview.requestReview()} />
          <UploadPhotosButton disabled={!session} />
          <ListSeparator />
          <ListItem
            title="Upload data to server"
            disabled={!session}
            renderIcon={() => <AntDesign name="upload" size={24} />}
            renderRight={() => null}
            subtitle="Uploads all data to the server. This will overwrite any data on the server."
            onPress={() => maybeUploadDatabaseAsync()}
          />
          <ListSeparator />
          <ListItem
            title="Download data from server"
            disabled={!session}
            renderRight={() => null}
            renderIcon={() => <AntDesign name="download" size={24} />}
            subtitle="Downloads all data from the server. This will overwrite any local data."
            onPress={() => maybeDownloadDabaseAsync()}
          />
          <ListSeparator />
          <ListItem
            title={theme === "dark" ? "Use light theme" : "Use dark theme"}
            renderRight={() => null}
            renderIcon={() => <AntDesign name="bulb1" size={24} />}
            subtitle="Changes the theme of the app."
            onPress={() => {
              setTheme(theme === "dark" ? Theme.Light : Theme.Dark);
            }}
          />
          <ListSeparator />
          <ListItem
            title={
              unresolvedTheme === Theme.System
                ? "Disable using system theme"
                : "Use system theme"
            }
            renderRight={() => null}
            renderIcon={() => <AntDesign name="iconfontdesktop" size={24} />}
            onPress={() => {
              setTheme(
                unresolvedTheme === Theme.System ? Theme.Light : Theme.System
              );
            }}
          />
          <View style={{ marginBottom: Margin[1] }} />
        </List>

        <ApplicationInfo
          onTripleTap={() => setShowDebugTools(!showDebugTools)}
        />
        {showDebugTools ? <DebugTools /> : null}
      </ScrollView>
    </>
  );
}

function UploadPhotosButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const pours = PourStore.usePours();
  const numPoursWithLocalPhotos = pours.filter((p) =>
    isLocalFile(p.photoUrl)
  ).length;

  const word = numPoursWithLocalPhotos === 1 ? "photo" : "photos";
  const message =
    numPoursWithLocalPhotos === 0
      ? `All ${word} are synced`
      : `${numPoursWithLocalPhotos} ${word} not yet synced`;

  return (
    <ListItem
      onPress={() => router.navigate("/settings/upload")}
      title="Upload photos"
      disabled={disabled}
      renderIcon={() => <AntDesign name="picture" size={24} />}
      subtitle={message}
    />
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

function getPoursWithLocalPhotos() {
  return PourStore.all().filter((pour) => isLocalFile(pour.photoUrl));
}

async function maybeUploadDatabaseAsync() {
  const poursWithLocalPhotos = getPoursWithLocalPhotos();

  // Just take care of this automatically in next pass, move photo upload to debug tools
  if (poursWithLocalPhotos.length > 0) {
    Alert.error({
      message: "Please upload all photos before uploading the database",
    });
    return;
  }

  const user = await getUserAsync();

  try {
    const { error } = await supabase
      .from("snapshots")
      .insert({ data: PourStore.toJSON(), user_id: user.id });
    if (!error) {
      Alert.success({ message: "Data uploaded successfully" });
    } else {
      Alert.error({
        message: `Data upload failed: ${error.message}`,
      });
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
    Alert.error({
      message: `Unable to fetch data: ${error.message}`,
    });
  } else {
    // Access the data column of the most recent row (if any)
    const mostRecentData = data.length > 0 ? data[0].data : null;
    await PourStore.loadExternalJSONAsync(mostRecentData);
    Alert.success({
      message: "The latest snapshot has been downloaded and loaded",
    });
  }
}
