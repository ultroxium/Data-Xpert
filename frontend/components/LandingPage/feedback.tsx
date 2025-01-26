"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "sonner"

export default function FeedbackBox() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const questions = [
    "Hey there! 👋 What's your name?",
    `Nice to meet you, ${name}! What's your email address?`,
    "Awesome! We'd love to hear your thoughts. What's your feedback?",
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await axios.post("/api/feedback", {
        name: name,
        email: email,
        message: feedback,
      })

      // Reset form and show success message
      setStep(0)
      setName("")
      setEmail("")
      setFeedback("")
      toast.success("Feedback submitted successfully!")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateInput = () => {
    if (step === 0 && !name.trim()) {
      setError("Please enter your name.")
      return false
    }
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.")
        return false
      }
    }
    if (step === 2 && !feedback.trim()) {
      setError("Please enter your feedback.")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateInput()) {
      setError("")
      if (step < 2) {
        setStep(step + 1)
      } else {
        handleSubmit()
      }
    }
  }

  return (
    <div className="pt-24 pb-48 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback</h2>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-600 mb-2">{questions[step]}</p>
                {step === 0 && (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full"
                    aria-label="Your name"
                  />
                )}
                {step === 1 && (
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full"
                    aria-label="Your email"
                  />
                )}
                {step === 2 && (
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your feedback here..."
                    className="w-full"
                    rows={4}
                    aria-label="Your feedback"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {error}
            </p>
          )}
          <Button onClick={handleNext} className="w-full mt-4" disabled={isSubmitting}>
            {step < 2 ? "Next" : isSubmitting ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </div>
    </div>
  )
}

