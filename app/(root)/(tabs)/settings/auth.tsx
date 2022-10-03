import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeStack } from "expo-router";

import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import { supabase, useAuthSession } from "~/storage/supabase";
import BlockButton from "~/components/BlockButton";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isWaitingForOtp, setIsWaitingForOtp] = useState(false);
  const session = useAuthSession();

  return (
    <>
      <NativeStack.Screen options={{ title: "Authentication" }} />
      <ScrollView
        keyboardShouldPersistTaps="never"
        style={{
          flex: 1,
          backgroundColor: TailwindColor.white,
        }}
      >
        {session && (
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
        )}

        {!isWaitingForOtp && !session && (
          <View style={styles.container}>
            <TextInput
              autoFocus
              value={email}
              placeholder="person@example.com"
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={{
                backgroundColor: TailwindColor["gray-100"],
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
              label="Sign in"
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
          </View>
        )}

        {isWaitingForOtp && !session && (
          <View style={styles.container}>
            <TextInput
              value={otp}
              placeholder="123456"
              autoFocus
              onChangeText={(text) => setOtp(text)}
              keyboardType="number-pad"
              autoCapitalize="none"
              style={{
                backgroundColor: TailwindColor["gray-100"],
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
        )}
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
  },
});
