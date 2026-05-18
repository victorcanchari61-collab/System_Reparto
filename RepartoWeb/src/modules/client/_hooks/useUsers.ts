import { useServerQuery } from '../../../hooks/use-server-query';
import { apiClient } from '../../../lib/api-client';
import type { UserRecord } from '../../../types/models';

export const useUsers = () => {
  const { data, loading, error, refetch } = useServerQuery<UserRecord[]>(
    () => apiClient.getClientUsers(),
  );
  return { users: data ?? [], loading, error, refetch };
};
