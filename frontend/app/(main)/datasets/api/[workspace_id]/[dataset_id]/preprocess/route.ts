import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getTokenFromCookies } from '@/config/token-config';

// Helper function to fetch getProcessedTableDatas

async function getProcessedTableDatas(
  workspace_id: string,
  dataset_id: string,
  query: string,
  limit: string,
  offset: string,
) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/?workspace_id=${workspace_id}&dataset_id=${dataset_id}&query=${query}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//get distributions
async function getDistributions(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/distributions?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//get correlation
async function getCorrelation(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/correlation?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//get back to previous version
async function revertToOriginal(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/back-to-original?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//get is data already trained: 
async function isDataTrained(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/${dataset_id}/is_trained?workspace_id=${workspace_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
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
  const query = url.searchParams.get('query');
  const limit = url.searchParams.get('limit');
  const offset = url.searchParams.get('offset');
  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'processed') {
      response = await getProcessedTableDatas(workspace_id, dataset_id, query, limit, offset);
    }
    if (type === 'distributions') {
      response = await getDistributions(workspace_id, dataset_id);
    }
    if (type === 'correlation') {
      response = await getCorrelation(workspace_id, dataset_id);
    }
    if (type === 'revert') {
      response = await revertToOriginal(workspace_id, dataset_id);
    }
    if (type === 'is_trained') {
      response = await isDataTrained(workspace_id, dataset_id);
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
//cleanData
async function cleanData(workspace_id: string, dataset_id: string, config: any) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/clean?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    config,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//encodeData
async function encodeData(workspace_id: string, dataset_id: string, config: any) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/encode?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    config,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//handleOutliers
async function handleOutliers(workspace_id: string, dataset_id: string, config: any) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/outlier-handler?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    config,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//normalizeData
async function normalizeData(workspace_id: string, dataset_id: string, config: any) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/normalize?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    config,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//autoProcess
async function autoProcess(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/auto-process?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    '',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//POST handler
export async function POST(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const { workspace_id, dataset_id } = params;

  try {
    const config = await req.json();
    let response;

    if (type === 'clean') {
      response = await cleanData(workspace_id, dataset_id, config);
    } else if (type === 'encode') {
      response = await encodeData(workspace_id, dataset_id, config);
    } else if (type === 'outliers') {
      response = await handleOutliers(workspace_id, dataset_id, config);
    } else if (type === 'scale') {
      response = await normalizeData(workspace_id, dataset_id, config);
    } else if (type === 'auto') {
      response = await autoProcess(workspace_id, dataset_id);
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
