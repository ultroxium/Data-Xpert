import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const fetchMe = async () => {
  const response = await axios.get('/api/user?type=me');
  return response.data;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });
};
