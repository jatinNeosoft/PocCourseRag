import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

export default function ChatBubble({ role, content, streaming }) {
  const isUser = role === "user";

  // Don't clean during streaming to preserve markdown structure
  const cleanContent = streaming 
    ? content 
    : content
        ?.replace(/\n{3,}/g, "\n\n") // only remove excessive newlines
        .trim();

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg w-full text-sm", // Changed: removed max-w, added w-full
        isUser
          ? "ml-auto bg-primary text-primary-foreground max-w-[85%]" // User messages stay constrained
          : "bg-muted text-foreground" // AI messages take full width
      )}
    >
      <div className="overflow-x-auto"> {/* Added: horizontal scroll wrapper */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2 last:mb-0 break-words">{children}</p>
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
      {/* {console.log(streaming,"streaming", role) } */}
      {streaming && role === "assistant" && (
        <span className="inline-block bg-gray-400 ml-1 w-2 h-4 align-middle animate-pulse" />
      )}
    </div>
  );
}