import { useSafeAreaFrame } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import * as PourStore from "~/storage/PourStore";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import Photo from "~/components/Photo";
import { AntDesign, ScrollView, Text, View } from "~/components/Themed";
import { humanDate } from "~/utils/formatDate";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedPhoto = Animated.createAnimatedComponent(Photo);

export default function ShowPour() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const pour = PourStore.usePour(id);
  const frame = useSafeAreaFrame();
  const router = useRouter();
  const scrollOffsetY = useSharedValue(0);

  console.log({ id });

  // Probably could just use useScrollViewOffset instead
  const handler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollOffsetY.value = e.contentOffset.y;
    },
  });

  const scrollViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: Math.max(1, 1 - scrollOffsetY.value / 100) }],
    };
  });

  if (!pour) {
    return null;
  }

  const targetImageWidth = frame.width > 400 ? 400 : frame.width;
  const targetImageHeight = Math.min(400, targetImageWidth);

  return (
    <AnimatedScrollView
      scrollEventThrottle={16}
      onScroll={handler}
      contentContainerStyle={{ minHeight: "100%" }}
      style={[{ flex: 1 }]}
    >
      <Stack.Screen
        options={{
          title: null,
          headerTransparent: true,
          headerTintColor: "white",
          headerRight: () => (
            <BorderlessButton
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              onPress={() => {
                router.navigate(`/edit/${params.id}`);
              }}
            >
              <AntDesign name="edit" size={24} color="white" />
            </BorderlessButton>
          ),
        }}
      />
      <StatusBar style="light" />

      <Animated.View
        style={[
          {
            width: "100%",
            height: targetImageHeight,
            backgroundColor: TailwindColor["black"],
          },
          scrollViewAnimatedStyle,
        ]}
      >
        <AnimatedPhoto
          uri={pour.photoUrl}
          blurhash={pour.blurhash}
          transition={500}
          containerStyle={{
            width: targetImageWidth,
            height: targetImageHeight,
          }}
          resizeMode="contain"
        />
      </Animated.View>

      <Description pour={pour} />
    </AnimatedScrollView>
  );
}

function Description({ pour }) {
  return (
    <View
      style={{
        paddingTop: Padding[4],
        paddingHorizontal: Padding[4],
        flex: 1,
      }}
    >
      <View style={{ marginBottom: Margin[2] }}>
        <Text
          style={{
            flex: 1,
            fontSize: FontSize.lg,
            lineHeight: FontSize.lg * 1.5,
          }}
        >
          {pour.notes ?? (
            <Text
              style={{
                fontStyle: "italic",
                color: TailwindColor["gray-400"],
              }}
            >
              No notes
            </Text>
          )}
        </Text>
      </View>

      <Text
        darkColor={TailwindColor["gray-300"]}
        lightColor={TailwindColor["gray-600"]}
        style={{
          fontSize: FontSize.lg,
          lineHeight: FontSize.lg * 1.5,
        }}
      >
        {pour.pattern ?? "Formless blob"}
      </Text>
      <Text
        darkColor={TailwindColor["gray-300"]}
        lightColor={TailwindColor["gray-600"]}
        style={{
          fontSize: FontSize.lg,
          lineHeight: FontSize.lg * 1.5,
        }}
      >
        Rating: {pour.rating} / 5
      </Text>
      <Text
        darkColor={TailwindColor["gray-300"]}
        lightColor={TailwindColor["gray-600"]}
        style={{
          fontSize: FontSize.lg,
          lineHeight: FontSize.lg * 1.5,
        }}
      >
        {humanDate(pour.dateTime)}
      </Text>
    </View>
  );
}
