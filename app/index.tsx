import { SafeAreaView } from "react-native";
import CharacterCreationScreen  from '@/screens/CharacterCreationScreen';

export default function Page() {
  return (
      <SafeAreaView style={{ flex: 1 }}>
        <CharacterCreationScreen />
      </SafeAreaView>
  );
}

