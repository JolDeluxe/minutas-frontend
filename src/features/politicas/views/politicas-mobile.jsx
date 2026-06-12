import { PoliticaCard } from '../components/politica-card';
import { PoliticaTable } from '../components/politica-table';
import { Skeleton, Icon, GlassViewToggle, Button, GlassFab, ScrollToTopButton } from '@/components/ui/z_index';
import { PoliticasFiltros } from '../components/politicas-filtros';
import { ShieldCheck, Plus, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export const PoliticasMobile = ({ 
  politicas, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  filters,
  setFilters,
  viewMode = 'cards',
  onViewChange
}) => {
  return (
    <div className="flex flex-col gap-4 pb-32 px-4 animate-in fade-in duration-500">
      {/* Header Estándar Mobile */}
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm mt-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
               <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
               <h2 className="fuente-titulos text-lg uppercase tracking-tight text-slate-800 leading-none">Políticas</h2>
               <span className="text-[9px] font-black text-marca-primario uppercase tracking-widest mt-1">{politicas.length} DOCUMENTOS</span>
            </div>
         </div>
      </div>

      <PoliticasFiltros 
        filters={filters} 
        setFilters={setFilters} 
        viewMode={viewMode} 
        onViewChange={onViewChange}
        isMobile={true}
      />

      {/* Contenido Mobile */}
      <div className="min-h-[400px]">
         {loading && politicas.length === 0 ? (
            <div className="space-y-3">
               {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
               ))}
            </div>
         ) : viewMode === 'cards' ? (
            <div className="flex flex-col gap-3">
               {politicas.map(p => (
                  <PoliticaCard key={p.id} politica={p} onEdit={onEdit} onDelete={onDelete} />
               ))}
               {politicas.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
                     <Icon name="history_edu" size="48px" className="opacity-10 mb-3" />
                     <p className="text-xs font-bold uppercase tracking-widest">Sin políticas registradas</p>
                  </div>
               )}
            </div>
         ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
               <PoliticaTable 
                 politicas={politicas} 
                 loading={loading} 
                 onEdit={onEdit} 
                 onDelete={onDelete} 
               />
            </div>
         )}
      </div>

      <GlassFab
        icon="add"
        onClick={onAdd}
        variant="primary"
        size={56}
        bottom="84px"
        right="20px"
      />
      <ScrollToTopButton bottom="84px" left="20px" />
    </div>
  );
};
