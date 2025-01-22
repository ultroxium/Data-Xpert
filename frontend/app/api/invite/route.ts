import { getTokenFromCookies } from '@/config/token-config';
import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

//fetch me
async function fetchMe() {
  const token = await getTokenFromCookies();
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

//fetch plan
async function fetchPlan() {
  const token = await getTokenFromCookies();
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/plan/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// GET handler
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  try {
    let response;

    if (type === 'me') {
      response = await fetchMe();
    } else if (type === 'plan') {
      response = await fetchPlan();
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
      return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
  }
}

async function addMember(data: any) {
  const token = await getTokenFromCookies();
  return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/team-member`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// POST handler
export async function POST(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const workspace_id = url.searchParams.get('workspace_id');
  const dataset_id = url.searchParams.get('dataset_id');

  let response;
  try {
    if (type === 'invite') {
      const data = await req.json();
      response = await addMember(data);
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
      return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
  }
  return NextResponse.json(response.data);
}

//delete chart
async function removeMember(id: string) {
  const token = await getTokenFromCookies();
  return axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/team-member/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// DELETE handler
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  try {
    const response = await removeMember(id);
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

//put member
async function updateRoles(id: string, data: any) {
  const token = await getTokenFromCookies();
  return axios.put(`${process.env.NEXT_PUBLIC_API_URL}/team-member/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// PUT handler
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type');

  let response;
  try {
    if (type === 'roles') {
      const data = await req.json();
      response = await updateRoles(id, data);
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
      return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
  }
  return NextResponse.json(response.data);
}