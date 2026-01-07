import { useRef } from "react";
import { connectAiSocket, sendAiMessage } from "@/config/aiSocket";
import { getToken } from "@/lib/utils";

export function useAiChat({ setMessages }) {
  const aiIndexRef = useRef(null);

  function initSocket() {
    const token = getToken();

    connectAiSocket({
      token,

      // 🔥 STREAMING TOKEN
      onToken: (tokenChunk) => {
        setMessages((prev) => {
          const idx = aiIndexRef.current;
          if (idx === null || !prev[idx]) return prev;

          const updated = [...prev];
          const currentMsg = updated[idx];

          // 🧠 Remove thinking phase once
          if (currentMsg.thinking === true) {
            currentMsg.content = "";
            delete currentMsg.thinking;
          }

          // ✅ JUST APPEND - NO CLEANING DURING STREAMING
          updated[idx] = {
            ...currentMsg,
            content: currentMsg.content + tokenChunk,
          };

          return updated;
        });
      },

      // ✅ STREAM END - CLEAN HERE
      // ✅ STREAM END - CLEAN HERE
      // ✅ STREAM END - CLEAN HERE
      onDone: () => {
        const idx = aiIndexRef.current;
        // Use setTimeout to ensure state update happens after current stack
        setTimeout(() => {
          setMessages((prev) => {
            // Add more defensive checks
            if (idx === null || idx === undefined) {
              console.error("❌ Invalid index:", idx);
              return prev;
            }
            if (!prev[idx]) {
              console.error(`❌ No message found at index ${idx}`);
              return prev;
            }
            const updated = [...prev];
            const currentMsg = updated[idx];
            // Get content safely
            let content = currentMsg.content || "";
            try {
              // 🔥 CLEAN THE COMPLETE CONTENT
              content = content
                // Clean multiple newlines (keep double newlines for paragraphs)
                .replace(/\n{3,}/g, "\n\n")

                // Remove extra spaces (but not in code blocks)
                .replace(/[^\S\n]{2,}/g, " ")

                // Fix spaces inside bold **Heading**
                .replace(/\*\*\s+([^*]+?)\s+\*\*/g, "**$1**")

                .trim();
            } catch (error) {
              console.error("💥 Error cleaning content:", error);
              content = currentMsg.content;
            }

            // CRITICAL: Always set streaming to false
            updated[idx] = {
              ...currentMsg,
              content,
              streaming: false,
            };
            return updated;
          });
        }, 0);
        aiIndexRef.current = null;
      },

      // ❌ ERROR HANDLING
      onError: (err) => {
        console.error("AI error:", err);

        setMessages((prev) => {
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
    // USER message
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    // 🧠 THINKING PHASE
    setMessages((prev) => {
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
