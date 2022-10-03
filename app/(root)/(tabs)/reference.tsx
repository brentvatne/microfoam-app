import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { BorderlessButton, ScrollView } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";

import { TailwindColor, FontSize, Margin, Padding } from "~/constants/styles";

export default function Reference() {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: TailwindColor.white,
      }}
    >
      <View style={styles.container}>
        <Row title="Formless blob">
          <View style={styles.description}>
            <Text style={styles.paragraph}>
              Everyone has to start somewhere. For latte art, that somewhere is
              a formless blob. You manage to get some surface of the milk, but
              it's not really a shape. It's just a blob. Better than nothing!
            </Text>
          </View>
        </Row>
        <Row title="Monk's head">
          <View style={styles.description}>
            <Text style={styles.paragraph}>
              This is the most basic design. You need to do be able to do this
              before you can do other things.
            </Text>
          </View>
        </Row>
        <Row title="Heart">
          <View style={styles.description}>
            <Text style={styles.paragraph}>
              Basically just a monk's head but with a pull through to add a
              tail!
            </Text>
          </View>
        </Row>
        <Row title="Tulip">
          <View style={styles.description}>
            <Text style={styles.paragraph}>
              Make a small blob (like monks head). Then another, and push it
              into the other blob. Then another. Keep going. Add some wiggling
              to first blob if you want. Then on the last one, do a small heart
              and pull through the full design.
            </Text>
          </View>
        </Row>
        <Row title="Rosetta">
          <View style={styles.description}>
            <Text style={styles.paragraph}>
              Start with a wiggle, keep it going for a while until it fills a
              bunch of the cup, then hold in place to make a heart.
            </Text>
          </View>
        </Row>
        <Row title="Swan">
          <View style={styles.description}>
            <Text style={styles.paragraph}>
              I don't know how to do this one.
            </Text>
          </View>
        </Row>
      </View>
    </ScrollView>
  );
}

function Row({ title, children }: { title: string; children?: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            color="black"
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
    backgroundColor: TailwindColor["gray-100"],
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
