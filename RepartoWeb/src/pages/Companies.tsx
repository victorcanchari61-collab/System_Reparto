import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import {
  IconBuilding,
  IconPlus,
  IconLoader,
  IconCircleCheck,
  IconCircleX
} from '@tabler/icons-react';

interface Company {
  id: string;
  ruc: string;
  businessName: string;
  tradeName: string;
  isActive: boolean;
  createdAtUtc: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.getCompanies()
      .then(setCompanies)
      .catch(() => setError('No se pudieron cargar las empresas.'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[17px] font-semibold text-gray-900">Empresas</div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            Empresas cliente registradas en la plataforma
          </div>
        </div>
        <button
          onClick={() => navigate('/empresas/nueva')}
          className="flex items-center gap-1.5 bg-r hover:bg-r4 text-white text-[12px] font-medium py-2 px-3.5 rounded-[var(--border-radius-md)] transition-colors cursor-pointer"
        >
          <IconPlus size={14} />
          <span>Nueva Empresa</span>
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center gap-2 text-[13px] text-gray-400 py-10 justify-center">
          <IconLoader size={16} className="animate-spin" />
          <span>Cargando empresas...</span>
        </div>
      )}

      {error && (
        <div className="text-[13px] text-red-500 py-6 text-center">{error}</div>
      )}

      {!loading && !error && companies.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <IconBuilding size={36} className="opacity-30" />
          <div className="text-[13px]">Aún no hay empresas registradas.</div>
          <button
            onClick={() => navigate('/empresas/nueva')}
            className="text-[12px] text-r hover:underline cursor-pointer"
          >
            Crear la primera empresa
          </button>
        </div>
      )}

      {!loading && !error && companies.length > 0 && (
        <div className="border border-gray-200 rounded-[var(--border-radius-lg)] overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Empresa</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">RUC</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Estado</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Registrada</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, idx) => (
                <tr
                  key={company.id}
                  className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[6px] bg-r/10 flex items-center justify-center shrink-0">
                        <IconBuilding size={13} className="text-r" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{company.businessName}</div>
                        {company.tradeName && company.tradeName !== company.businessName && (
                          <div className="text-[10px] text-gray-400">{company.tradeName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{company.ruc}</td>
                  <td className="px-4 py-3">
                    {company.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <IconCircleCheck size={13} />
                        <span>Activa</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <IconCircleX size={13} />
                        <span>Inactiva</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(company.createdAtUtc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Companies;
