import { forwardRef, useState, useEffect } from "react";
import {
  Appearance,
  useColorScheme,
  Text as DefaultText,
  View as DefaultView,
  SectionList as DefaultSectionList,
  TextInput as DefaultTextInput,
} from "react-native";
import {
  FlatList as DefaultFlatList,
  ScrollView as DefaultScrollView,
} from "react-native-gesture-handler";

import DefaultAntDesign from "@expo/vector-icons/AntDesign";
import Color from "color";

import { ThemeColors } from "~/constants/colors";
import * as Settings from "~/modules/expo-settings";

export function useAutoSetAppearanceFromSettingsEffect() {
  // Set native color scheme based on the selected theme
  const initialTheme = Settings.getTheme();

  if (initialTheme !== Settings.Theme.System) {
    Appearance.setColorScheme(initialTheme);
  }

  useEffect(() => {
    const subscription = Settings.addThemeListener(({ theme: newTheme }) => {
      // If the selected theme setting changes, we need to update the color scheme
      Appearance.setColorScheme(
        newTheme === Settings.Theme.System ? null : newTheme,
      );
    });

    return () => subscription.remove();
  }, []);
}

export function useUnresolvedTheme(): Settings.Theme {
  const [theme, setTheme] = useState<Settings.Theme>(Settings.getTheme());

  useEffect(() => {
    const subscription = Settings.addThemeListener(({ theme: newTheme }) => {
      setTheme(newTheme);
    });

    return () => subscription.remove();
  }, [setTheme]);

  return theme;
}

export function useTheme(): "light" | "dark" {
  const colorScheme = useColorScheme();
  if (colorScheme === null) {
    return "light";
  } else {
    return colorScheme;
  }
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof ThemeColors.light & keyof typeof ThemeColors.dark,
) {
  const theme = useTheme();
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

type LayeredThemeProps = {
  lightTextColor?: string;
  darkTextColor?: string;
  lightBackgroundColor?: string;
  darkBackgroundColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type ScrollViewProps = ThemeProps & DefaultScrollView["props"];
export type FlatListProps = ThemeProps & DefaultFlatList["props"];
export type SectionListProps = ThemeProps & DefaultSectionList["props"];
export type AntDesignProps = ThemeProps &
  React.ComponentProps<typeof DefaultAntDesign>;
export type TextInputProps = LayeredThemeProps & DefaultTextInput["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "view",
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
      "view",
    );

    return (
      <DefaultScrollView
        style={[{ backgroundColor }, style]}
        {...otherProps}
        ref={ref}
      />
    );
  },
);

ScrollView.displayName = "ScrollView";

const FlatList = forwardRef<DefaultFlatList, FlatListProps>((props, ref) => {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "view",
  );

  return (
    <DefaultFlatList
      style={[{ backgroundColor }, style]}
      {...otherProps}
      ref={ref}
    />
  );
});

FlatList.displayName = "FlatList";

const SectionList = forwardRef<DefaultSectionList, SectionListProps>(
  (props, ref) => {
    const { style, lightColor, darkColor, ...otherProps } = props;
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "view",
    );

    return (
      <DefaultSectionList
        style={[{ backgroundColor }, style]}
        {...otherProps}
        ref={ref}
      />
    );
  },
);

SectionList.displayName = "SectionList";

const TextInput = forwardRef<DefaultTextInput, TextInputProps>((props, ref) => {
  const {
    style,
    lightTextColor,
    darkTextColor,
    lightBackgroundColor,
    darkBackgroundColor,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(
    { light: lightBackgroundColor, dark: darkBackgroundColor },
    "textInputBackground",
  );

  const color = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    "textInputText",
  );

  const placeholderTextColor = Color(color).alpha(0.3).toString();

  return (
    <DefaultTextInput
      style={[{ backgroundColor, color }, style]}
      placeholderTextColor={placeholderTextColor}
      {...otherProps}
      ref={ref}
    />
  );
});

TextInput.displayName = "TextInput";

export { FlatList, SectionList, ScrollView, TextInput };
