import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CopyIcon, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FieldSchema {
  workspaceId: string;
  datasetId: string;
}

export function PresetShare({ workspaceId, datasetId }: FieldSchema) {
  const [showLink, setShowLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function encodeIds(workspaceId, dataId) {
    const combinedString = `${workspaceId}/${dataId}`;
    return btoa(combinedString);
  }

  const encodedString = encodeIds(workspaceId, datasetId);
  
  const encodedLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/share-preview/${encodedString}`;

  const handleGenerateClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowLink(true);
      setIsLoading(false);
    }, 1000); // Simulating the loader with 1 second delay
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(encodedLink);
    toast.success('Link has been copied to your clipboard!');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'link'} className="flex gap-2">
          <Link size={16} />
          <span className="xxs:hidden md:block">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="">
        <div className="flex flex-col space-y-2 text-start sm:text-left">
          <h3 className="text-lg font-semibold">Share</h3>
          <p className="text-sm text-muted-foreground">
            Anyone who has this link will be able to view this.
          </p>
        </div>

        {!showLink ? (
          <Button onClick={handleGenerateClick} size="sm" className="mt-4">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Link'}
          </Button>
        ) : (
          <div className="flex items-start space-x-2 pt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" defaultValue={encodedLink} readOnly className="h-9" />
            </div>
            <Button onClick={handleCopyClick} size="sm" className="px-3">
              <span className="sr-only">Copy</span>
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}