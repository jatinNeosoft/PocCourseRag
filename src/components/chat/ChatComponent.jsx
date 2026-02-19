// ChatComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import { CardContent } from "../ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { sendAudioChunk, endAudioStream } from "@/config/aiSocket";


const ChatComponent = ({ courseId, messages, sendMessage, cleanupAudio, setIsProcessing, isSpeaking, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);


  // =========================
  // Auto Scroll
  // =========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // Cleanup
  // =========================
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      cleanupAudio(); // ✅ replaces old audioQueueRef cleanup
    };
  }, []);

  // =========================
  // AUDIO RECORDING
  // =========================
  const startListening = async () => {
    try {
      if (mediaRecorderRef.current) {
        const existingRecorder = mediaRecorderRef.current;
        if (existingRecorder.state !== "inactive") existingRecorder.stop();
        existingRecorder.stream?.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          // ✅ guard added
          const base64 = await blobToBase64(event.data);
          sendAudioChunk(base64);
        }
      };
      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      console.log("🎤 Started listening");
    } catch (err) {
      console.error("❌ Microphone error:", err);
    }
  };

  // const stopListening = () => {
  //   if (!mediaRecorderRef.current) return;

  //   const mediaRecorder = mediaRecorderRef.current;
  //   if (mediaRecorder.state !== "inactive") mediaRecorder.stop();

  //   setTimeout(() => {
  //     mediaRecorder.stream?.getTracks().forEach((t) => t.stop());
  //     mediaRecorderRef.current = null;
  //     endAudioStream(courseId);
  //     setIsListening(false);
  //     setIsProcessing(true); // ✅ from useAudioPlayer
  //     console.log("🛑 Stopped listening, processing...");
  //   }, 100);
  // };

  const stopListening = () => {
    if (!mediaRecorderRef.current) return;

    const mediaRecorder = mediaRecorderRef.current;

    // ✅ Wait for onstop — fires AFTER the final ondataavailable
    mediaRecorder.onstop = async () => {
      // Drain any final pending chunk
      await new Promise((resolve) => setTimeout(resolve, 50));

      mediaRecorder.stream?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;

      endAudioStream(courseId); // ✅ Now safe — all chunks sent
      setIsListening(false);
      setIsProcessing(true);
      console.log("🛑 Stopped listening, all chunks flushed, processing...");
    };

    if (mediaRecorder.state !== "inactive") {
      mediaRecorder.stop(); // triggers onstop after final ondataavailable
    }
  };

  // =========================
  // FIXED BASE64 FUNCTION
  // =========================
  const blobToBase64 = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });

  return (
    <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="flex-1 pr-4 min-h-0">
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              role={msg.role}
              content={msg.content}
              streaming={msg.streaming}
              isAudioPlaying={isSpeaking && index === messages.length - 1}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
       {console.log(isProcessing, "isProcessing in ChatComponent")}
       {console.log(isSpeaking, "isSpeaking in ChatComponent")}
       
      <div className="pt-2 shrink-0">
        <ChatInput
          onSend={sendMessage}
          onStartAudio={startListening}
          onStopAudio={stopListening}
          isListening={isListening}
          isProcessing={isProcessing}
        />
      </div>
    </CardContent>
  );
};

export default ChatComponent;
