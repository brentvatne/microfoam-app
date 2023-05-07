import { View } from "react-native";
import { useRouter } from "expo-router";
import stc from "string-to-color";
import Color from "color";

import Button from "~/components/Button";
import { Text } from "~/components/Themed";
import { List, ListItem } from "~/components/Lists";
import { useAuthSession } from "~/storage/supabase";

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
