import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getTokenFromCookies } from '@/config/token-config';

// Helper function to fetch charts
async function fetchCharts(wid: string, id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/chart/?workspace_id=${wid}&dataset_id=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Assuming token is static for now
      },
    },
  );
}

// GET handler
export async function GET(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'charts') {
      response = await fetchCharts(workspace_id, dataset_id);
    }

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
  }
}

// post
async function postChartsData(workspaceId: string, datasetId: string, data: any) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/chart/?workspace_id=${workspaceId}&dataset_id=${datasetId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Assuming token is static for now
      },
    },
  );
}

//duplicate
async function duplicateChart(workspaceId: string, chartId: string) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/chart/duplicate?workspace_id=${workspaceId}&chart_id=${chartId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

// POST handler
export async function POST(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const { workspace_id, dataset_id } = params;
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const chart_id = url.searchParams.get('cid');

  let response;
  try {
    if (type === 'create') {
      const data = await req.json();
      response = await postChartsData(workspace_id, dataset_id, data);
    } else if (type === 'duplicate') {
      response = await duplicateChart(workspace_id, chart_id);
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
      return NextResponse.json({ message: `Error creating: ${error}` }, { status: 500 });
    }
  }
  return NextResponse.json(response.data);
}

//delete chart
async function deleteChart(wid: string, id: string) {
  const token = await getTokenFromCookies();
  return axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/chart/${id}?workspace_id=${wid}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// DELETE handler
export async function DELETE(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const { workspace_id, dataset_id } = params;
  const url = new URL(req.url);
  const cid = url.searchParams.get('cid');
  try {
    const response = await deleteChart(workspace_id, cid);
    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error deleting: ${error}` }, { status: 500 });
    }
  }
}

//update
async function updateChart(workspaceId: string, chartId: string, data: any) {
  const token = await getTokenFromCookies();
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/chart/${chartId}?workspace_id=${workspaceId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

// PUT handler
export async function PUT(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const { workspace_id, dataset_id } = params;
  const url = new URL(req.url);
  const cid = url.searchParams.get('cid');
  const data = await req.json();

  try {
    const response = await updateChart(workspace_id, cid, data);
    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        { message: `${error.response.data.detail || error.message}` },
        { status: error.response.status },
      );
    } else {
      return NextResponse.json({ message: `Error updating: ${error}` }, { status: 500 });
    }
  }
}
