"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Clock,
  RefreshCw,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
}

export function ChartBuilderAI() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Here you would typically call your AI service
    // For demonstration, we're just using a timeout
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);

    // Add the current prompt to history
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
    };
    setHistory((prevHistory) => [newHistoryItem, ...prevHistory]);

    // Handle the generated chart data here
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setPrompt(item.prompt);
  };

  return (
    <>
      <CardContent className="p-0">
        <div className="py-4 border-b">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            <span className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              History
            </span>
            {isHistoryOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {isHistoryOpen && (
          <ScrollArea className="h-40 border-b">
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center"
                  >
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
              <p className="py-4 text-center text-muted-foreground">
                No history yet
              </p>
            )}
          </ScrollArea>
        )}
        <div className="py-4">
          <Textarea
            placeholder="Describe the chart you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-64 resize-y"
          />
        </div>
      </CardContent>
      <CardFooter className="p-0 pb-4">
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
    </>
  );
}
