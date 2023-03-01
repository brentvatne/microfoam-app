import { useRef } from 'react';
import { View, Text } from 'react-native';
import { useScrollToTop } from '@react-navigation/native';

export default function App() {
  const ref = useRef();
  const lol = useScrollToTop(ref);

  return (
    <View style={{ flex: 1, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center'}}>
      <Text>hi</Text>
    </View>
  )
}