import React from "react";
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
  transition?: ImageProps["transition"];
};

// A class component is required to support wrapping with
// Animated.createAnimatedComponent
export default class Photo extends React.Component<Props> {
  render() {
    return <PhotoComponent {...this.props} />;
  }
}

function PhotoComponent(props: Props) {
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
        cachePolicy="memory"
        recyclingKey={maybeLocalUri}
        placeholder={blurhash ? {blurhash} : {blurhash: 'L6I|~^0200OG~A?bF#^*00?H?Z~9'}}
        placeholderContentFit="fill"
        contentFit="fill"
        transition={props.transition}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "white" }]}
      />
    </View>
  );
}
