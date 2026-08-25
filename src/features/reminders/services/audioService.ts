import * as DocumentPicker from 'expo-document-picker';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

export type PickedAudio = {
  name: string;
  uri: string;
};

export async function pickAudioFile(): Promise<PickedAudio | undefined> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['audio/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]) {
    return undefined;
  }

  return {
    name: result.assets[0].name,
    uri: result.assets[0].uri,
  };
}

let activePlayer: AudioPlayer | undefined;

export function playAudioUri(uri: string) {
  activePlayer?.pause();
  activePlayer = createAudioPlayer(uri);
  activePlayer.play();
}
