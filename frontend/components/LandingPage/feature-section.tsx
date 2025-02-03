"use client"

import React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Upload, Brain, BarChart3, Database, Cog, LineChart, Users, Github } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Seamless Data Upload",
    description: "Upload datasets in CSV format or fetch data directly from APIs.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Leverage an intelligent AI assistant to explore and analyze data efficiently.",
  },
  {
    icon: BarChart3,
    title: "Interactive Visualizations",
    description:
      "Create dynamic dashboards with a variety of chart types, including bar charts, pie charts, scatter plots, and more.",
  },
  {
    icon: Database,
    title: "Data Preprocessing",
    description: "Clean, normalize, handle outliers, and encode data with built-in processing tools.",
  },
  {
    icon: Cog,
    title: "Machine Learning Model Training",
    description: "Train models using a selection of algorithms for classification and regression tasks.",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description:
      "Make predictions using trained models directly within DataXpert or integrate the prediction API into external projects.",
  },
  {
    icon: Users,
    title: "Collaboration Tools",
    description: "Invite team members with edit or view permissions to collaborate on projects in real-time.",
  },
  {
    icon: Github,
    title: "Open-Source Flexibility",
    description: "Fully open-source, allowing developers to contribute, customize, and deploy their own instances.",
  },
]

export default function FeatureSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section className="relative bg-black py-24 pt-48 overflow-hidden">
      <motion.div className="container mx-auto px-4" style={{ y }}>
        <h2 className="text-5xl font-bold text-center text-white mb-16 relative z-10">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Powerful Features
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative  backdrop-filter backdrop-blur-lg p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden border-gray-400 ${[0,1,2,4,5,6].includes(index)}?"border-r":${[4,5,6,7].includes(index)}?"border-t":"border-none"`}className={`group relative backdrop-filter backdrop-blur-lg p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden border-gray-600 
  ${[0,1,2,4,5,6].includes(index) ? "border-r" : ""}
  ${[4,5,6,7].includes(index) ? "border-t" : ""}
  ${![0,1,2,4,5,6].includes(index) && ![4,5,6,7].includes(index) ? "border-none" : ""}
`}

    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-gray-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-slate-800/80 border-white/60 transform group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-300 mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  )
}

