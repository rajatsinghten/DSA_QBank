// src/pages/VideoCallPage.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Settings, MessageSquare } from "lucide-react";
import RecordRTC from 'recordrtc';
import axios from "axios";

declare global {
  interface Window {
    RecordRTC: any;
    StereoAudioRecorder: any;
    webkitAudioContext: typeof AudioContext;
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const ASSEMBLYAI_API_KEY = "74a5908d42ba46c7a61b815f6438a259";
const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com";

const GEMINI_API_KEY = "AIzaSyDqVnJBbEazymZb8wAmUMEQFJwEJF1lq2E";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function VideoCallPage() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recorder, setRecorder] = React.useState<RecordRTC | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [silenceDetected, setSilenceDetected] = React.useState(false);
  const [transcription, setTranscription] = React.useState<string>("");
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [currentVolume, setCurrentVolume] = React.useState(0);
  const [silenceThreshold, setSilenceThreshold] = React.useState(150);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isResponding, setIsResponding] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioStreamRef = React.useRef<MediaStream | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const silenceTimerRef = React.useRef<number | null>(null);
  const dataArrayRef = React.useRef<Uint8Array | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  // Initialize video and audio
  React.useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: true
        });
        setStream(mediaStream);
        audioStreamRef.current = mediaStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Initialize audio context for volume analysis
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        // Start volume monitoring
        const monitorVolume = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const volume = Math.max(...Array.from(dataArrayRef.current));
          setCurrentVolume(volume);
          
          animationFrameRef.current = requestAnimationFrame(monitorVolume);
        };
        
        monitorVolume();
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recorder) {
        recorder.destroy();
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

  React.useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscription(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setTranscription(`Error: ${event.error}`);
        setIsTranscribing(false);
      };

      recognition.onend = async () => {
        if (transcription && !transcription.startsWith("Error:")) {
          await handleTranscriptionComplete(transcription);
        }
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const transcribeAudio = async (audioFile: File) => {
    try {
      setIsTranscribing(true);
      setTranscription("Transcribing...");

      try {
        // Convert the audio file to base64
        const reader = new FileReader();
        reader.readAsArrayBuffer(audioFile);
        
        reader.onloadend = async () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error("Failed to read audio file");
          }

          // Convert ArrayBuffer to base64
          const base64Audio = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          // Upload to AssemblyAI
          const uploadResponse = await axios.post(
            `${ASSEMBLYAI_BASE_URL}/v2/upload`,
            base64Audio,
            {
              headers: {
                authorization: ASSEMBLYAI_API_KEY,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!uploadResponse.data?.upload_url) {
            throw new Error("Failed to get upload URL");
          }

          const audioUrl = uploadResponse.data.upload_url;

          // Start transcription
          const transcriptResponse = await axios.post(
            `${ASSEMBLYAI_BASE_URL}/v2/transcript`,
            {
              audio_url: audioUrl,
              speech_model: "universal",
            },
            {
              headers: {
                authorization: ASSEMBLYAI_API_KEY,
              },
            }
          );

          if (!transcriptResponse.data?.id) {
            throw new Error("Failed to start transcription");
          }

          const transcriptId = transcriptResponse.data.id;
          const pollingEndpoint = `${ASSEMBLYAI_BASE_URL}/v2/transcript/${transcriptId}`;

          // Poll for results
          let attempts = 0;
          const maxAttempts = 20; // 1 minute maximum wait time

          while (attempts < maxAttempts) {
            const pollingResponse = await axios.get(pollingEndpoint, {
              headers: { authorization: ASSEMBLYAI_API_KEY },
            });
            const transcriptionResult = pollingResponse.data;

            if (transcriptionResult.status === "completed") {
              setTranscription(transcriptionResult.text);
              break;
            } else if (transcriptionResult.status === "error") {
              throw new Error(`Transcription failed: ${transcriptionResult.error || 'Unknown error'}`);
            }
            
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }

          if (attempts >= maxAttempts) {
            throw new Error("Transcription timed out");
          }
        };

        reader.onerror = () => {
          throw new Error("Failed to read audio file");
        };
      } catch (error) {
        console.error("Transcription error:", error);
        setTranscription(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      } finally {
        setIsTranscribing(false);
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setTranscription(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setIsTranscribing(false);
    }
  };

  const checkSilence = () => {
    if (!analyserRef.current || !dataArrayRef.current || !isRecording) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const volume = Math.max(...Array.from(dataArrayRef.current));
    
    if (volume < 150) {
      if (!silenceDetected) {
        setSilenceDetected(true);
        silenceTimerRef.current = window.setTimeout(() => {
          stopRecording();
        }, 2000);
      }
    } else {
      if (silenceDetected) {
        setSilenceDetected(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
    }
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(checkSilence);
    }
  };

  const startRecording = async () => {
    if (!audioStreamRef.current) {
      console.error("No audio stream available");
      return;
    }

    try {
      const newRecorder = new RecordRTC(audioStreamRef.current, {
        type: 'audio',
        mimeType: 'audio/wav',
        numberOfAudioChannels: 1,
        sampleRate: 44100,
        desiredSampRate: 44100,
        bufferSize: 4096,
        disableLogs: true,
        recorderType: window.StereoAudioRecorder
      });

      setRecorder(newRecorder);
      newRecorder.startRecording();
      setIsRecording(true);
      setSilenceDetected(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      checkSilence();
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorder) {
      console.error("No recorder instance available");
      return;
    }

    try {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        console.log("Recording blob:", blob.type, blob.size);
        
        // Create a new blob with the correct MIME type
        const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' });
        console.log("Audio file:", audioFile.type, audioFile.size);

        // Start transcription immediately
        transcribeAudioFile(audioFile);

        // Download the audio file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(audioFile);
        link.download = 'recording.wav';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, 100);

        recorder.destroy();
        setRecorder(null);
        setIsRecording(false);
        setSilenceDetected(false);
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
    }
  };

  const transcribeAudioFile = async (audioFile: File) => {
    try {
      setIsTranscribing(true);
      setTranscription("Transcribing...");

      // Check if speech recognition is supported
      if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        throw new Error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }

      // Check file type
      if (!audioFile.type.startsWith('audio/')) {
        throw new Error(`Invalid file type: ${audioFile.type}. Please upload an audio file.`);
      }

      // Create an audio element to play the file
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioFile);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        
        // Play the audio
        audio.play();
        
        // Stop recognition when audio ends
        audio.onended = () => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        };

        // Handle audio errors
        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          setTranscription("Error: Failed to play audio file");
          setIsTranscribing(false);
        };
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setTranscription(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setIsTranscribing(false);
    }
  };

  const handleTranscriptionComplete = async (text: string) => {
    if (!text) return;

    try {
      // Add user message
      const userMessage: Message = { role: 'user', content: text };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const aiResponse = await getGeminiResponse(text);
      
      // Add AI message
      const aiMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error handling transcription:", error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble generating a response right now." 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getGeminiResponse = async (text: string) => {
    try {
      setIsResponding(true);
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant. The user said: "${text}". Please provide a helpful response.`
            }]
          }]
        }
      );

      if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response from Gemini API");
      }

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    } finally {
      setIsResponding(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await transcribeAudioFile(file);
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
  };

  const toggleVideo = async () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = async () => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recorder) {
      recorder.destroy();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    // Add navigation logic here if needed
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-2 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">VC</span>
          </div>
          <h1 className="text-lg font-medium text-gray-800">AI Meeting</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">12:45 PM</span>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row bg-gray-50 p-4 gap-4">
        {/* User Video - Larger when alone */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center bg-gray-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl text-gray-400">
                    {String.fromCodePoint(0x1F464)}
                  </span>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <Button
                onClick={toggleAudio}
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10 hover:bg-gray-700/50"
              >
                {isAudioEnabled ? (
                  <Mic className="h-5 w-5 text-white" />
                ) : (
                  <MicOff className="h-5 w-5 text-red-400" />
                )}
              </Button>
              <Button
                onClick={toggleVideo}
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10 hover:bg-gray-700/50"
              >
                {isVideoEnabled ? (
                  <Video className="h-5 w-5 text-white" />
                ) : (
                  <VideoOff className="h-5 w-5 text-red-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Agent - Sidebar style */}
        <div className="w-full md:w-80 bg-white rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-medium text-gray-800">AI Assistant</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <div className="text-4xl">🤖</div>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">AI Assistant</h3>
            <p className="text-sm text-gray-500 mb-4">Ready to help</p>
          </div>
          <div className="p-4 border-t">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Transcription</h3>
              <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                {isTranscribing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-sm text-gray-500">Transcribing...</p>
                  </div>
                ) : transcription.startsWith("Error:") ? (
                  <div className="text-sm text-red-500">
                    <p className="font-medium">Transcription Failed</p>
                    <p className="mt-1">{transcription.replace("Error: ", "")}</p>
                  </div>
                ) : transcription ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcription}</p>
                ) : (
                  <p className="text-sm text-gray-500">No transcription yet</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conversation</h3>
              <div className="bg-gray-50 rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">Start speaking to begin the conversation</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isResponding && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border rounded-lg p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <Button
                onClick={() => document.getElementById('audio-upload')?.click()}
                variant="outline"
                className="w-full hover:bg-gray-100 text-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isTranscribing ? "Stop Transcribing" : "Transcribe"}
              </Button>
              {isTranscribing && (
                <Button
                  onClick={stopTranscription}
                  variant="destructive"
                  className="w-full"
                >
                  Stop Transcription
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Controls - Google Meet style */}
      <footer className="bg-white border-t py-3 px-6 flex justify-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "outline" : "destructive"}
            size="lg"
            className="rounded-full px-4"
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5 mr-2" />
            ) : (
              <MicOff className="h-5 w-5 mr-2" />
            )}
            {isAudioEnabled ? "Mute" : "Unmute"}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "outline" : "destructive"}
            size="lg"
            className="rounded-full px-4"
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5 mr-2" />
            ) : (
              <VideoOff className="h-5 w-5 mr-2" />
            )}
            {isVideoEnabled ? "Stop Video" : "Start Video"}
          </Button>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            className="rounded-full px-4"
          >
            {isRecording ? (
              <PhoneOff className="h-5 w-5 mr-2" />
            ) : (
              <Phone className="h-5 w-5 mr-2" />
            )}
            {isRecording ? "Stop Recording" : "Record"}
          </Button>

          <Button
            onClick={endCall}
            variant="destructive"
            size="lg"
            className="rounded-full px-6 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Leave
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      {isRecording && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span>Recording{silenceDetected ? ' (silence detected)' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallPage;