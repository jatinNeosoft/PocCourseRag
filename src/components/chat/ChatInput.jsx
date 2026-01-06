import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value)
    setValue("")
  }

  return (
    <div className="flex gap-2 p-4 border-t">
      <Input
        placeholder="Ask your AI mentor..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  )
}
