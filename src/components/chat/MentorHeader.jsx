import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


export default function MentorHeader() {
  return (
    <CardTitle className="flex justify-between items-center">
      {/* LEFT CORNER */}
      <div className="flex items-center gap-3">
        <span className="text-lg">🤖 AI Mentor</span>
        <Badge className="bg-green-600 text-white">Ready</Badge>
      </div>
    </CardTitle>
  );
}

