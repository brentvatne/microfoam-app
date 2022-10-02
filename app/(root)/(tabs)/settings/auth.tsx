import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Button from "~/components/Button";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import { supabase, useAuthSession } from "~/storage/supabase";
import { NativeStack } from "expo-router";

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

export default function Auth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isWaitingForOtp, setIsWaitingForOtp] = useState(false);
  const session = useAuthSession();

  return (
    <>
      <NativeStack.Screen options={{ title: "Authentication" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: TailwindColor.white,
        }}
      >
        {session && (
          <View
            style={{
              paddingTop: Padding[6],
              paddingBottom: Padding[3],
              paddingHorizontal: Padding[5],
              backgroundColor: TailwindColor["gray-100"],
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: FontSize.xl, marginBottom: Margin[3] }}>
              Signed in as{" "}
              <Text style={{ fontWeight: "bold" }}>{session.user.email}</Text>
            </Text>
            <Button
              title="Sign out"
              onPress={() => {
                supabase.auth.signOut();
              }}
            />
            {/* TODO: add debug view where you can see scrollview of full session object */}
          </View>
        )}
        {!isWaitingForOtp && !session && (
          <>
            <TextInput
              value={email}
              placeholder="person@example.com"
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={{
                backgroundColor: TailwindColor["gray-100"],
                fontSize: FontSize.lg,
                width: 350,
                padding: 5,
                borderRadius: 5,
                height: 50,
                marginBottom: 20,
                borderColor: "black",
              }}
            />

            <Button
              title="Sign in"
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
          </>
        )}

        {isWaitingForOtp && !session && (
          <>
            <TextInput
              value={otp}
              placeholder="abc1234"
              onChangeText={(text) => setOtp(text)}
              autoCapitalize="none"
              style={{
                backgroundColor: TailwindColor["gray-100"],
                fontSize: FontSize.lg,
                width: 350,
                padding: 5,
                borderRadius: 5,
                height: 50,
                marginBottom: 20,
                borderColor: "black",
              }}
            />

            <Button
              title="Verify OTP"
              onPress={async () => {
                try {
                  const result = await verifyOtpAsync(email, otp);
                  if (result.error) {
                    alert(`Error: "${result.error}"`);
                  }
                } catch (e) {
                  alert(`Error: "${e.message}"`);
                } finally {
                  setIsWaitingForOtp(false);
                }
              }}
            />
          </>
        )}
      </View>
    </>
  );
}
