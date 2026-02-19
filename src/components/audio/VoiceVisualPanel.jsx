import { Button } from "@/components/ui/button";

export default function VoiceVisualPanel() {
  return (
    <>
      {/* CENTER ORB */}
      <div className="flex flex-1 justify-center items-center">
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 opacity-60 blur-3xl rounded-full animate-pulse" />

          {/* Orb */}
          <div className="relative flex justify-center items-center bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 rounded-full w-48 h-48">
            <span className="text-white text-4xl">🤖</span>
          </div>
        </div>
      </div>

      {/* END CALL */}
      <Button
        variant="destructive"
        className="px-6 py-2 rounded-full"
      >
        ⏹ End Call
      </Button>
    </>
  );
}
