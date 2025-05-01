// src/components/VideoCall/GoogleMeetRecorder.tsx
import { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, VideoOff, Phone, Monitor, MessageSquare, MoreVertical } from 'lucide-react';
import useRecorderStore from '../../store/useRecorderStore';

interface GoogleMeetRecorderProps {
  userName?: string;
  peerName?: string;
}

export default function GoogleMeetRecorder({ 
  userName = "You", 
  peerName = "John" 
}: GoogleMeetRecorderProps) {
  const { 
    isRecording, 
    isProcessing, 
    silenceDetected,
    startRecording, 
    stopRecording,
    setSilenceDetected
  } = useRecorderStore();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [silenceThreshold, setSilenceThreshold] = useState<number>(15); // Make this adjustable
  
  // Refs for audio recording
  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio context and analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const microphone = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      microphone.connect(analyser);
      
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      // Create recorder
      const RecordRTC = (window as any).RecordRTC;
      if (!RecordRTC) {
        console.error("RecordRTC not found. Make sure to include the script.");
        return;
      }
      
      const recorder = RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: (window as any).StereoAudioRecorder,
        numberOfAudioChannels: 1,
        disableLogs: true
      });
      
      recorder.startRecording();
      recorderRef.current = recorder;
      
      // Update state
      startRecording();
      setSilenceDetected(false);
      
      // Start monitoring for silence
      checkSilence();
      
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const checkSilence = () => {
    if (!analyserRef.current || !dataArrayRef.current || !isRecording) {
      return;
    }
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const volume = Array.from(dataArrayRef.current).reduce((sum, val) => sum + val, 0) / dataArrayRef.current.length;
    setCurrentVolume(volume); // Update current volume for display
    
    if (volume < silenceThreshold) {
      // Silence detected
      if (!silenceDetected) {
        setSilenceDetected(true);
      }
      
      // Start or reset the silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      silenceTimerRef.current = window.setTimeout(() => {
        handleStopRecording();
      }, 2000); // Stop after 2 sec of continuous silence
    } else {
      // Sound detected
      if (silenceDetected) {
        setSilenceDetected(false);
      }
      
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
    
    // Continue monitoring
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(checkSilence);
    }
  };

  const handleStopRecording = () => {
    if (!recorderRef.current) return;
    
    // Clear any pending silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString()
        .replace(/[:.-]/g, '')
        .replace('T', '_')
        .slice(0, 15); // YYYYMMDD_HHMMSS
      const filename = `recording_${timestamp}.wav`;
      
      // Create download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 100);
      
      // Clean up media resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      recorderRef.current.destroy();
      recorderRef.current = null;
      
      // Update state
      stopRecording();
      setSilenceDetected(false);
      setCurrentVolume(0);
    });
  };

  const toggleMic = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const handleEndCall = () => {
    if (isRecording) {
      handleStopRecording();
    }
    // You could navigate away or implement other end call behavior here
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      {/* Video Display */}
      <div className="flex-1 bg-black relative overflow-hidden">
        {/* Self view */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center">
          <div className="text-white text-xs">{userName}</div>
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">{userName.charAt(0)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Main view - pretend participant */}
        <div className="flex items-center justify-center h-full">
          <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{peerName.charAt(0)}</span>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-3 py-2 rounded-lg flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span>Recording{silenceDetected ? ' (silence detected)' : ''}</span>
            </div>
            <div className="text-xs">
              Volume: {currentVolume.toFixed(1)} (Threshold: {silenceThreshold})
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span>Adjust Threshold:</span>
              <input
                type="range"
                min="1"
                max="50"
                value={silenceThreshold}
                onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 py-4 px-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mic button */}
          <button 
            onClick={toggleMic}
            className={`p-3 rounded-full ${isMicOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}
            aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicOn ? <Mic size={24} color="white" /> : <MicOff size={24} color="white" />}
          </button>
          
          {/* Camera button */}
          <button 
            onClick={toggleCamera}
            className={`p-3 rounded-full ${isCameraOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}
            aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <Camera size={24} color="white" /> : <VideoOff size={24} color="white" />}
          </button>
          
          {/* End call button */}
          <button 
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600"
            aria-label="End call"
          >
            <Phone size={24} color="white" />
          </button>
          
          {/* Record button */}
          <button 
            onClick={isMicOn ? (isRecording ? handleStopRecording : handleStartRecording) : undefined}
            disabled={!isMicOn || isProcessing}
            className={`p-3 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'} ${!isMicOn || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-white font-medium">{isRecording ? "Stop" : "Record"}</span>
            )}
          </button>
          
          {/* Additional buttons */}
          <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-500" aria-label="Screen share">
            <Monitor size={24} color="white" />
          </button>
          
          <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-500" aria-label="Chat">
            <MessageSquare size={24} color="white" />
          </button>
          
          <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-500" aria-label="More options">
            <MoreVertical size={24} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}