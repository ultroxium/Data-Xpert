"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Joyride, { type Step, type CallBackProps } from "react-joyride"

interface UserGuideProps {
  steps: Step[]
}

const UserGuide: React.FC<UserGuideProps> = ({ steps }) => {
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Start the tour when the component mounts
    setRun(true)
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if (status === "finished" || status === "skipped") {
      // Tour is finished or skipped, you can perform any necessary actions here
      setRun(false)
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      styles={{
        options: {
          primaryColor: "#007bff",
        },
      }}
      callback={handleJoyrideCallback}
    />
  )
}

export default UserGuide

