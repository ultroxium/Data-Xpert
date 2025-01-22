// app/workspaces/api/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getTokenFromCookies } from '@/config/token-config';

// Helper function to fetch workspaces
async function fetchColumnDetails(wid: string, id: string, isProcessed: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/dataset/column-info?workspace_id=${wid}&dataset_id=${id}&isProcessed=${isProcessed}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Assuming token is static for now
      },
    },
  );
}

// GET handler
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const workspaceId = url.searchParams.get('wid');
  const datasetId = url.searchParams.get('did');
  const isProcessed = url.searchParams.get('isProcessed');

  try {
    let response;

    if (type === 'columndetails') {
      response = await fetchColumnDetails(workspaceId, datasetId, isProcessed);
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: `Error fetching ${type}: ${error}` }, { status: 500 });
  }
}
