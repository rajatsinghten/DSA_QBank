// src/store/useRecorderStore.ts
import { create } from 'zustand';

interface RecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  isProcessing: boolean;
  silenceDetected: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  setSilenceDetected: (detected: boolean) => void;
}

const useRecorderStore = create<RecorderState>((set) => ({
  isRecording: false,
  audioBlob: null,
  isProcessing: false,
  silenceDetected: false,
  
  startRecording: () => {
    set({ isRecording: true, audioBlob: null });
  },
  
  stopRecording: () => {
    set({ isRecording: false, isProcessing: true });
    // Simulate processing time
    setTimeout(() => {
      set({ isProcessing: false });
    }, 1000);
  },

  setSilenceDetected: (detected: boolean) => {
    set({ silenceDetected: detected });
  }
}));

export default useRecorderStore;