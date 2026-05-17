import { useServerQuery } from '../../../hooks/use-server-query';
import { apiClient } from '../../../lib/api-client';
import type { Company } from '../../../types/models';

export const useCompanies = () => {
  const { data, loading, error, refetch } = useServerQuery<Company[]>(
    () => apiClient.getCompanies()
  );
  return { companies: data ?? [], loading, error, refetch };
};
