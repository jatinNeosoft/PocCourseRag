import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative bg-[#1e1e1e] my-3 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-[#2d2d2d] px-3 py-1 text-gray-300 text-xs">
        <span>{language || "code"}</span>
        <button onClick={copy} className="hover:text-white transition">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-gray-100 text-sm">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export default function ChatBubble({ 
  role, 
  content, 
  streaming,
  audioUrl,
  isAudioMessage,
  isAudioPlaying,
}) {
  const isUser = role === "user";
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Audio playback handlers
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Don't clean during streaming to preserve markdown structure
  const cleanContent = streaming 
    ? content 
    : content?.replace(/\n{3,}/g, "\n\n").trim();

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg w-full text-sm",
        isUser
          ? "ml-auto bg-primary text-primary-foreground max-w-[85%]"
          : "bg-muted text-foreground"
      )}
    >
      {/* Audio message indicator */}
      {isAudioMessage && (
        <div className="flex items-center gap-1.5 opacity-70 mb-2 text-xs">
          <Mic className="w-3 h-3" />
          <span>Voice message</span>
        </div>
      )}

      {/* Main content */}
      <div className="overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <div className="mb-2 last:mb-0 wrap-break-word">{children}</div>
            ),
            a: ({ children, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline break-all"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="space-y-1 my-2 pl-5 list-disc">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-1 my-2 pl-5 list-decimal">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="break-words">{children}</li>
            ),
            h1: ({ children }) => (
              <h1 className="mt-4 mb-2 font-bold text-xl break-words">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="mt-3 mb-2 font-bold text-lg break-words">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-2 mb-1 font-bold text-base break-words">{children}</h3>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            code: ({ inline, className, children }) => {
              if (inline)
                return (
                  <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono text-sm break-all">
                    {children}
                  </code>
                );
              const language = className?.replace("language-", "");
              return (
                <CodeBlock language={language} value={String(children).trim()} />
              );
            },
            pre: ({ children }) => (
              <div className="my-2">{children}</div>
            ),
            table: ({ children }) => (
              <div className="my-2 overflow-x-auto">
                <table className="border border-gray-300 min-w-full border-collapse">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border font-semibold text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border break-words">{children}</td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-2 pl-4 border-gray-300 border-l-4 italic">
                {children}
              </blockquote>
            ),
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
      {/* Streaming indicator */}
      {streaming && role === "assistant" && (
        <span className="inline-block bg-gray-400 ml-1 w-2 h-4 align-middle animate-pulse" />
      )}

      {/* ✅ Audio playing indicator - REAL-TIME */}
      {isAudioPlaying && role === "assistant" && !isUser && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-gray-200 dark:border-gray-700 border-t">
          <Volume2 className="w-4 h-4 text-primary animate-pulse" />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-xs">Speaking:</span>
          </div>

          {/* ✅ Audio wave animation */}
          <div className="flex items-center gap-0.5 ml-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-primary rounded-full w-0.5"
                style={{
                  animation: `audioWave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                  height: '8px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ✅ Standalone audio player for text-only responses */}
      {audioUrl && !isUser && !isAudioPlaying && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-gray-200 dark:border-gray-700 border-t">
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleAudio}
            className="p-0 w-8 h-8"
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          <span className="text-muted-foreground text-xs">
            {isPlaying ? "Playing..." : "Play audio response"}
          </span>
        </div>
      )}

      {/* ✅ Processing indicator */}
      {streaming && role === "assistant" && isAudioPlaying && (
        <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Generating audio...</span>
        </div>
      )}
    </div>
  );
}

// ✅ Add CSS animation for audio wave
const style = document.createElement('style');
style.textContent = `
  @keyframes audioWave {
    0%, 100% { height: 8px; }
    50% { height: 16px; }
  }
`;
document.head.appendChild(style);