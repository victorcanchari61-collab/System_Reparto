import { useServerQuery } from '../../../hooks/use-server-query';
import { apiClient } from '../../../lib/api-client';
import type { PermissionGroup } from '../../../types/models';

export const usePermissions = () => {
  const { data, loading, error } = useServerQuery<PermissionGroup[]>(
    () => apiClient.getPermissions(),
  );
  return { permissionGroups: data ?? [], loading, error };
};
