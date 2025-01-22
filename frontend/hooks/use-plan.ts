import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const fetchPlan = async () => {
  const response = await axios.get('/api/user?type=plan');
  return response.data;
};

export const usePlan = () => {
  return useQuery({
    queryKey: ['plan'],
    queryFn: fetchPlan,
  });
};
