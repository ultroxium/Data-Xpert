"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
  {
    "question": "What is DataXpert?",
    "answer": "DataXpert is an open-source SaaS platform designed for data analysis and visualization. It allows users to upload datasets, generate insights, and create interactive charts easily."
  },
  {
    "question": "Is DataXpert free to use?",
    "answer": "Yes! DataXpert is open-source, and you can use it for free. You can also contribute to the project on GitHub if you'd like to help improve it."
  },
  {
    "question": "What file formats does DataXpert support?",
    "answer": "DataXpert supports CSV, and API data for easy data import and analysis."
  },
  {
    "question": "Can I integrate DataXpert with my existing tools?",
    "answer": "Yes! DataXpert offers API access so developers can integrate it with their apps, dashboards."
  },
  {
    "question": "How do I get started with DataXpert?",
    "answer": "You can sign up for a free account on the DataXpert website. Once you're signed in, you can start uploading datasets and analyzing your data."
  }
]

export default function FAQSection() {
  return (
    <div className="py-24 pt-48 flex items-center justify-center bg-black ">
      <div className="w-full max-w-3xl p-8">
        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white mb-12 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl overflow-hidden border border-white border-opacity-10 hover:border-opacity-20 transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        className="w-full p-4 text-left flex justify-between items-center text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-lg">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-purple-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 text-gray-300 bg-black bg-opacity-10">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

