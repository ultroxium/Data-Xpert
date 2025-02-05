"use client"

import { useScreenSize } from "@/hooks/use-screen"
import { motion } from "framer-motion"
import Logo from "./logo"

export default function MobileMessage() {
  const isDesktop = useScreenSize()

  if (isDesktop) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen w-screen flex items-start justify-center flex-col p-8"
    >
    <Logo className="mb-8"/>
      <h1 className="text-2xl font-semibold mb-4 text-muted-foreground">Mobile Access Limited</h1>
      <p className="text-lg text-gray-700 mb-4">
        Our platform is optimized for larger screens.
      </p>
      <p className="text-base text-gray-600">
        For the best experience, please use a laptop or desktop.
      </p>
    </motion.div>
  )
}