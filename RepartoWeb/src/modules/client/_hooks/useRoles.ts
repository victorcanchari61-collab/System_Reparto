import { useServerQuery } from '../../../hooks/use-server-query';
import { apiClient } from '../../../lib/api-client';
import type { Role } from '../../../types/models';

export const useRoles = () => {
  const { data, loading, error, refetch } = useServerQuery<Role[]>(
    () => apiClient.getRoles(),
  );
  return { roles: data ?? [], loading, error, refetch };
};
