import { Loader2 } from 'lucide-react';
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

interface CommonConfirmationAlertProps {
  component: React.ReactNode;
  title: string;
  description: string;
  btnText?: string;
  handleConfirm?: () => void;
  loading?: boolean;
  loadingText?: string;
}

export function CommonConfirmationAlert({
  component,
  title,
  description,
  handleConfirm,
  btnText = 'Continue',
  loading = false,
  loadingText = 'Please wait...',
}: CommonConfirmationAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{component}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row items-center justify-end gap-4">
          <AlertDialogCancel className="w-fit m-0">Cancel</AlertDialogCancel>
          <AlertDialogAction className="w-fit m-0" onClick={handleConfirm}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> {loadingText}
              </div>
            ) : (
              btnText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
