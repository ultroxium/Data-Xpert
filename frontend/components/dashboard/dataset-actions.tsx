'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationAlert } from '@/components/common/confirmation-alert';
import useDatasetStore from '@/store/dashboard/dashboard-datasets';
import { BarChart, Bot, CircuitBoard, Ellipsis, EyeIcon, Folder, Move, RefreshCcw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const DatasetActions = ({
  dataset,
  widNo,
  FilteredWorkspaces,
  deleteDatasetMutation,
  moveDatasetMutation,
}:any) => {
  const router = useRouter();
  const { duplicateDataset }: any = useDatasetStore();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const deleteDataset = (datasetId: string, workspaceId: string) => {
    deleteDatasetMutation.mutate({ datasetId, workspaceId });
  };

  const moveDataset = (datasetId: string, current_wid: string, workspace_id: string) => {
    moveDatasetMutation.mutate({
      datasetId: datasetId,
      currentWorkspaceId: current_wid,
      workspaceId: workspace_id,
    });
  };

  const refreshMutation = useMutation({
    mutationFn: ({
      workspaceId,
      datasetId,
      refresh_period,
    }: {
      workspaceId: string;
      datasetId: string;
      refresh_period: string;
    }) => {
      return axios.put(
        `/workspaces/api?type=refresh&did=${datasetId}&wid=${workspaceId}&rp=${refresh_period}`,
        {},
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset refreshed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="py-0 px-2" onClick={() => setOpen((prev) => !prev)}>
          <Ellipsis size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={() => {
            router.push(`/datasets/${dataset?.workspace_id}/${dataset?.id}?tab=overview`);
            setOpen(false);
          }}>
          <EyeIcon size={15} />
          View
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={() => {
            router.push(`/datasets/${dataset?.workspace_id}/${dataset?.id}?tab=assistant`);
            setOpen(false);
          }}>
          <Bot size={15} />
          Ask AI
        </DropdownMenuItem> */}
       
        {/* <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3">
            <Move size={15} />
            Move to
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {FilteredWorkspaces?.map((item: any) => (
                <DropdownMenuItem
                  key={item?.id}
                  onClick={() => {
                    moveDataset(dataset?.id, widNo, item?.id);
                    setOpen(false);
                  }}
                  className="flex gap-2 items-center">
                  <Folder size={16} />
                  <span>{item?.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub> */}
        {dataset?.is_api_data && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-3">
              <RefreshCcw size={15} />
              Refresh data
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  className="flex gap-2 items-center"
                  onClick={() => {
                    refreshMutation.mutateAsync({
                      workspaceId: dataset?.workspace_id,
                      datasetId: dataset?.id,
                      refresh_period: '0',
                    });
                  }}>
                  <span>Refresh</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex gap-2 items-center"
                  onClick={() => {
                    refreshMutation.mutateAsync({
                      workspaceId: dataset?.workspace_id,
                      datasetId: dataset?.id,
                      refresh_period: '60',
                    });
                  }}>
                  <span>Refresh Every 1 minute</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex gap-2 items-center"
                  onClick={() => {
                    refreshMutation.mutateAsync({
                      workspaceId: dataset?.workspace_id,
                      datasetId: dataset?.id,
                      refresh_period: '300',
                    });
                  }}>
                  <span>Refresh Every 5 minutes</span>
                </DropdownMenuItem>
                <CustomeRefresher
                  dialogOpen={dialogOpen}
                  setDialogOpen={setDialogOpen}
                  workspaceID={dataset?.workspace_id}
                  datasetId={dataset?.id}
                  refreshMutation={refreshMutation}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />
        <ConfirmationAlert
          handleConfirm={() => {
            deleteDataset(dataset?.id, dataset?.workspace_id);
            setOpen(false);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CustomeRefresher = ({
  dialogOpen,
  setDialogOpen,
  workspaceID,
  datasetId,
  refreshMutation,
}) => {
  const [period, setPeriod] = useState('0');

  const handleSave = () => {
    refreshMutation.mutateAsync({
      workspaceId: workspaceID,
      datasetId: datasetId,
      refresh_period: period,
    });
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setDialogOpen(true);
          }}
          className="flex gap-2 items-center">
          <span>Custom</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Custom Refresh Period</DialogTitle>
          <DialogDescription>Set a custom refresh period for your dataset.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="period">Refresh Every (Seconds)</Label>
          <Input
            type="number"
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Enter period in seconds"
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetActions;
