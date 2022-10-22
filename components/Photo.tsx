import { useState } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { Blurhash } from "react-native-blurhash";
import { AnimatePresence, MotiView } from "moti";
import FastImage, { ResizeMode } from "react-native-fast-image";
import * as FileSystem from "expo-file-system";
import { TailwindColor } from "~/constants/colors";

import { PHOTOS_DIRECTORY, isLocalFile } from "~/storage/fs";

type Props = {
  blurhash?: string;
  uri: string;
  containerStyle?: ViewProps["style"];
  resizeMode?: ResizeMode;
};

export default function Photo(props: Props) {
  const { blurhash, uri, resizeMode, containerStyle } = props;
  const [isLoaded, setIsLoaded] = useState(isLocalFile(uri));

  let maybeLocalUri = uri;

  if (isLocalFile(uri) && !uri.startsWith(FileSystem.cacheDirectory)) {
    let filename = uri;
    if (uri.startsWith("file://")) {
      const uriParts = uri.split("/");
      filename = uriParts[uriParts.length - 1];
    }

    maybeLocalUri = `${PHOTOS_DIRECTORY}/${filename}`;
  }

  return (
    <View style={containerStyle}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ type: "timing", duration: 400 }}
        style={[StyleSheet.absoluteFill, { backgroundColor: "transparent" }]}
      >
        <FastImage
          onLoad={() => setIsLoaded(true)}
          onError={() => console.log(`error loading image: ${uri}`)}
          source={{ uri: maybeLocalUri }}
          resizeMode={resizeMode}
          style={[StyleSheet.absoluteFill, { backgroundColor: "transparent" }]}
        />
      </MotiView>

      <AnimatePresence>
        {!isLoaded &&
          (blurhash ? (
            <MotiView
              from={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 400 }}
              style={[StyleSheet.absoluteFill]}
            >
              <Blurhash blurhash={blurhash} style={{ flex: 1 }} />
            </MotiView>
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: TailwindColor['neutral-300'] }]}
            />
          ))}
      </AnimatePresence>
    </View>
  );
}
