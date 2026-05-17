import React, { useState } from 'react';
import { IconPlus, IconBuilding } from '@tabler/icons-react';
import { useCompanies } from '../_hooks/useCompanies';
import CompaniesTable from '../_components/tables/CompaniesTable';
import CreateEnterpriseModal from '../_components/modals/CreateEnterpriseModal';
import Spinner from '../../../components/feedback/Spinner';
import Button from '../../../components/ui/Button';

const CompaniesPage: React.FC = () => {
  const { companies, loading, error, refetch } = useCompanies();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[17px] font-semibold text-gray-900">Empresas</div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            Empresas cliente registradas en la plataforma
          </div>
        </div>
        <Button icon={<IconPlus size={14} />} onClick={() => setShowModal(true)}>
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
          <button
            onClick={() => setShowModal(true)}
            className="text-[12px] text-r hover:underline cursor-pointer"
          >
            Crear la primera empresa
          </button>
        </div>
      )}

      {!loading && !error && companies.length > 0 && (
        <CompaniesTable companies={companies} />
      )}

      <CreateEnterpriseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); refetch(); }}
      />
    </div>
  );
};

export default CompaniesPage;
