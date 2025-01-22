"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: "What is DataXpert tool for?",
    answer: "DataXpert is a comprehensive data visualization and analysis platform designed to help businesses and individuals transform complex data into actionable insights through interactive charts, graphs, and AI-powered analytics."
  },
  {
    question: "Is this free?",
    answer: "Yes, this tool is completely free and open-source."
  },
  {
    question: "Can I collaborate with my team on DataXpert?",
    answer: "DataXpert offers robust collaboration features. You can share dashboards, work on projects simultaneously with team members, and even set different permission levels for various users. Real-time updates ensure everyone stays on the same page."
  },
  {
    question: "What types of data can I upload to DataXpert?",
    answer: "DataXpert supports a CSV data. You can also connect to various APIs to import data directly from other platforms and services."
  },
  {
    question: "How to report bug?",
    answer: "Please DM me on twitter or open an issue on GitHub, and I’ll address it as soon as possible. Your assistance in fixing it would be greatly appreciated."
  }
]

export default function FAQ() {
  return (
    <section className="py-16 ">
      <h2 className="text-3xl font-bold text-center mb-12 text-muted-foreground">Frequently <span className='text-primary'>Asked Questions</span></h2>    
        <div className="max-w-[75vw] mx-auto">
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
    </section>
  )
}
