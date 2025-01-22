// app/workspaces/api/route.ts
import { getTokenFromCookies } from '@/config/token-config';
import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

export interface Workspace {
  id?: number; 
  name: string;
}

// Helper function to fetch workspaces
async function fetchWorkspaces() {
  const token = await getTokenFromCookies();
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/workspace/`, {
    headers: {
      Authorization: `Bearer ${token}`, // Assuming token is static for now
    },
  });
}

async function fetchWorkspaceById(workspaceId: string) {
  const token = await getTokenFromCookies();
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Helper function to fetch default dataset
async function fetchDefaultDataset() {
  const token = await getTokenFromCookies();
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dataset/default`, {
    headers: {
      Authorization: `Bearer ${token}`, // Assuming token is static for now
    },
  });
}

// Helper function to fetch datasets by workspace ID
async function fetchDatasetsByWorkspaceId(workspaceId: string) {
  const token = await getTokenFromCookies();
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dataset/?workspace_id=${workspaceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// GET handler
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const workspaceId = url.searchParams.get('wid');

  try {
    let response;

    if (type === 'workspaces') {
      response = await fetchWorkspaces();
    } else if (type === 'workspace' && workspaceId) {
      response = await fetchWorkspaceById(workspaceId);
    } else if (type === 'datasets' && workspaceId) {
      response = await fetchDatasetsByWorkspaceId(workspaceId);
    } else if (type === 'default') {
      response = await fetchDefaultDataset();
    } else {
      return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error fetching ${type}: ${error}` }, { status: 500 });
    }
  }
}

// POST handler

async function addDataset(wid: string, values: FormData) {
  const token = await getTokenFromCookies();
  return await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/?workspace_id=${wid}`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

//add from api
async function addDatasetFromAPI(wid: string, values: FormData) {
  const token = await getTokenFromCookies();
  return await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/upload-from-url?workspace_id=${wid}`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

async function addWorkspace(newWorkspace: Workspace) {
  const token = await getTokenFromCookies();
  return await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/workspace/`, newWorkspace, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const datasetId = url.searchParams.get('did');
  const workspaceId = url.searchParams.get('wid');

  let response;
  try {
    if (type === 'workspace') {
      const newWorkspace: Workspace = await req.json();
      response = await addWorkspace(newWorkspace);
    } else if (type === 'dataset') {
      const values = await req.formData();
      const name = values.get('name');
      const description = values.get('description');
      const file = values.get('file');

      response = await addDataset(workspaceId, values);
    } else if (type === 'apidata') {
      const values = await req.formData();
      const name = values.get('name');
      const description = values.get('description');
      const url = values.get('url');
      const headers = values.get('headers');
      response = await addDatasetFromAPI(workspaceId, values);
    } else {
      return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error adding ${type}: ${error}` }, { status: 500 });
    }
  }
  return NextResponse.json(response.data);
}
// DELETE handler
async function deleteWorkspace(workspaceId: string) {
  const token = await getTokenFromCookies();
  return axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function deleteDataset(workspaceId: string, datasetId: string) {
  const token = await getTokenFromCookies();
  return axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/${datasetId}?workspace_id=${workspaceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const datasetId = url.searchParams.get('did');
  const workspaceId = url.searchParams.get('wid');

  try {
    let response;

    if (type === 'workspace' && workspaceId) {
      response = await deleteWorkspace(workspaceId);
    } else if (type === 'dataset' && datasetId) {
      response = await deleteDataset(workspaceId, datasetId);
    } else {
      return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error deleting ${type}: ${error}` }, { status: 500 });
    }
  }
}

//Move Dataset from one workspace to another
async function moveDataset(did: string, current_wid: string, workspace_id: string) {
  const token = await getTokenFromCookies();
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/move?current_workspace_id=${current_wid}&workspace_id=${workspace_id}&dataset_id=${did}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//refresh data
async function refreshData(workspaceId: string, datasetId: string, refresh_period: string) {
  const token = await getTokenFromCookies();
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/refresh-api-data?workspace_id=${workspaceId}&dataset_id=${datasetId}&refresh_period=${refresh_period}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//PUT handler
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const datasetId = url.searchParams.get('did');
  const workspaceId = url.searchParams.get('wid');
  const targetWorkspaceId = url.searchParams.get('twid');
  const refresh_period = url.searchParams.get('rp');

  try {
    let response;

    if (type === 'movedataset' && datasetId) {
      response = await moveDataset(datasetId, workspaceId, targetWorkspaceId);
    } else if (type === 'refresh' && datasetId) {
      response = await refreshData(workspaceId, datasetId, refresh_period);
    } else {
      return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error editing ${type}: ${error}` }, { status: 500 });
    }
  }
}