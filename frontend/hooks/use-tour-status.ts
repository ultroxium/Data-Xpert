import { useState, useEffect } from "react"

export function useTourStatus() {
  const [hasSeenTour, setHasSeenTour] = useState(true)

  useEffect(() => {
    const tourStatus = localStorage.getItem("hasSeenTour")
    setHasSeenTour(tourStatus === "true")
  }, [])

  const markTourAsComplete = () => {
    localStorage.setItem("hasSeenTour", "true")
    setHasSeenTour(true)
  }

  return { hasSeenTour, markTourAsComplete }
}

