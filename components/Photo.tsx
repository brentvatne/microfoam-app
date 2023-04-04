import { StyleSheet, ViewProps } from "react-native";
import { View } from "~/components/Themed";
import { Image, ImageProps } from "expo-image";
import * as FileSystem from "expo-file-system";

import { PHOTOS_DIRECTORY, isLocalFile } from "~/storage/fs";

type Props = {
  blurhash?: string;
  uri: string;
  containerStyle?: ViewProps["style"];
  resizeMode?: "cover" | "contain";
  transition: ImageProps["transition"]
};

export default function Photo(props: Props) {
  const { blurhash, uri, resizeMode, containerStyle } = props;

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
    <View style={containerStyle} darkColor="black" lightColor="white">
      <Image
        onError={() => console.log(`error loading image: ${uri}`)}
        source={{ uri: maybeLocalUri }}
        placeholder={blurhash}
        contentFit={resizeMode}
        transition={props.transition}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "white" }]}
      />
    </View>
  );
}
