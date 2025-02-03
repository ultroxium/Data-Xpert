import type React from "react"
import JoyrideTour from "."

interface LayoutProps {
  children: React.ReactNode
}

export default function Wrapper({ children }: LayoutProps) {
  return (
    <div>
      <JoyrideTour />
      {children}
    </div>
  )
}

