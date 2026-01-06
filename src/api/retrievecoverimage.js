import apiClient from "./client"

export function retrieveCoverImage(courseId) {
  return apiClient.post(`/ai/retriever-cover-image`, { courseId })
}

export function checkImageExists(imageUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false); // We're using resolve(false) instead of reject() to handle the case gracefully
    image.src = imageUrl;
  });
}
