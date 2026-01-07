import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import PageContainer from "@/components/layout/PageContainer";

import { fetchAiStatus, fetchChatHistory } from "@/api/fetchAllCourses";
import { useAiChat } from "@/hooks/useAiChats";

export default function Chat() {
  const bottomRef = useRef(null);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Welcome! Ask me anything about this course.",
    },
  ]);

  const { initSocket, handleSend } = useAiChat({
    setMessages,
  });

  // 🔥 Connect WS ONCE
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1️⃣ Init socket
      initSocket();

      // 2️⃣ Load chat history
      try {
        const history = await fetchChatHistory(courseId);
        if (
          mounted &&
          Array.isArray(history?.chatHistory) &&
          history?.chatHistory?.length > 0
        ) {
          setMessages(history?.chatHistory);
        }
      } catch (err) {
        console.error("❌ Failed to load chat history", err);
      }
    };

    if (courseId) {
      init();
    }

    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // -------------------------------------
  // FETCH AI STATUS
  // -------------------------------------
  const loadAiStatus = useCallback(async () => {
    try {
      const data = await fetchAiStatus(courseId);
      setAiStatus(data);
      return data.status;
    } catch (error) {
      console.error("❌ Failed to fetch AI status", error);
      return null;
    }
  }, [courseId]);

  // -------------------------------------
  // INITIAL LOAD
  // -------------------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      await loadAiStatus();
      if (mounted) setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadAiStatus]);

  // -------------------------------------
  // POLLING WHILE INDEXING
  // -------------------------------------
  useEffect(() => {
    if (!aiStatus || aiStatus.status !== "INDEXING") return;

    const interval = setInterval(async () => {
      const status = await loadAiStatus();
      if (status === "READY" || status === "FAILED") {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [aiStatus?.status, loadAiStatus]);

  // -------------------------------------
  // CHAT HANDLER
  // -------------------------------------
  async function sendMessage(text) {
    handleSend(courseId, text);
  }

  // -------------------------------------
  // LOADING STATE
  // -------------------------------------
  if (loading) {
    return (
      <PageContainer title="AI Mentor">
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-muted-foreground">Checking AI readiness…</p>
        </div>
      </PageContainer>
    );
  }

  // -------------------------------------
  // NOT READY (SETUP / INDEXING / FAILED)
  // -------------------------------------
  if (aiStatus?.status !== "READY") {
    const steps = aiStatus.steps || {};
    const progressPercent = aiStatus.progress ?? 0;

    return (
      <PageContainer title="AI Mentor Setup">
        <Card className="mx-auto mt-10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 AI Mentor Setup
              <Badge
                variant={
                  aiStatus.status === "FAILED" ? "destructive" : "secondary"
                }
              >
                {aiStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* PROGRESS */}
            <Progress value={progressPercent} />
            <p className="text-muted-foreground text-xs">
              {progressPercent}% completed
            </p>

            {/* STEPS */}
            <ul className="space-y-2 text-sm">
              <li>{steps.course_loaded ? "✔" : "⏳"} Course loaded</li>
              <li>{steps.slides_indexed ? "✔" : "⏳"} Slides indexed</li>
              <li>{steps.videos_transcribed ? "✔" : "⏳"} Video transcripts</li>
              <li>{steps.vector_indexed ? "✔" : "⏳"} Vector database</li>
              <li>{steps.graph_indexed ? "✔" : "⏳"} Knowledge graph</li>
            </ul>

            {/* COUNTERS */}
            {aiStatus.counters && (
              <>
                <Separator />
                <div className="space-y-1 text-muted-foreground text-xs">
                  <p>Slides: {aiStatus.counters.slides}</p>
                  <p>Videos: {aiStatus.counters.videos}</p>
                  <p>Graph: {aiStatus.counters.graph}</p>
                </div>
              </>
            )}

            <Separator />

            {/* ACTIONS */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/")}>
                ← Back to Course
              </Button>

              {aiStatus.status === "NOT_STARTED" && (
                <Button
                  onClick={() =>
                    fetch("/api/courses/start-indexing", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ courseId }),
                    })
                  }
                >
                  Start AI Setup
                </Button>
              )}

              {aiStatus.status === "FAILED" && (
                <Button variant="destructive" onClick={loadAiStatus}>
                  Retry Indexing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // -------------------------------------
  // READY → CHAT UI
  // -------------------------------------
  return (
    <PageContainer title="AI Mentor Chat">
      <Card className="flex flex-col h-[75vh] overflow-hidden">
        {" "}
        {/* 🔥 */}
        <CardHeader className="shrink-0">
          {" "}
          {/* 🔥 */}
          <CardTitle className="flex items-center gap-2">
            🤖 AI Mentor
            <Badge className="bg-green-600 text-white">Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {" "}
          {/* 🔥 */}
          <ScrollArea className="flex-1 pr-4 min-h-0">
            {" "}
            {/* 🔥 */}
            <div className="space-y-3">
              {/* {console.log(messages,"messss")} */}
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  streaming={msg.streaming}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="pt-2 shrink-0">
            {" "}
            {/* 🔥 */}
            <ChatInput onSend={sendMessage} />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
