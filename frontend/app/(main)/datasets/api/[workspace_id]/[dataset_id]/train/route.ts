import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getTokenFromCookies } from '@/config/token-config';

// fetch model list
async function getModelList(workspace_id: string, dataset_id: string, isbasic: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/model/list?workspace_id=${workspace_id}&dataset_id=${dataset_id}&isbasic=${isbasic}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//get suggestions
async function getSuggestions(workspace_id: string, dataset_id: string, problem: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/processing/suggestions?workspace_id=${workspace_id}&dataset_id=${dataset_id}&problem=${problem}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//get model
async function getModel(workspace_id: string, dataset_id: string) {
  const token = await getTokenFromCookies();
  return axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/model/?workspace_id=${workspace_id}&dataset_id=${dataset_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//GET handler
export async function GET(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string } },
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const isbasic = url.searchParams.get('isbasic');
  const problem = url.searchParams.get('problem');
  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'modelLists') {
      response = await getModelList(workspace_id, dataset_id, isbasic);
    } else if (type === 'model') {
      response = await getModel(workspace_id, dataset_id);
    } else if (type === 'suggestions') {
      response = await getSuggestions(workspace_id, dataset_id, problem);
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

//post for train
async function trainModel(workspace_id: string, dataset_id: string, type: string, config: any) {
  const token = await getTokenFromCookies();

  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/model/?workspace_id=${workspace_id}&dataset_id=${dataset_id}&type=${type}`,
    config,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//post for automl
async function trainAutoML(workspace_id: string, dataset_id: string, problem_type: string, config: any) {
  const token = await getTokenFromCookies();

  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/model/auto-ml?workspace_id=${workspace_id}&dataset_id=${dataset_id}&problem_type=${problem_type}`,
    config,
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
  const alg = url.searchParams.get('alg');
  const { workspace_id, dataset_id } = params;
  const problem_type = url.searchParams.get('problem_type');


  try {
    let response;

    if (type === 'train') {
      const config = await req.json();
      response = await trainModel(workspace_id, dataset_id, alg, config);
    }

    if (type === 'automl') {
      const config = await req.json();
      response = await trainAutoML(workspace_id, dataset_id, problem_type, config);
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

//delete model
async function deleteModel(workspace_id: string, dataset_id: string, model_id: string) {
  const token = await getTokenFromCookies();
  return axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/model/?workspace_id=${workspace_id}&dataset_id=${dataset_id}&id=${model_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

//DELETE handler
export async function DELETE(
  req: Request,
  { params }: { params: { workspace_id: string; dataset_id: string; model_id: string } },
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const model_id = url.searchParams.get('model_id');

  const { workspace_id, dataset_id } = params;

  try {
    let response;

    if (type === 'model') {
      response = await deleteModel(workspace_id, dataset_id, model_id);
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
