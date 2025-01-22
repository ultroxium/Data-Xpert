import dotenv from 'dotenv';
import axios, { AxiosRequestConfig, Method } from 'axios';
import Cookies from 'js-cookie';

dotenv.config({ path: '.env' });

interface Config {
  apiUrl: string;
  getToken: () => string | null;
}

interface RequestOptions extends AxiosRequestConfig {
  data?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

const config: Config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => Cookies.get('token'),
};

const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, data[key]);
    }
  }
  return formData;
};

const createQueryParams = (params: Record<string, any>): string => {
  return new URLSearchParams(params).toString();
};

const createHeaders = (): Record<string, string> => {
  const token = config.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (
  method: Method,
  url: string,
  { data = {}, params = {}, headers = {}, ...options }: RequestOptions = {},
) => {
  const fullUrl = `${config.apiUrl}${url}`;
  const fullHeaders = { ...createHeaders(), ...headers };
  const axiosConfig: AxiosRequestConfig = {
    method,
    url: fullUrl,
    headers: fullHeaders,
    ...options,
  };

  if (method.toLowerCase() === 'get') {
    axiosConfig.params = params;
  } else {
    axiosConfig.data = data;
  }

  return axios(axiosConfig);
};

export { config, createFormData, createQueryParams, request };
