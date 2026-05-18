import React, { useState, useCallback } from 'react';
import { IconPlus, IconBuilding } from '@tabler/icons-react';
import { useCompanies } from '../_hooks/useCompanies';
import { useRealtime } from '../../../hooks/use-realtime';
import CompaniesTable from '../_components/tables/CompaniesTable';
import CreateEnterpriseModal from '../_components/modals/CreateEnterpriseModal';
import CompanyDetailModal    from '../_components/modals/CompanyDetailModal';
import EditCompanyModal      from '../_components/modals/EditCompanyModal';
import CompanyModulesModal   from '../_components/modals/CompanyModulesModal';
import LiveIndicator from '../../../components/ui/LiveIndicator';
import Spinner from '../../../components/feedback/Spinner';
import Button  from '../../../components/ui/Button';
import type { Company } from '../../../types/models';

const CompaniesPage: React.FC = () => {
  const { companies, loading, error, refetch } = useCompanies();

  const [showCreate, setShowCreate]         = useState(false);
  const [detailCompany, setDetailCompany]   = useState<Company | null>(null);
  const [editCompany, setEditCompany]       = useState<Company | null>(null);
  const [modulesCompany, setModulesCompany] = useState<Company | null>(null);

  const { state: realtimeState } = useRealtime({
    on: {
      CompanyCreated: useCallback(() => refetch(), [refetch]),
      ModuleChanged:  useCallback(() => refetch(), [refetch]),
    },
  });

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-[17px] font-semibold text-gray-900">Empresas</div>
            <LiveIndicator state={realtimeState} />
          </div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            Empresas cliente registradas en la plataforma
          </div>
        </div>
        <Button icon={<IconPlus size={14} />} onClick={() => setShowCreate(true)}>
          Nueva Empresa
        </Button>
      </div>

      {loading && <Spinner label="Cargando empresas..." />}

      {error && (
        <div className="text-[13px] text-red-500 text-center py-6">{error}</div>
      )}

      {!loading && !error && companies.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <IconBuilding size={36} className="opacity-30" />
          <div className="text-[13px]">Aún no hay empresas registradas.</div>
          <button onClick={() => setShowCreate(true)}
            className="text-[12px] text-r hover:underline cursor-pointer">
            Crear la primera empresa
          </button>
        </div>
      )}

      {!loading && !error && companies.length > 0 && (
        <CompaniesTable
          companies={companies}
          loading={loading}
          onDetail={setDetailCompany}
          onEdit={setEditCompany}
          onManageModules={setModulesCompany}
          onRefetch={refetch}
        />
      )}

      {/* Modales */}
      <CreateEnterpriseModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); refetch(); }}
      />

      <CompanyDetailModal
        isOpen={detailCompany !== null}
        companyId={detailCompany?.id ?? ''}
        onClose={() => setDetailCompany(null)}
      />

      <EditCompanyModal
        isOpen={editCompany !== null}
        company={editCompany}
        onClose={() => setEditCompany(null)}
        onSuccess={() => { setEditCompany(null); refetch(); }}
      />

      <CompanyModulesModal
        isOpen={modulesCompany !== null}
        companyId={modulesCompany?.id ?? ''}
        companyName={modulesCompany?.businessName ?? ''}
        onClose={() => setModulesCompany(null)}
      />
    </div>
  );
};

export default CompaniesPage;
