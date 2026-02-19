import { ScrollArea } from "@/components/ui/scroll-area";

export default function TranscriptPanel() {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-3">
        {/* USER */}
        <div className="bg-primary ml-auto p-3 rounded-lg max-w-[80%] text-primary-foreground">
          Where is my order?
        </div>

        {/* AI */}
        <div className="bg-muted p-3 rounded-lg max-w-[85%]">
          I’m sorry about the delay. Let me check that for you.
        </div>
      </div>
    </ScrollArea>
  );
}
