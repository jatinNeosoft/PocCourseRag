import apiClient from "./client"

export function fetchAllCourses() {
  return apiClient.get("/ai/get-all-course")
}



export function fetchAiStatus(courseId) {
  return apiClient.get(`/ai/${courseId}/ai-status`);
}

export function postIndexingRequest(courseId) {
  return apiClient.post(`/ai/${courseId}/start-indexing`);
}

export function fetchChatHistory(courseId){
 return apiClient.get(`/ai/${courseId}/ai-chat-history`) 
}