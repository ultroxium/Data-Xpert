"use client"

import { motion } from "framer-motion"

const features = [
  {
    id: 1,
    title: "Data Analysis",
    description: "Analyze your data with our powerful tools and get insights with AI Assistant.",
  },
  {
    id: 2,
    title: "Visualization",
    description: "Visualize your data with our wide range of charts and graphs.",
  },
  {
    id: 3,
    title: "Preprocess & Training",
    description: "Preprocess your data and train models with our easy-to-use tools.",
  },
  {
    id: 4,
    title: "Predictions",
    description: "Make predictions with your trained models and use them with ease.",
  },
]

const FeatureCard = ({ feature, index }: { feature: (typeof features)[0]; index: number }) => {
  return (
    <motion.div
      key={feature.id}
      className="flex flex-col items-start justify-start gap-4 p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="text-xl font-bold text-blue-600"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
      >
        0{feature.id}
      </motion.span>
      <motion.h3
        className="text-2xl font-semibold text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
      >
        {feature.title}
      </motion.h3>
      <motion.p
        className="text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
      >
        {feature.description}
      </motion.p>
    </motion.div>
  )
}

const FeaturesSection = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection

