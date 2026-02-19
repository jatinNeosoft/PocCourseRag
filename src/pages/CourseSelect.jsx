import PageContainer from "@/components/layout/PageContainer";
import CourseCard from "@/components/course/CourseCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchAllCourses, postIndexingRequest } from "@/api/fetchAllCourses";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function CourseSelect() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ready");

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllCourses();
      setCourses(data.data);
    };
    fetchData();
  }, []);

  const handleSelect = async (course) => {
    if (course?.show_start_indexing) {
      await postIndexingRequest(course.id);
    }
    navigate(`/chat/${course.id}`);
  };

  // 🔍 Filter logic (tab + search)
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) =>
        activeTab === "ready"
          ? course.ai_status === "READY"
          : course.ai_status !== "READY"
      )
      .filter((course) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          course.course_name.toLowerCase().includes(term) ||
          course.course_desc?.toLowerCase().includes(term) ||
          course.tags?.join(" ").toLowerCase().includes(term)
        );
      });
  }, [courses, searchTerm, activeTab]);

  return (
    <PageContainer title="AI Mentor">
      <p className="mb-4 text-muted-foreground">
        Select a course to start chatting with your AI mentor
      </p>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ready">AI Ready</TabsTrigger>
          <TabsTrigger value="not-ready">Not Ready</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <p className="col-span-full text-muted-foreground text-center">
                No courses found
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
