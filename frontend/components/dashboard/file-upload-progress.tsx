import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { FileIcon } from 'lucide-react'

interface FileUploadProgressProps {
  uploadedFiles: number
  totalFiles: number
}

export default function FileUploadProgress({ uploadedFiles, totalFiles }: FileUploadProgressProps) {
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
            <span className="text-sm font-medium">
              {uploadedFiles}/{totalFiles}
            </span>
          </div>
          <Progress value={progress} className="h-1.5 " />
          <p className="text-xs text-muted-foreground text-right">
            {totalFiles - uploadedFiles} files remaining
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

