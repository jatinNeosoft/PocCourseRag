import { useRef } from "react";
import { connectAiSocket, sendAiMessage } from "@/config/aiSocket";
import { getToken } from "@/lib/utils";

export function useAiChat({ setMessages }) {
  const aiIndexRef = useRef(null);

  function initSocket() {
    const token = getToken(); 
    connectAiSocket({
      token,

      onToken: (token) => {
        console.log(token,"tokentokentokentoken");
        
        setMessages((prev) => {
          const updated = [...prev];
          const idx = aiIndexRef.current;

          if (idx !== null && updated[idx]) {
            updated[idx] = {
              ...updated[idx],
              message: updated[idx].message + token,
            };
          }

          return updated;
        });
      },

      onDone: () => {
        aiIndexRef.current = null;
      },

      onError: (err) => {
        console.error("AI error:", err);
        setMessages((prev) => {
          const updated = [...prev];
          const idx = aiIndexRef.current;

          if (idx !== null && updated[idx]) {
            updated[idx] = {
              role: "ai",
              message: "Sorry, something went wrong.",
            };
          }
          return updated;
        });
      },
    });
  }

  function handleSend(courseId,text) {
    // 1️⃣ USER message (optimistic)
    setMessages((prev) => [...prev, { role: "user", message: text }]);

    // 2️⃣ Empty AI message
    setMessages((prev) => {
      aiIndexRef.current = prev.length;
      return [...prev, { role: "ai", message: "" }];
    });

    // 3️⃣ Emit to socket
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
