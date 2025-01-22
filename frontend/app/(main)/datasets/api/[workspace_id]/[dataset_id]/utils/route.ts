import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getTokenFromCookies } from '@/config/token-config';

async function handleMissing(workspace_id: string, dataset_id: string, type: string) {
  const token = await getTokenFromCookies();
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/handle-missing-value?workspace_id=${workspace_id}&dataset_id=${dataset_id}&handleType=${type}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//POST handler

export async function PUT(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const handleType = url.searchParams.get('handletype');
  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'cleanData') {
      response = await handleMissing(workspace_id, dataset_id, handleType);
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
