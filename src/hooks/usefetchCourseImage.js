import { useEffect, useState } from "react"
import { checkImageExists, retrieveCoverImage } from "@/api/retrievecoverimage"

const CACHE_DURATION = 50 * 60 * 1000 // 50 minutes

export function useCachedImage(courseId) {
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courseId) return

    let isMounted = true

    async function fetchImage() {
      try {
        setLoading(true)
        setError(null)

        const cacheKey = `courseCoverImage_${courseId}`
        const cached = localStorage.getItem(cacheKey)

        if (cached) {
          const { url, expiryTime } = JSON.parse(cached)
          if (expiryTime > Date.now()) {
            if (isMounted) setImageUrl(url)
            return
          }

          localStorage.removeItem(cacheKey)
        }

        const response = await retrieveCoverImage(courseId)
        const dataUrl = response?.dataUrl

        if (!dataUrl) {
          throw new Error("No image URL returned")
        }
        const exists = await checkImageExists(dataUrl)
        if (!exists) {
          throw new Error("Image does not exist")
        }

        const cacheObject = {
          url: dataUrl,
          expiryTime: Date.now() + CACHE_DURATION,
        }

        localStorage.setItem(cacheKey, JSON.stringify(cacheObject))

        if (isMounted) setImageUrl(dataUrl)
      } catch (err) {
        if (isMounted) setError(err.message)
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchImage()

    return () => {
      isMounted = false
    }
  }, [courseId])

  return {
    imageUrl,
    loading,
    error,
  }
}
