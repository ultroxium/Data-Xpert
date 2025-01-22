import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getTokenFromCookies } from '@/config/token-config';
import { toast } from 'sonner';

// Fetch input columns
async function getInputColumns(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/model/input-columns?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
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
  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'inputColumns') {
      response = await getInputColumns(workspace_id, dataset_id);
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

// predict
async function predict(workspace_id: string, dataset_id: string, config: any) {
  const token = await getTokenFromCookies();
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/model/predict/?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    config,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

async function predictPublic(workspace_id: string, dataset_id: string, config: any) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/model/DataXpert/?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    config,
  );
}

// POST handler
export async function POST(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'predict') {
      const config = await req.json();
      response = await predict(workspace_id, dataset_id, config);
    }else if (type === 'predictions') {
      const config = await req.json();
      response = await predictPublic(workspace_id, dataset_id, config);
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
