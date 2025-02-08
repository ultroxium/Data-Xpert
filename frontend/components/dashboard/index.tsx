"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { useScreenSize } from "@/hooks/use-screen";
import {
  FileX,
  Search
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Topbar from "../common/top-bar";
import SortBy from "./Sortby";
import { DatasetGrid } from "./dataset-grid";
import { WorkspaceSidebar } from "./side-bar";
import CSVUploader from "./upload-csv";

const DashboardComponent = ({
  workspacesData,
  workspaceData,
  datasetsData,
  mutation,
  deleteDatasetMutation,
  moveDatasetMutation,
  loadingWorkspace,
  loadingWorkspaces,
  loadingDatasets,
}: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [widNo, setWidNo] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState("asc");

  useEffect(() => {
    const workspaceParam = searchParams.get("wsn");
    const widParam = searchParams.get("wid");
    const widNumber = parseInt(widParam ?? "", 10);

    if (workspaceParam && workspaceParam !== workspaceName) {
      setWorkspaceName(workspaceParam);
    }

    if (widParam && widNumber !== widNo) {
      setWidNo(widNumber);
    } else if (!widParam && widNo !== 0) {
      setWidNo(0);
    }
  }, [searchParams, workspaceName, widNo]);

  const FilteredWorkspaces = workspacesData?.filter(
    (workspace: any) => workspace?.name !== workspaceName
  );

  const filteredDatasets = datasetsData?.filter((dataset: any) =>
    dataset?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (sort: string) => {
    setSortOptions(sort);
  };

  const sortedDatasets = filteredDatasets
    ?.map((dataset) => dataset)
    .sort((a, b) => {
      if (sortOptions === "asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOptions === "desc") {
        return b.name.localeCompare(a.name);
      } else if (sortOptions === "created_at") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (sortOptions === "updated_at") {
        return (
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );
      }
    });

  const { data: me, isLoading: meLoading, error: profileError } = useProfile();

  const isDesktop = useScreenSize();

  if (!isDesktop) return null;

  return (
    <main className="h-screen bg-background w-full">
      <Topbar title="Dashboard" workspaceData={workspaceData} />
      <div className="w-full flex">
        <WorkspaceSidebar
          loadingWorkspaces={loadingWorkspaces}
          loadingWorkspace={loadingWorkspace}
          workspacesData={workspacesData}
          mutation={mutation}
          workspaceData={workspaceData}
          me={me}
          widNo={widNo}
          workspaceName={workspaceName}
        />

        <section
          className="w-full p-8 flex gap-8 h-[calc(100vh-4rem)] overflow-y-auto items-start justify-between overflow-x-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex-1 flex flex-col space-y-8">
            <div className="">
              <CSVUploader wid={widNo.toString()} />
            </div>
            <div className="w-full flex justify-between items-center border-t pt-8">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="text"
                  className="pl-10 w-64"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <SortBy handleSort={handleSort} />
            </div>
            <div>
              {loadingDatasets ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : sortedDatasets?.length > 0 ? (
                <DatasetGrid
                  datasets={sortedDatasets}
                  widNo={widNo}
                  FilteredWorkspaces={FilteredWorkspaces}
                  deleteDatasetMutation={deleteDatasetMutation}
                  moveDatasetMutation={moveDatasetMutation}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const EmptyState = () => (
  <div className="text-center py-12">
    <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-2 text-lg font-medium">No datasets</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      Get started by uploading a new dataset.
    </p>
  </div>
);

export default DashboardComponent;
