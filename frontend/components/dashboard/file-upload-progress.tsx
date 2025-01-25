import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { FileIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface FileUploadProgressProps {
  uploadedFiles: number
  totalFiles: number
  isLoading: boolean
}

export default function FileUploadProgress({ uploadedFiles, totalFiles, isLoading }: FileUploadProgressProps) {
  const progress = (uploadedFiles / totalFiles) * 100

  return (
    <Card className="w-full max-w-md mx-auto shadow-none">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium">Files</h3>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-sm font-medium">
                {uploadedFiles}/{totalFiles}
              </span>
            )}
          </div>
          {isLoading ? <Skeleton className="h-1.5 w-full" /> : <Progress value={progress} className="h-1.5" />}
          {isLoading ? (
            <Skeleton className="h-4 w-32 ml-auto" />
          ) : (
            <p className="text-xs text-muted-foreground text-right">{totalFiles - uploadedFiles} files remaining</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

