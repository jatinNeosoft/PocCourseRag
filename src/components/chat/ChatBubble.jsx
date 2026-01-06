import { cn } from "@/lib/utils"

export default function ChatBubble({ role, message }) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg max-w-[70%] text-sm",
        isUser
          ? "ml-auto bg-primary text-primary-foreground"
          : "bg-muted"
      )}
    >
      {message}
    </div>
  )
}
