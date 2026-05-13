// src/features/tareas/components/seguimientos/seguimiento-summary.jsx
import React from 'react';
import { Icon } from '@/components/ui/z_index';

export const SeguimientoSummary = ({ count = 0 }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
            <Icon name="visibility" size="sm" className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-tight">
                {count} Tareas en Seguimiento
            </span>
        </div>
    );
};
