import { StyleSheet, View } from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";
import { Padding, BorderRadius, Margin } from "~/constants/styles";
import { AntDesign, Text, View as ThemedView } from "~/components/Themed";
import { TailwindColor } from "~/constants/colors";
import { FontSize } from "~/constants/styles";

export function List({
  children,
  renderFooter,
}: {
  children: React.ReactNode;
  renderFooter?: () => React.ReactNode;
}) {
  return (
    <>
      <ThemedView
        lightColor="white"
        darkColor={TailwindColor["zinc-800"]}
        style={{
          borderRadius: BorderRadius[3],
          marginHorizontal: Margin[4],
          marginBottom: renderFooter ? Margin[1] : Margin[4],
          paddingTop: Padding[1],
          paddingBottom: Padding[2],
        }}
      >
        {children}
      </ThemedView>
      {renderFooter ? (
        <View style={{ marginHorizontal: Margin[4] }}>{renderFooter()}</View>
      ) : null}
    </>
  );
}

export function ListItem({
  children,
  disabled,
  onPress,
  renderIcon,
  renderRight,
  subtitle,
  title,
}:
  | {
      children: React.ReactNode;
      disabled?: boolean;
      onPress?: () => void;
      renderIcon?: undefined;
      renderRight?: () => React.ReactNode;
      subtitle?: undefined;
      title?: undefined;
    }
  | {
      children?: undefined;
      disabled?: boolean;
      onPress?: () => void;
      renderIcon?: () => React.ReactNode;
      renderRight?: () => React.ReactNode;
      subtitle?: string;
      title: string;
    }) {
  return (
    <BorderlessButton
      onPress={disabled ? null : onPress}
      style={{
        paddingHorizontal: Padding[3],
        // TODO: test this when RNGH fixes it
        // paddingVertical: Padding[3],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          paddingRight: Padding[2],
          paddingTop: 2,
          alignItems: "center",
          marginVertical: Padding[3],
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children ??
          renderListItemContents({ title, subtitle, renderIcon, renderRight })}
      </View>
    </BorderlessButton>
  );
}

const RightArrow = (
  <View
    style={{
      height: "100%",
      paddingTop: 5,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <AntDesign name="right" size={20} lightColor="black" darkColor="white" />
  </View>
);

function renderListItemContents({
  title,
  subtitle,
  renderIcon,
  renderRight,
}: {
  title: string;
  subtitle: string;
  renderIcon?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;
}) {
  const iconElement = renderIcon?.() ?? null; // Add placeholder
  const titleElement = (
    <Text
      lightColor={TailwindColor["gray-700"]}
      numberOfLines={1}
      style={{
        fontSize: FontSize.xl,
      }}
    >
      {title}
    </Text>
  );
  const subtitleElement = subtitle ? (
    <Text
      darkColor={TailwindColor["neutral-400"]}
      lightColor={TailwindColor["gray-500"]}
      style={{
        marginTop: Margin[1],
        fontSize: FontSize.base,
      }}
    >
      {subtitle}
    </Text>
  ) : null;
  const rightElement = renderRight ? renderRight() : RightArrow;

  return (
    <>
      <View style={{ height: "100%", paddingTop: Padding[1] }}>
        {iconElement}
      </View>
      <View style={{ marginLeft: Margin[3] }} />
      <View style={{ flex: 1 }}>
        {titleElement}
        {subtitleElement}
      </View>
      <View style={{ marginLeft: Margin[3] }} />
      {rightElement}
    </>
  );
}

export function ListSeparator() {
  return (
    <ThemedView
      darkColor={TailwindColor["zinc-600"]}
      lightColor={TailwindColor["zinc-200"]}
      style={{
        height: StyleSheet.hairlineWidth,
        // marginLeft: Margin[3],
      }}
    />
  );
}
