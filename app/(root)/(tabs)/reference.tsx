import { StyleSheet } from "react-native";
import { useState } from "react";
import { BorderlessButton } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";

import { TailwindColor, FontSize, Margin, Padding } from "~/constants/styles";
import { ScrollView, Text, View, useThemeColor } from "~/components/Themed";

function Paragraph({ children }) {
  return (
    <View
      style={styles.description}
      lightColor={TailwindColor["gray-100"]}
      darkColor={TailwindColor["zinc-800"]}
    >
      <Text
        style={styles.paragraph}
        darkColor={TailwindColor["zinc-200"]}
        lightColor={TailwindColor["black"]}
      >
        {children}
      </Text>
    </View>
  );
}

export default function Reference() {
  return (
    <ScrollView
      style={{
        flex: 1,
      }}
    >
      <View style={styles.container}>
        <Row title="Formless blob">
          <Paragraph>
            Everyone has to start somewhere. For latte art, that somewhere is a
            formless blob. You manage to get some color on surface of the
            coffee, but it's not really a shape. It's just a blob. Better than
            nothing!
          </Paragraph>
        </Row>
        <Row title="Monk's head">
          <Paragraph>
            This is the most basic design. You need to do be able to do this
            before you can do other things.
          </Paragraph>
        </Row>
        <Row title="Heart">
          <Paragraph>
            Basically just a monk's head but with a pull through to add a tail!
          </Paragraph>
        </Row>
        <Row title="Tulip">
          <Paragraph>
            Make a small blob (like monks head). Then another, and push it into
            the other blob. Then another. Keep going. Add some wiggling to first
            blob if you want. Then on the last one, do a small heart and pull
            through the full design.
          </Paragraph>
        </Row>
        <Row title="Rosetta">
          <Paragraph>
            Start with a wiggle, keep it going for a while until it fills a
            bunch of the cup, then hold in place to make a heart.
          </Paragraph>
        </Row>
        <Row title="Swan">
          <Paragraph>I don't know how to do this one.</Paragraph>
        </Row>
      </View>
    </ScrollView>
  );
}

function Row({ title, children }: { title: string; children?: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const iconColor = useThemeColor({
    light: TailwindColor["gray-900"],
    dark: TailwindColor["gray-300"],
  });

  return (
    <BorderlessButton
      borderless={false}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View>
        <View style={styles.row}>
          <AntDesign
            name={isExpanded ? "caretdown" : "caretright"}
            size={15}
            color={iconColor}
            style={{ marginRight: Margin[3] }}
          />
          <Text style={{ fontSize: FontSize.xxl }}>{title}</Text>
        </View>

        {isExpanded ? children : null}
      </View>
    </BorderlessButton>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Padding[3],
  },
  description: {
    marginTop: Margin[1],
    marginHorizontal: Margin[5],
    marginBottom: Margin[3],
    padding: Padding[3],
  },
  paragraph: {
    fontSize: FontSize.lg,
  },
  row: {
    padding: Padding[3],
    marginTop: Margin[1],
    flexDirection: "row",
    alignItems: "center",
  },
});
