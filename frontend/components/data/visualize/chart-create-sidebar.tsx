'use client';
import RightBar from '@/components/common/right-bar';
import {
    ChevronRight,
    CirclePlus
} from 'lucide-react';
import { ChartBuilderAI } from './chart-builder-ai';
import { ManualChartCreation } from './create/manual-creation';
import { CommonTabs, type TabItem } from "@/components/common/common-tabs"



export function ChartCreateRightBar({
    workspaceId,
    datasetId,
}: {
    workspaceId?: string;
    datasetId?: string;
}) {

    const tabs: TabItem[] = [
        {
            name:"Manual",
            content:<ManualChartCreation workspaceId={workspaceId} datasetId={datasetId}/>
        },
        {
            name:"Prompt",
            content:<ChartBuilderAI />
        }
    ]

  
    return (
        <RightBar closeIcon={<ChevronRight className="h-4 w-4" />} expandIcon={<CirclePlus className="h-4 w-4" />}>
            <CommonTabs tabs={tabs} defaultTab="Manual" />
        </RightBar>
    )
}

