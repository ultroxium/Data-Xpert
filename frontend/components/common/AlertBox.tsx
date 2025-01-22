import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '../ui/skeleton';

interface AlertBoxProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLoading?: boolean;
  className?: string;
}

const AlertBox: React.FC<AlertBoxProps> = ({
  icon,
  title,
  description,
  className = ' bg-red-400/20',
  isLoading = false,
}) => {
  return (
    <Alert className={`${className} my-4`}>
      {isLoading ? <Skeleton className="w-4 h-4 mb-2" /> : icon}
      <AlertTitle>{isLoading ? <Skeleton className="w-1/3 h-4" /> : title}</AlertTitle>
      <AlertDescription>
        {isLoading ? <Skeleton className="w-full h-6" /> : description}
      </AlertDescription>
    </Alert>
  );
};

export default AlertBox;
