// hooks/useAudioPlayer.js
import { useRef, useState, useCallback } from "react";

export function useAudioPlayer({ setMessages }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const serverFinishedRef = useRef(false);

  // =========================
  // HANDLE AUDIO COMPLETE
  // =========================
  const handleAudioComplete = useCallback(() => {
    console.log("✅ Server finished sending audio");

    serverFinishedRef.current = true;

    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (updated[lastIndex].role === "assistant") {
        updated[lastIndex] = { ...updated[lastIndex], streaming: false };
      }
      return updated;
    });

    if (!isPlayingRef.current && audioQueueRef.current.length === 0) {
      console.log("🛑 Queue empty and not playing, stopping processing");
      setIsSpeaking(false);
      setIsProcessing(false);
      serverFinishedRef.current = false;
    }
  }, [setMessages]); // ✅ now stable

  // =========================
  // AUDIO PLAYBACK QUEUE
  // =========================
  const playNext = useCallback(() => {
    console.log(
      "🎬 playNext called, queue length:",
      audioQueueRef.current.length
    );

    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      // eslint-disable-next-line react-hooks/immutability
      handleAudioComplete(); // ✅ now refers to the correct, fresh version
      return;
    }
    isPlayingRef.current = true;
    setIsSpeaking(true);

    const { audio, text } = audioQueueRef.current.shift();
    console.log("▶️ Playing audio chunk, text:", text);

    try {
      // Convert base64 to blob
      const byteCharacters = atob(audio);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "audio/mpeg" });

      const audioUrl = URL.createObjectURL(blob);
      const audioObj = new Audio(audioUrl);

      // 🧠 Append text ONLY when playback starts
      if (text) {
        console.log("📝 Appending text to message:", text);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const updated = [...prev];

          // Case 1: Transition from Thinking to Streaming
          if (last?.thinking) {
            updated[updated.length - 1] = {
              role: "assistant",
              content: text, // Start with the first chunk of text
              streaming: true,
            };
            return updated;
          }

          // Case 2: Already streaming, append the text
          updated[updated.length - 1] = {
            ...last,
            content: (last.content || "") + text,
            streaming: true,
          };

          return updated;
        });
      }

      audioObj.onended = () => {
        console.log("🔚 Audio chunk ended");
        URL.revokeObjectURL(audioUrl);
        // eslint-disable-next-line react-hooks/immutability
        playNext();
      };

      audioObj.onerror = (err) => {
        console.error("❌ Audio playback error:", err);
        URL.revokeObjectURL(audioUrl);
        playNext();
      };

      audioObj.play().catch((err) => {
        console.error("❌ Audio play error:", err);
        URL.revokeObjectURL(audioUrl);
        playNext();
      });
    } catch (err) {
      console.error("❌ Audio conversion error:", err);
      playNext();
    }
    // eslint-disable-next-line react-hooks/immutability
  }, [setMessages, handleAudioComplete]);
  // =========================
  // HANDLE AUDIO CHUNK
  // =========================
  const handleAudioChunk = useCallback(
    ({ audio, text }) => {
      console.log("🎵 Handling audio chunk in player hook", {
        hasAudio: !!audio,
        text: text,
        queueLength: audioQueueRef.current.length,
      });

      if (!audio) {
        console.warn("⚠️ No audio in chunk");
        return;
      }

      audioQueueRef.current.push({ audio, text });
      console.log(
        "📥 Added to queue, new length:",
        audioQueueRef.current.length
      );

      if (!isPlayingRef.current) {
        console.log("▶️ Starting playback");
        playNext();
      }
    },
    [playNext]
  );

  // =========================
  // CLEANUP (call on unmount)
  // =========================
  const cleanup = useCallback(() => {
    audioQueueRef.current.forEach((item) => {
      if (item.url) URL.revokeObjectURL(item.url);
    });
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  return {
    // State
    isSpeaking,
    isProcessing,
    setIsProcessing,
    // Handlers (pass these to useAiChat)
    handleAudioChunk,
    handleAudioComplete,

    // Cleanup
    cleanup,
  };
}
