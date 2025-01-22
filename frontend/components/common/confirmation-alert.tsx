import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationAlertProps {
  handleConfirm: () => void;
}

export function ConfirmationAlert({ handleConfirm }: ConfirmationAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full p-0 flex gap-3 justify-start px-2 font-normal rounded-sm">
          <Trash size={15} className="text-red-500" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            This action cannot be undone. This will permanently delete your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row items-center justify-end gap-4">
          <AlertDialogCancel className="w-fit m-0">Cancel</AlertDialogCancel>
          <AlertDialogAction className="w-fit m-0" onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
