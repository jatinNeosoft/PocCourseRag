import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function VoiceControls() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="flex justify-center p-4 border-t">
      <Button
        size="lg"
        className="rounded-full w-20 h-20 text-2xl"
        variant={recording ? "destructive" : "default"}
        onClick={() => setRecording(!recording)}
      >
        {recording ? "■" : "🎤"}
      </Button>
    </div>
  );
}
