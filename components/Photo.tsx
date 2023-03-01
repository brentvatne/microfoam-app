import { StyleSheet, ViewProps } from "react-native";
import { View } from "~/components/Themed";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import Animated from "react-native-reanimated";

import { PHOTOS_DIRECTORY, isLocalFile } from "~/storage/fs";

Animated.createAnimatedComponent(Image);

type Props = {
  blurhash?: string;
  uri: string;
  containerStyle?: ViewProps["style"];
  resizeMode?: "cover" | "contain";
  sharedTransition?: boolean;
};

export default function Photo(props: Props) {
  const { blurhash, uri, resizeMode, containerStyle, sharedTransition } = props;

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
      <Animated.Image
        sharedTransitionTag={sharedTransition ? `shared-tag-${uri}` : undefined}
        onError={() => console.log(`error loading image: ${uri}`)}
        source={{ uri: maybeLocalUri }}
        /* @ts-ignore */
        /* .. this crashes reanimated? */
        // placeholder={blurhash}
        /* @ts-ignore */
        contentFit={resizeMode}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "white" }]}
      />
    </View>
  );
}
