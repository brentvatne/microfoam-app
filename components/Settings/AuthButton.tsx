import { View } from "react-native";
import { useRouter } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";
import stc from "string-to-color";
import Color from "color";

import Button from "~/components/Button";
import { Text, AntDesign } from "~/components/Themed";
import {
  FontSize,
  TailwindColor,
  Padding,
  BorderRadius,
  Margin,
} from "~/constants/styles";
import { useAuthSession } from "~/storage/supabase";

export default function AuthButton() {
  const session = useAuthSession();
  const router = useRouter();

  if (session && session.user?.email) {
    return (
      <View
        style={{
          borderRadius: BorderRadius[3],
          backgroundColor: "white",
          marginHorizontal: Margin[3],
          marginBottom: Margin[4],
        }}
      >
        <BorderlessButton
          style={{
            paddingHorizontal: Padding[3],
            paddingVertical: Padding[4],
          }}
          onPress={() => {
            router.push("/settings/auth");
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              paddingRight: Padding[2],
              paddingTop: 2,
              alignItems: "center",
            }}
          >
            <Avatar email={session.user.email} />
            <View style={{ marginLeft: Margin[3] }} />
            <View style={{ flex: 1 }}>
              <Text
                darkColor={TailwindColor["gray-400"]}
                lightColor={TailwindColor["gray-700"]}
                numberOfLines={1}
                style={{
                  fontSize: FontSize.xl,
                }}
              >
                {session.user.email}
              </Text>
            </View>
            <View style={{ marginLeft: Margin[3] }} />
            <View
              style={{
                height: "100%",
                paddingTop: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AntDesign name="right" size={20} color="black" />
            </View>
          </View>
        </BorderlessButton>
      </View>
    );
  } else {
    return (
      <Button title="Sign in" onPress={() => router.push("/settings/auth")} />
    );
  }
}

function Avatar({ email }: { email: string }) {
  const emailColor = stc(email);
  const colorCalculator = Color(emailColor);
  const color = colorCalculator.lightness(20).hex();
  const backgroundColor = colorCalculator.lightness(95).hex();

  return (
    <View
      style={{
        backgroundColor,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color,
          fontSize: 21,
          fontWeight: "normal",
        }}
      >
        {email.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
