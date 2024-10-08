import { ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Stack } from "expo-router";
import { RectButton } from "react-native-gesture-handler";
import prettyBytes from "pretty-bytes";
import format from "date-fns/format";

import * as PourStore from "~/storage/PourStore";
import Photo from "~/components/Photo";
import { AntDesign, FlatList, Text, View } from "~/components/Themed";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import { supabase, useAuthSession } from "~/storage/supabase";
import {
  getLocalPhotoInfoAsync,
  getPathToPhoto,
  isLocalFile,
} from "~/storage/fs";

const PhotoRow = ({ item, uploadRequested }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const session = useAuthSession();

  useEffect(() => {
    async function getFileInfoAsync() {
      try {
        const info = await getLocalPhotoInfoAsync(item.photoUrl);
        setFileInfo({
          error: null,
          size: prettyBytes(info.size),
          modificationTime: format(
            new Date(info.modificationTime * 1000),
            "PPPPpppp",
          ),
        });
      } catch (e) {
        setFileInfo({ size: null, modificationTime: null, error: e.message });
      }
    }

    if (!fileInfo) {
      getFileInfoAsync();
    }
  }, [fileInfo, item.photoUrl]);

  useEffect(() => {
    if (isUploading) {
      if (!session) {
        alert("You need to be signed in to upload photos.");
        setIsUploading(false);
        return;
      }

      syncPhotoAsync(item, session.user.id);
    }
  }, [isUploading, item, session]);

  // Trigger uploading from the parent component
  useEffect(() => {
    console.log(uploadRequested);
    if (uploadRequested && !isUploading) {
      setIsUploading(true);
    }
  }, [uploadRequested, isUploading]);

  return (
    <RectButton
      enabled={!isUploading}
      onPress={() => {
        setIsUploading(true);
      }}
      style={{
        padding: Padding[3],
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          opacity: isUploading ? 0.5 : 1,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Photo
            uri={item.photoUrl}
            containerStyle={[StyleSheet.absoluteFill]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            {isUploading ? (
              <ActivityIndicator size="large" color={TailwindColor["white"]} />
            ) : (
              <AntDesign name="upload" size={30} color={TailwindColor.white} />
            )}
          </View>
        </View>
        <View style={{ flex: 1, paddingLeft: Padding[3], padding: Padding[2] }}>
          <Text style={{ marginBottom: Margin[1] }}>{item.photoUrl}</Text>
          <Text style={{ fontWeight: "bold" }}>
            {fileInfo?.size ?? "Unknown"}
          </Text>
          <Text style={{ color: TailwindColor["gray-500"] }}>
            Last modified on {fileInfo?.modificationTime ?? "Unknown"}
          </Text>

          {fileInfo?.error ? (
            <Text style={{ color: TailwindColor["red-400"] }}>
              {fileInfo.error}
            </Text>
          ) : null}
        </View>
      </View>
    </RectButton>
  );
};

function EmptyState() {
  return (
    <View style={{ flex: 1, padding: Padding[3] }}>
      <View
        style={{
          borderRadius: 10,
          padding: Padding[4],
          paddingVertical: Padding[6],
          backgroundColor: TailwindColor["green-100"],
        }}
      >
        <Text
          style={{
            fontSize: FontSize.xxl,
            textAlign: "center",
            color: TailwindColor["green-800"],
          }}
        >
          ✅ All photos are synced!
        </Text>
      </View>
    </View>
  );
}

export default function Upload() {
  const [uploadAll, setUploadAll] = useState(false);
  const pours = PourStore.usePours();
  const poursWithLocalPhotos = pours.filter((pour) =>
    isLocalFile(pour.photoUrl),
  );
  const session = useAuthSession();

  useEffect(() => {
    if (uploadAll && poursWithLocalPhotos.length === 0) {
      setUploadAll(false);
    }
  }, [uploadAll, poursWithLocalPhotos.length]);

  const renderItem = ({ item }) => (
    <PhotoRow item={item} uploadRequested={uploadAll} />
  );

  return (
    <>
      <Stack.Screen options={{ title: "Upload photos" }} />
      <FlatList
        data={poursWithLocalPhotos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={uploadAll}
        ListEmptyComponent={EmptyState}
        style={{ flex: 1 }}
      />
      <View
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          padding: Padding[3],
        }}
      >
        <RectButton
          onPress={() => {
            if (!session) {
              alert("You need to be signed in to upload photos.");
              return;
            }
            setUploadAll(true);
          }}
          enabled={poursWithLocalPhotos.length > 0 && !uploadAll}
          style={{
            flex: 1,
            backgroundColor:
              uploadAll || poursWithLocalPhotos.length === 0
                ? TailwindColor["gray-200"]
                : TailwindColor["blue-100"],
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color:
                uploadAll || poursWithLocalPhotos.length === 0
                  ? TailwindColor["gray-500"]
                  : TailwindColor["blue-500"],
              textAlign: "center",
              fontSize: FontSize.lg,
            }}
          >
            Upload all photos
          </Text>
        </RectButton>
      </View>
    </>
  );
}

async function syncPhotoAsync(pour: PourStore.PourRecord, userId: string) {
  try {
    const url = await uploadImageAsync(pour.photoUrl, userId);
    PourStore.updateAsync(pour.id, { ...pour, photoUrl: url });
  } catch (e) {
    alert(e.message);
  }
}

async function uploadImageAsync(filename: string, userId: string) {
  const extension = filename.split(".").pop();
  const destination = `${userId}/${uuid()}.${extension}`;

  const formData = new FormData();
  const photo = {
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
