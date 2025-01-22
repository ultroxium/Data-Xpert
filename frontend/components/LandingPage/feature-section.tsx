'use client'


const features = [
  {
    id: 1,
    title: 'Data Analysis',
    description:
      'Analyze your data with our powerful tools and get insights with AI Assistant.',
  },
  {
    id: 2,
    title: 'Visualization',
    description:
      'Visualize your data with our wide range of charts and graphs.',
  },
  {
    id: 3,
    title: 'Preprocess & Training',
    description:
      'Preprocess your data and train models with our easy-to-use tools.',
  },
  {
    id: 4,
    title: 'Predictions',
    description:
      'Make predictions with your trained models and use them with ease.',
  }
]


const FeaturesSection = () => {
  return (
      <div className="container mx-auto px-4 pt-24 pb-48 flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className=" flex flex-col items-start justify-start gap-4">
              <span className="text-xl">0{feature.id}</span>
              <h3 className="text-4xl">{feature.title}</h3>
              <p className="">{feature.description}</p>
            </div>
          ))}
        </div> 
      </div>
  )
}

export default FeaturesSection;