'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface SuggestionsDisplayProps {
  activeCategory: string | null
  suggestions: string
  isLoading: boolean
}

export default function SuggestionsDisplay({
  activeCategory,
  suggestions,
  isLoading,
}: SuggestionsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!activeCategory) return null

  const toggleExpand = () => setIsExpanded(prev => !prev)

  return (
    <Alert className="mt-8 border-l-8 border-r-0 border-t-0 border-b-0">
      <Lightbulb className="h-4 w-4" />
      <AlertTitle className="mb-2 text-base font-semibold">
        Suggestions for {activeCategory}
      </AlertTitle>
      <AlertDescription>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div
              className={`overflow-hidden transition-all duration-100 ${
                isExpanded ? 'max-h-full' : 'max-h-16'
              }`}
            >
              <div
                className="whitespace-pre-wrap text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: suggestions }}
              />
            </div>
            {suggestions?.length > 150 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={toggleExpand}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}