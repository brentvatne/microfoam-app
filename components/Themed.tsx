import { forwardRef } from "react";
import {
  Text as DefaultText,
  View as DefaultView,
  useColorScheme,
} from "react-native";
import {
  FlatList as DefaultFlatList,
  ScrollView as DefaultScrollView,
} from "react-native-gesture-handler";
import DefaultAntDesign from "@expo/vector-icons/AntDesign";

import { ThemeColors } from "~/constants/colors";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof ThemeColors.light & keyof typeof ThemeColors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return ThemeColors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type ScrollViewProps = ThemeProps & DefaultScrollView["props"];
export type FlatListProps = ThemeProps & DefaultFlatList["props"];
export type AntDesignProps = ThemeProps &
  React.ComponentProps<typeof DefaultAntDesign>;

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "view"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function AntDesign(props: AntDesignProps) {
  const { lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "tint");

  return <DefaultAntDesign color={color} {...otherProps} />;
}

const ScrollView = forwardRef<DefaultScrollView, ScrollViewProps>(
  (props, ref) => {
    const { style, lightColor, darkColor, ...otherProps } = props;
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "view"
    );

    return (
      <DefaultScrollView
        style={[{ backgroundColor }, style]}
        {...otherProps}
        ref={ref}
      />
    );
  }
);

const FlatList = forwardRef<DefaultFlatList, FlatListProps>((props, ref) => {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "view"
  );

  return (
    <DefaultFlatList
      style={[{ backgroundColor }, style]}
      {...otherProps}
      ref={ref}
    />
  );
});

export { FlatList, ScrollView };
