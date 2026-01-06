import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCachedImage } from "@/hooks/usefetchCourseImage"

export default function CourseCard({ course, onSelect }) {
  const { imageUrl, loading } = useCachedImage(course.id)

  return (
    <Card className="flex flex-col hover:shadow-lg h-full overflow-hidden transition">
      {/* Image */}
      <div className="relative bg-muted w-full h-40 overflow-hidden">
        {loading ? (
          <div className="bg-muted w-full h-full animate-pulse" />
        ) : (
          <img
            src={imageUrl}
            alt={course.course_name}
            className="w-full h-full object-cover"
          />
        )}

        {/* AI STATUS BADGE */}
        <div className="top-2 right-2 absolute">
          {course.ai_status === "READY" && (
            <Badge className="bg-green-600 text-white">AI Ready</Badge>
          )}
          {course.ai_status === "INDEXING" && (
            <Badge variant="secondary">Indexing</Badge>
          )}
          {course.ai_status === "FAILED" && (
            <Badge variant="destructive">Failed</Badge>
          )}
          {course.ai_status === "NOT_STARTED" && (
            <Badge variant="outline">AI Not Setup</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 p-6">
        <h3 className="font-semibold text-xl">{course.course_name}</h3>

        <p className="mt-3 mb-4 text-muted-foreground text-sm line-clamp-3">
          {course.course_desc}
        </p>

        {/* Button pinned to bottom */}
        <div className="mt-auto">
          <Button
            className="w-full"
            onClick={() => onSelect(course)}
          >
            Start Learning
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
