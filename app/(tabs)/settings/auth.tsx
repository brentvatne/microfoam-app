import { useState } from "react";
import { StyleSheet, View as UnthemedView } from "react-native";
import { Stack } from "expo-router";

import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import { supabase, useAuthSession } from "~/storage/supabase";
import { ScrollView, Text, TextInput, View } from "~/components/Themed";
import BlockButton from "~/components/BlockButton";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isWaitingForOtp, setIsWaitingForOtp] = useState(false);
  const session = useAuthSession();

  let content;
  if (session) {
    content = (
      <View
        style={{
          paddingTop: Padding[6],
          paddingBottom: Padding[3],
          paddingHorizontal: Padding[5],
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: FontSize.xl, marginBottom: Margin[3] }}>
          Signed in as{" "}
          <Text style={{ fontWeight: "bold" }}>{session.user.email}</Text>
        </Text>
        <BlockButton
          label="Sign out"
          onPress={() => {
            supabase.auth.signOut();
          }}
        />
        {/* TODO: add debug view where you can see scrollview of full session object */}
      </View>
    );
  } else if (!isWaitingForOtp) {
    content = (
      <>
        <View style={styles.container} lightColor="#fff">
          <Text style={styles.title}>Authenticate by email</Text>
          <Text style={styles.subtitle}>Ensure you have access to the email, you'll need it to complete sign in.</Text>
          <TextInput
            autoFocus
            value={email}
            placeholder="person@example.com"
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            lightBackgroundColor="#fff"
            style={{
              borderColor: TailwindColor["zinc-200"],
              borderWidth: 1,
              fontSize: FontSize.lg,
              flex: 1,
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 5,
              height: 50,
            }}
          />
        </View>
        <UnthemedView style={{marginHorizontal: Margin[4]}}>
          <BlockButton
            label="Send authentication code"
            onPress={async () => {
              try {
                const result = await signInAsync(email);
                // state machine -- email, loading, waiting for otp, ...
                if (result.error) {
                  alert(`Error: "${result.error}"`);
                } else {
                  setIsWaitingForOtp(true);
                }
              } catch (e) {
                alert(`Error: "${e.message}"`);
              }
            }}
          />
        </UnthemedView>
      </>
    );
  } else if (isWaitingForOtp) {
    content = (
      <View style={styles.container}>
        <TextInput
          value={otp}
          placeholder="123456"
          autoFocus
          onChangeText={(text) => setOtp(text)}
          keyboardType="number-pad"
          autoCapitalize="none"
          style={{
            fontSize: FontSize.lg,
            flex: 1,
            padding: 5,
            borderRadius: 5,
            height: 50,
            marginBottom: 20,
            borderColor: "black",
          }}
        />

        <BlockButton
          label="Verify OTP"
          onPress={async () => {
            try {
              const result = await verifyOtpAsync(email, otp);
              if (result.error) {
                alert(`Error: "${result.error}"`);
              }
            } catch (e) {
              alert(`Error: "${e.message}"`);
            } finally {
              setOtp("");
              setIsWaitingForOtp(false);
            }
          }}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: session ? "Manage session" : "Sign in" }}
      />
      <ScrollView
        keyboardShouldPersistTaps="never"
        style={{ flex: 1 }}
        lightColor="#f2f2f2"
      >
        {content}
      </ScrollView>
    </>
  );
}

async function signInAsync(email: string) {
  const response = await supabase.auth.signInWithOtp({
    email,
  });

  console.log(`signInAsync: ${JSON.stringify(response, null, 2)}`);
  return response;
}

async function verifyOtpAsync(email: string, otp: string) {
  const response = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "magiclink",
  });

  console.log(`verifyOtpAsync: ${JSON.stringify(response, null, 2)}`);

  return response;
}

const styles = StyleSheet.create({
  container: {
    margin: Margin[4],
    marginTop: Margin[5],
    padding: Padding[5],
    borderRadius: 10,
  },
  title: {
    fontSize: FontSize.xxl,
    marginBottom: Margin[3],
  },
  subtitle: {
    marginBottom: Margin[4],
    lineHeight: FontSize.base * 1.3,
    color: TailwindColor['zinc-500'],
    fontSize: FontSize.base,

  }
});
