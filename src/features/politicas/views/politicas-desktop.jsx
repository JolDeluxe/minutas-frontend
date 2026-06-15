import { PoliticaTable } from '../components/politica-table';
import { PoliticaCard } from '../components/politica-card';
import { Skeleton, Icon, GlassViewToggle, Button } from '@/components/ui/z_index';
import { PoliticasFiltros } from '../components/politicas-filtros';
import { cn } from '@/utils/cn';
import { ShieldCheck, Plus } from 'lucide-react';

export const PoliticasDesktop = ({ 
  politicas, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  filters,
  setFilters,
  viewMode = 'table',
  onViewChange
}) => {
  return (
    <div className="flex flex-col gap-4 relative animate-in fade-in slide-in-from-bottom-2 duration-500 p-6 max-w-full mx-auto w-full">
      {/* Header Estándar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/60 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 ring-4 ring-slate-50">
              <ShieldCheck size={24} />
           </div>
           <div>
              <h2 className="fuente-titulos text-2xl uppercase tracking-tighter text-slate-800">Políticas Generales</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                 <span className="text-marca-primario">{politicas.length}</span> documentos institucionales registrados
              </p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <Button 
             variant="guardar" 
             icon="add" 
             onClick={onAdd}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
           >
              Nueva Política
           </Button>
        </div>
      </div>

      <PoliticasFiltros 
        filters={filters} 
        setFilters={setFilters} 
        viewMode={viewMode} 
        onViewChange={onViewChange} 
      />

      {/* Contenido */}
      <div className="min-h-[500px]">
         {loading && politicas.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-40 bg-white border border-slate-100 rounded-2xl animate-pulse" />
               ))}
            </div>
         ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {politicas.map(p => (
                  <PoliticaCard key={p.id} politica={p} onEdit={onEdit} onDelete={onDelete} />
               ))}
               {politicas.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                     <Icon name="history_edu" size="64px" className="opacity-10 mb-4" />
                     <p className="font-bold uppercase tracking-widest text-sm">Sin normativas encontradas</p>
                  </div>
               )}
            </div>
         ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <PoliticaTable 
                 politicas={politicas} 
                 loading={loading} 
                 onEdit={onEdit} 
                 onDelete={onDelete} 
               />
            </div>
         )}
      </div>
    </div>
  );
};
