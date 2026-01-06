import PageContainer from "@/components/layout/PageContainer";
import CourseCard from "@/components/course/CourseCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllCourses, postIndexingRequest } from "@/api/fetchAllCourses";
import { Input } from "@/components/ui/input"; // shadcn input

export default function CourseSelect() {
  const navigate = useNavigate();
  const [fetchCourses, setFetchCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllCourses();
      setFetchCourses(data.data);
      setFilteredCourses(data.data);
    };
    fetchData();
  }, []);

  // Filter courses whenever searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredCourses(fetchCourses);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = fetchCourses.filter(
        (course) =>
          course.course_name.toLowerCase().includes(term) ||
          (course.tags?.join(" ").toLowerCase().includes(term))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, fetchCourses]);

  const handleSelect = async (course) => {
    if (course?.show_start_indexing)  await postIndexingRequest(course.id);
   
    navigate(`/chat/${course.id}`);
  };

  return (
    <PageContainer title="AI Mentor">
      <p className="mb-4 text-muted-foreground">
        Select a course to start chatting with your AI mentor
      </p>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Courses Grid */}
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
    </PageContainer>
  );
}
