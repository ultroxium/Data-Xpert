'use client'

import React from 'react'
import Link from 'next/link'
import moment from 'moment'
import { FileSpreadsheet } from 'lucide-react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DatasetActions from './dataset-actions'

interface Dataset {
  id: string
  workspace_id: string
  name: string
  updated_at: string
  created_at: string
}

interface DatasetGridProps {
  datasets: Dataset[]
  widNo: number
  FilteredWorkspaces: any[] // Replace with the correct type
  deleteDatasetMutation: (id: string) => void
  moveDatasetMutation: (id: string, newWorkspaceId: string) => void
}

export const DatasetGrid: React.FC<DatasetGridProps> = ({ 
  datasets, 
  widNo, 
  FilteredWorkspaces, 
  deleteDatasetMutation, 
  moveDatasetMutation 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {datasets.map((file, index) => (
        <Card key={file.id} className="flex flex-col justify-between shadow-none bg-gray-50 dark:bg-slate-800/10">
          <CardContent className="pt-4">
            <Link
              href={`/datasets/${file.workspace_id}/${file.id}?tab=overview`}
              className="flex items-center text-primary hover:underline mb-4"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              <span className="text-lg font-semibold">{file.name}</span>
            </Link>
            <div className="text-sm text-muted-foreground">
              <p>Last Updated : {file.updated_at && moment(file.updated_at).isValid()
                ? moment(file.updated_at).fromNow()
                : 'N/A'}
              </p>
              {/* <p>Created: {moment(file.created_at).fromNow()}</p> */}
            </div>
          </CardContent>
          <CardFooter className="justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/datasets/${file.workspace_id}/${file.id}?tab=overview`}>
                View Details
              </Link>
            </Button>
            <DatasetActions
              dataset={file}
              widNo={widNo}
              FilteredWorkspaces={FilteredWorkspaces}
              deleteDatasetMutation={deleteDatasetMutation}
              moveDatasetMutation={moveDatasetMutation}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

