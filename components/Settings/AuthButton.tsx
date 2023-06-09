import { View } from "react-native";
import { useRouter } from "expo-router";
import stc from "string-to-color";
import Color from "color";

import { TailwindColor } from "~/constants/colors";
import { Text } from "~/components/Themed";
import { List, ListItem } from "~/components/Lists";
import { useAuthSession } from "~/storage/supabase";
import { Margin } from "~/constants/styles";

export default function AuthButton() {
  const session = useAuthSession();
  const router = useRouter();

  if (session && session.user?.email) {
    return (
      <List>
        <ListItem
          renderIcon={() => <Avatar email={session.user.email} />}
          title={session.user.email}
          onPress={() => router.push("/settings/auth")}
        />
      </List>
    );
  } else {
    return (
      <>
        <List
          renderFooter={() => (
            <Text
              lightColor={TailwindColor["zinc-700"]}
              darkColor={TailwindColor["zinc-300"]}
              style={{
                textAlign: "center",
                marginHorizontal: Margin[3],
                marginTop: Margin[2],
                marginBottom: Margin[6],
              }}
            >
              No sign up required. All we ask for is your email address, we send
              a code there for you to sign in.
            </Text>
          )}
        >
          <ListItem
            title="Sign in"
            subtitle="This will enable you to back-up your data and restore it on other devices."
            onPress={() => router.push("/settings/auth")}
          />
        </List>
      </>
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
