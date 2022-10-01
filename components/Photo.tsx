import { useState } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { Blurhash } from "react-native-blurhash";
import { AnimatePresence, MotiView } from "moti";
import FastImage from "react-native-fast-image";

import { isLocalFile } from "~/storage/fs";

type Props = {
  blurhash?: string;
  uri: string;
  containerStyle?: ViewProps["style"];
};

export default function Photo(props: Props) {
  const { blurhash, uri, containerStyle } = props;
  const [isLoaded, setIsLoaded] = useState(isLocalFile(uri));

  return (
    <View style={containerStyle}>
      <FastImage
        onLoad={() => setIsLoaded(true)}
        onError={() => console.log(`error loading image: ${uri}`)}
        source={{ uri }}
        style={[StyleSheet.absoluteFill]}
      />

      <AnimatePresence>
        {!isLoaded && (
          <MotiView
            from={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={[StyleSheet.absoluteFill]}
          >
            <Blurhash blurhash={blurhash} style={{ flex: 1 }} />
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
