'use client';

import FetchUploader from './upload-api';

import {Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog";

interface UploadDatasetDialogProps {
  wid: string;
}

export default function UploadDatasetDialog({ wid }: UploadDatasetDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className='underline underline-offset-4 hover:text-muted-foreground cursor-pointer'>Fetch from API</span>
      </DialogTrigger>
      <DialogContent className='p-8'>
      <DialogHeader>
          <DialogTitle>Fetch Data from API</DialogTitle>
          <DialogDescription>
            Import data from an API endpoint
          </DialogDescription>
        </DialogHeader>
      <FetchUploader wid={wid} />
      </DialogContent>
    </Dialog>
  );
}
