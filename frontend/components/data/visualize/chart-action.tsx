import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";

import { ConfirmationAlert } from "@/components/common/confirmation-alert";
import {
  ChangeChars,
  IncludeChartsForOptions,
  PlotOptions,
} from "@/config/chart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Calculator,
  Copy,
  CornerDownRight,
  Disc2,
  Ellipsis,
  FilePenLine,
  List,
} from "lucide-react";
import { toast } from "sonner";

const ChartActions = ({
  item,
  columnDetails,
  getEditLabel,
  workspaceId,
  datasetId,
  updateChartMutation,
}) => {
  const queryClient = useQueryClient();

  const deleteChartNew = async (workspaceId: string, chartId: string) => {
    const response = await axios.delete(
      `/datasets/api/${workspaceId}/${datasetId}/charts?type=charts&cid=${chartId}`
    );
    return response.data;
  };

  const duplicateChartNew = async (workspaceId: string, chartId: string) => {
    const response = await axios.post(
      `/datasets/api/${workspaceId}/${datasetId}/charts?type=duplicate&cid=${chartId}`
    );
    return response.data;
  };

  const deleteChartMutation = useMutation({
    mutationFn: ({
      workspaceId,
      chartId,
    }: {
      workspaceId: string;
      chartId: string;
    }) => deleteChartNew(workspaceId, chartId),
    onSuccess: () => {
      if (workspaceId && datasetId) {
        queryClient.invalidateQueries({
          queryKey: ["charts", workspaceId, datasetId],
        });
      }
      toast.success("Chart deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    },
  });

  const duplicateChartMutation = useMutation({
    mutationFn: ({
      workspaceId,
      chartId,
    }: {
      workspaceId: string;
      chartId: string;
    }) => duplicateChartNew(workspaceId, chartId),
    onSuccess: () => {
      if (workspaceId && datasetId) {
        queryClient.invalidateQueries({
          queryKey: ["charts", workspaceId, datasetId],
        });
      }
      toast.success("Chart duplicated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    },
  });

  const checkType = (selectedData: string, dtype: string) => {
    let field = null;
    if (dtype === "PROCESSED") {
      field = columnDetails?.processed?.find(
        (item: any) => item.name === selectedData
      );
    } else {
      field = columnDetails?.unprocessed?.find(
        (item: any) => item.name === selectedData
      );
    }
    if (field?.type === "number") {
      return true;
    }
    return false;
  };

  const colorOptions = [
    {
      label: "Slate",
      value: "#1e293b",
    },
    {
      label: "Red",
      value: "#991b1b",
    },
    {
      label: "Orange",
      value: "#ea580c",
    },
    {
      label: "Amber",
      value: "#fbbf24",
    },
    {
      label: "Yellow",
      value: "#facc15",
    },
    {
      label: "Lime",
      value: "#65a30d",
    },
    {
      label: "Green",
      value: "#15803d",
    },
    {
      label: "Teal",
      value: "#0f766e",
    },
    {
      label: "Blue",
      value: "#1d4ed8",
    },
    {
      label: "Indigo",
      value: "#4338ca",
    },
    {
      label: "Violet",
      value: "#6d28d9",
    },
    {
      label: "Pink",
      value: "#db2777",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="py-0 px-2">
          <Ellipsis size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={() => getEditLabel(item?.id)}
        >
          <FilePenLine size={15} />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3">
            <CornerDownRight size={15} />
            Change to
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {ChangeChars.filter(
                (chart) => chart.key === item?.key
              )[0]?.chanage_to?.map((list: any) => (
                <DropdownMenuItem
                  key={list?.key}
                  onClick={async () => {
                    await updateChartMutation.mutateAsync({
                      workspaceId: item?.workspace_id,
                      chartId: item?.id,
                      data: {
                        key: list?.key,
                      },
                    });
                  }}
                  className="flex gap-2 items-center"
                >
                  {list?.icon}
                  <span>{list?.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {IncludeChartsForOptions.includes(item?.key) && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-3">
              <List size={15} />
              Options
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {PlotOptions.filter((chart) => chart.key === item?.key).map(
                  (opt: any) =>
                    (checkType(item?.yAxis?.[0], item?.dtype) ||
                      checkType(item?.column, item?.dtype) ||
                      item?.key === "correlation") &&
                    opt?.plot_options
                      ?.filter((selected) => selected !== item?.option)
                      .map((list: any) => (
                        <DropdownMenuItem
                          key={list}
                          onClick={async () => {
                            await updateChartMutation.mutateAsync({
                              workspaceId: item?.workspace_id,
                              chartId: item?.id,
                              data: {
                                option: list,
                              },
                            });
                          }}
                          className="flex gap-2 items-center"
                        >
                          <Calculator size={16} />
                          <span className="uppercase text-muted-foreground">
                            {list}
                          </span>
                        </DropdownMenuItem>
                      ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}

        {ChangeChars.filter(
          (chart) => chart.key === item?.key && chart.isColor
        ).map((chart) => (
          <DropdownMenuSub key={chart.key}>
            <DropdownMenuSubTrigger className="flex items-center gap-3">
              <Disc2 size={15} />
              Color
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {colorOptions.map((list: any) => (
                  <DropdownMenuItem
                    key={list.label}
                    onClick={async () => {
                      await updateChartMutation.mutateAsync({
                        workspaceId: item?.workspace_id,
                        chartId: item?.id,
                        data: {
                          color: list.value,
                        },
                      });
                    }}
                    className="flex gap-2 items-center"
                  >
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: list.value }}
                    />
                    <span className="uppercase text-muted-foreground">
                      {list.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}

        <DropdownMenuSeparator />
        {/* <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={() => {
            // duplicateDataset(dataset?.id);
          }}>
          <Download size={15} />
          Download
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={() => {
            // duplicateDataset(dataset?.id);
          }}>
          <Printer size={15} />
          Print
        </DropdownMenuItem> */}

        <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={async () => {
            await duplicateChartMutation.mutateAsync({
              workspaceId: item?.workspace_id,
              chartId: item?.id,
            });
          }}
        >
          <Copy size={15} />
          Duplicate
        </DropdownMenuItem>

        {/* <DropdownMenuItem
          className="flex items-center gap-3"
          onClick={() => {
            // duplicateDataset(dataset?.id);
          }}>
          <Share2 size={15} />
          Share
        </DropdownMenuItem> */}

        <ConfirmationAlert
          handleConfirm={async () => {
            await deleteChartMutation.mutateAsync({
              workspaceId: item?.workspace_id,
              chartId: item?.id,
            });
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChartActions;
