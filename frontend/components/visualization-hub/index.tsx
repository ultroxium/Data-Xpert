'use client';

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchParam from "@/lib/search-param";
import Topbar from "../common/top-bar";
import { VisualizationHubSidebar } from "./sidebar";

const fetchDatasets = async (workspaceId: string): Promise<any> => {
    const response = await axios.get(`/dashboard/api?type=datasets&wid=${workspaceId}`);
    return response.data;
};

export const fetchDefaultDatasets = async (): Promise<any> => {
    const response = await axios.get(`/dashboard/api?type=default`);
    return response.data;
};

export default function VisualizationHubComponent() {
    const workspaceId = SearchParam('wid');
    const {
        data: datasetsData,
        isLoading: loadingDatasets,
        error: datasetsError,
    } = useQuery({
        queryKey: ['datasets', workspaceId],
        queryFn: () => {
            if (workspaceId && workspaceId !== '0') {
                return fetchDatasets(workspaceId);
            } else {
                return fetchDefaultDatasets();
            }
        },
    });

    if (datasetsError) {
        return <div className="flex items-center justify-center h-screen">Error fetching datasets: {datasetsError instanceof Error ? datasetsError.message : 'Unknown error'}</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <VisualizationHubSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar title="Visualization Hub" />
                <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingDatasets ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <Card key={index} className="overflow-hidden h-[200px] shadow-none">
                                    <CardContent className="p-0 h-full">
                                        <Skeleton className="w-full h-full" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            datasetsData?.map((data: any) => (
                                <Card key={data?.id} className="overflow-hidden h-[200px] shadow-none">
                                    <CardContent className="p-0 h-[150px] relative">
                                        <div className="w-full h-full overflow-hidden">
                                            <iframe
                                                src={`/datasets/${data?.workspace_id}/${data?.id}?tab=visualize`}
                                                title={`Visualization for dataset ${data?.id}`}
                                                className="w-full h-full border-0 transform scale-[0.25] origin-top-left"
                                                style={{
                                                    width: '400%',
                                                    height: '400%',
                                                }}
                                                loading="lazy"
                                            />
                                            <div 
                                                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 cursor-pointer"
                                                onClick={() => window.open(`/datasets/${data?.workspace_id}/${data?.id}?tab=visualize`, '_blank')}
                                            />
                                        </div>
                                        <div className="absolute right-0 top-0 h-full w-4 bg-green-600 rounded-bl-lg"></div>
                                    </CardContent>
                                    <CardFooter className="p-2 text-sm font-medium truncate">
                                        {data?.name || `Dataset ${data?.id}`}
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}

