"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, ChevronUp, ChevronDown, Clock, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryItem {
  id: string
  prompt: string
  timestamp: Date
}

export function ChartBuilderAI() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Here you would typically call your AI service
    // For demonstration, we're just using a timeout
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    
    // Add the current prompt to history
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date()
    }
    setHistory(prevHistory => [newHistoryItem, ...prevHistory])
    
    // Handle the generated chart data here
  }

  const handleHistoryItemClick = (item: HistoryItem) => {
    setPrompt(item.prompt)
  }

  return (
    <Card className="fixed bottom-0 right-[20rem] w-80 overflow-hidden">
      <CardHeader 
        className="cursor-pointer py-2" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-16 py-2 font-normal text-blue-400 flex items-center gap-2 underline underline-offset-2"><Sparkles size={16} className="animate-pulse"/> Create with AI</CardTitle>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </CardHeader>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                >
                  <span className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    History
                  </span>
                  {isHistoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <AnimatePresence initial={false}>
                {isHistoryOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScrollArea className="h-40 border-b">
                      {history.length > 0 ? (
                        <ul className="p-4 space-y-2">
                          {history.map((item) => (
                            <li key={item.id} className="flex justify-between items-center">
                              <Button
                                variant="ghost"
                                className="text-left truncate max-w-[180px]"
                                onClick={() => handleHistoryItemClick(item)}
                              >
                                {item.prompt}
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleTimeString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="p-4 text-center text-muted-foreground">No history yet</p>
                      )}
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="p-4">
                <Textarea
                  placeholder="Describe the chart you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="pb-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()} 
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Chart
                  </>
                )}
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

