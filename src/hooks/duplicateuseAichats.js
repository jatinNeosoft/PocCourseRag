// hooks/useAiChats.js
import { useRef } from "react";
import { connectAiSocket, sendAiMessage } from "@/config/aiSocket";
import { getToken } from "@/lib/utils";

export function useAiChat({
  setMessages, // ✅ For text-only chat
  handleAudioChunk,
  onStreamingStart,
  onStreamingEnd,
  handleAudioComplete,
}) {
  const aiIndexRef = useRef(null); // text chat

  function initSocket() {
    const token = getToken();
    const authHeader = token ? `Bearer ${token}` : null;

    connectAiSocket({
      token: authHeader,

      /* ============================= */
      /* STREAMING START/END */
      /* ============================= */
      onStreamingStart: () => {
        console.log("🎬 AI streaming started");
        onStreamingStart?.();
      },

      onStreamingEnd: () => {
        console.log("🎬 AI streaming ended");
        onStreamingEnd?.();
      },

      /* ============================= */
      /* TEXT TOKEN STREAMING (for text chat) */
      /* ============================= */
      onToken: (tokenChunk) => {
        console.log("🔹 Received token chunk:", tokenChunk);
        
        if (!setMessages) return; // ✅ Skip if not using text chat

        setMessages((prev) => {
          const idx = aiIndexRef.current;

          if (idx === null) {
            aiIndexRef.current = prev.length;
            return [
              ...prev,
              {
                role: "assistant",
                content: tokenChunk,
                streaming: true,
              },
            ];
          }

          if (!prev[idx]) return prev;

          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            content: updated[idx].content + tokenChunk,
          };

          return updated;
        });
      },

      onDone: ({ fullAnswer }) => {
        if (!setMessages) return;

        setMessages((prev) => {
          const idx = aiIndexRef.current;
          if (idx === null || !prev[idx]) return prev;

          return prev.map((msg, i) =>
            i === idx
              ? { ...msg, content: fullAnswer || msg.content, streaming: false }
              : msg
          );
        });

        aiIndexRef.current = null;
      },

      /* ============================= */
      /* AUDIO USER TRANSCRIPT */
      /* ============================= */
      onUserTranscript: (text) => {
        if (!setMessages) return;

        setMessages((prev) => [...prev, { role: "user", content: text }]);

        setMessages((prev) => {
          aiIndexRef.current = prev.length;
          return [
            ...prev,
            {
              role: "assistant",
              content: "",
              streaming: true,
            },
          ];
        });
      },
      /* ============================= */
      /* AUDIO CHUNK FOR PLAYBACK */
      /* ============================= */
      onAudioChunk: (data) => {
        const { audio, text } = data;

        // Just forward to component
        handleAudioChunk({ audio, text });
      },

      onAudioComplete: () => {
        handleAudioComplete?.();
      },

      /* ============================= */
      /* ERROR HANDLING */
      /* ============================= */
      onError: (err) => {
        console.error("❌ AI error:", err);

        if (aiIndexRef.current !== null && setMessages) {
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[aiIndexRef.current]) {
              updated[aiIndexRef.current].streaming = false;
            }
            return updated;
          });
          aiIndexRef.current = null;
        }
      },
    });

    return () => {
      aiIndexRef.current = null;
    };
  }

  function handleSend(courseId, text) {
    if (!setMessages) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);

    setMessages((prev) => {
      aiIndexRef.current = prev.length;
      return [
        ...prev,
        {
          role: "assistant",
          content: "",
          streaming: true,
        },
      ];
    });

    sendAiMessage({
      courseId,
      question: text,
    });
  }

  return {
    initSocket,
    handleSend,
  };
}
