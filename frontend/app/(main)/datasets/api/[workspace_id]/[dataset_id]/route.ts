// app/datasets/api/[workspace_id]/[dataset_id]/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getTokenFromCookies } from '@/config/token-config';

export async function GET(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const token = await getTokenFromCookies();
  const { workspace_id, dataset_id } = params;
  const current_url = new URL(req.url);
  const query = current_url.searchParams.get('query');
  const limit = current_url.searchParams.get('limit');
  const offset = current_url.searchParams.get('offset');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/dataset/data?workspace_id=${workspace_id}&dataset_id=${dataset_id}&query=${query}&limit=${limit}&offset=${offset}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching dataset' }, { status: 500 });
  }
}
