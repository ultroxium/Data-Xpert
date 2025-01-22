// app/workspaces/types.ts
export interface Workspace {
    id?: number; // Optional if you're only creating new workspaces
    name: string;
  }
  
  // You can also define a type for the API response if needed
  export interface WorkspacesResponse {
    data: Workspace[];
    message?: string;
  }
  

export interface DatasetFormvalue {
  name: string;
  description: string;
  file: File;
};                                  