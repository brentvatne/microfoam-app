import { View } from 'react-native';
import * as Application from 'expo-application';
import { useUpdates } from 'expo-updates';

import { Text } from '~/components/Themed';
import { FontSize, Margin, TailwindColor } from '~/constants/styles';
import { Notifier } from '../Notifier';

export default function ApplicationInfo({
  onTripleTap,
}: {
  onTripleTap: () => void;
}) {
  const { currentlyRunning: currentlyRunningUpdate } = useUpdates();

  return (
    <View style={{ paddingHorizontal: 10 }}>
      <DebugText>
        Version: {Application.nativeApplicationVersion} (
        {Application.nativeBuildVersion})
      </DebugText>

      <DebugText>Runtime: {currentlyRunningUpdate.runtimeVersion}</DebugText>

      <DebugText>Channel: {currentlyRunningUpdate.channel}</DebugText>

      <DebugText>ID: {currentlyRunningUpdate.updateId ?? 'n/a'}</DebugText>

      {currentlyRunningUpdate.createdAt ? (
        <DebugText>
          Released: {currentlyRunningUpdate.createdAt.toString()}
        </DebugText>
      ) : null}

      <Notifier />
    </View>
  );
}

const DebugText = ({ children }) => {
  return (
    <Text
      darkColor={TailwindColor['gray-100']}
      lightColor={TailwindColor['gray-700']}
      style={{
        fontSize: FontSize.base,
        textAlign: 'center',
        marginTop: Margin[1],
      }}
    >
      {children}
    </Text>
  );
};
