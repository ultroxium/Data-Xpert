import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } }
) {
  const { workspace_id, dataset_id } = params;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/chart/public?workspace_id=${workspace_id}&dataset_id=${dataset_id}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching charts:', error);
    
    const errorMessage =
      error.response?.data?.message ?? 'Internal Server Error';
    
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
