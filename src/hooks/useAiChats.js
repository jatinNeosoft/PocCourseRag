import { useRef } from "react";
import { connectAiSocket, sendAiMessage } from "@/config/aiSocket";
import { getToken } from "@/lib/utils";

export function useAiChat({ setMessages, handleAudioChunk }) {
  const aiIndexRef = useRef(null);
  // ✅ Refs so socket listeners never get stale callbacks
  const onAudioChunkRef = useRef(handleAudioChunk);
  // const onAudioCompleteRef = useRef(handleAudioComplete);

  const setMessagesRef = useRef(setMessages);

  // eslint-disable-next-line react-hooks/refs
  onAudioChunkRef.current = handleAudioChunk;
  // eslint-disable-next-line react-hooks/refs
  // onAudioCompleteRef.current = handleAudioComplete;

  // eslint-disable-next-line react-hooks/refs
  setMessagesRef.current = setMessages;

  function initSocket() {
    const token = getToken();
    const authHeader = token ? `Bearer ${token}` : null;

    connectAiSocket({
      token: authHeader,

      // 🔥 STREAMING TOKEN
      onToken: (tokenChunk) => {
        setMessagesRef.current((prev) => {
          const idx = aiIndexRef.current;
          if (idx === null || !prev[idx]) return prev;

          const updated = [...prev];
          const currentMsg = updated[idx];

          if (currentMsg.thinking === true) {
            currentMsg.content = "";
            delete currentMsg.thinking;
          }

          updated[idx] = {
            ...currentMsg,
            content: currentMsg.content + tokenChunk,
          };

          return updated;
        });
      },

      // ✅ STREAM END
      onDone: () => {
        const idx = aiIndexRef.current;
        setTimeout(() => {
          setMessagesRef.current((prev) => {
            if (idx === null || idx === undefined) return prev;
            if (!prev[idx]) return prev;

            const updated = [...prev];
            const currentMsg = updated[idx];
            let content = currentMsg.content || "";

            try {
              content = content
                .replace(/\n{3,}/g, "\n\n")
                .replace(/[^\S\n]{2,}/g, " ")
                .replace(/\*\*\s+([^*]+?)\s+\*\*/g, "**$1**")
                .trim();
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
              content = currentMsg.content;
            }

            updated[idx] = { ...currentMsg, content, streaming: false };
            return updated;
          });
        }, 0);
        aiIndexRef.current = null;
      },

      // ✅ USER TRANSCRIPT
      onUserTranscript: (text) => {
        setMessagesRef.current((prev) => [
          ...prev,
          { role: "user", content: text },
        ]);
        setMessagesRef.current((prev) => {
          aiIndexRef.current = prev.length;
          return [
            ...prev,
             {
          role: "assistant",
          content: "🧠 Thinking...",
          streaming: true,
          thinking: true,
        },
          ];
        });
      },

      // ✅ AUDIO CHUNK — reads ref at event time, never stale
      onAudioChunk: (data) => {
        console.log("🎤 Audio chunk received, forwarding...");
        onAudioChunkRef.current?.(data);
      },
      // ❌ ERROR
      onError: (err) => {
        console.error("AI error:", err);
        setMessagesRef.current((prev) => {
          const updated = [...prev];
          const idx = aiIndexRef.current;
          if (idx !== null && updated[idx]) {
            updated[idx] = {
              role: "assistant",
              content: "Sorry, something went wrong.",
              streaming: false,
            };
          }
          return updated;
        });
        aiIndexRef.current = null;
      },
    });
  }

  function handleSend(courseId, text) {
    setMessagesRef.current((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);
    setMessagesRef.current((prev) => {
      aiIndexRef.current = prev.length;
      return [
        ...prev,
        {
          role: "assistant",
          content: "🧠 Thinking...",
          streaming: true,
          thinking: true,
        },
      ];
    });
    sendAiMessage({ courseId, question: text });
  }

  // ✅ Return everything ChatComponent needs
  return {
    initSocket,
    handleSend,
  };
}