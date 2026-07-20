import React from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ProfileAvatar } from './profile-avatar';

export const ProfileSummaryCard = ({
  profile,
  onAvatarUpload,
  onAvatarDelete,
  uploadingImage
}) => {
  if (!profile) return null;

  const getEstadoBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'inactivo': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatRol = (rol) => {
    const rolesMap = {
      'ADMIN': 'Administrador',
      'GERENCIA': 'Gerencia',
      'JEFE': 'Jefe de Departamento',
      'COORDINADOR': 'Coordinador'
    };
    return rolesMap[rol] || rol;
  };

  return (
    <Card className="bg-white shadow-md w-full">
      <CardBody className="flex flex-col items-center gap-5 p-5 w-full">
        <ProfileAvatar
          imagen={profile.imagen}
          nombre={profile.nombre}
          onUpload={onAvatarUpload}
          onDelete={onAvatarDelete}
          loading={uploadingImage}
        />

        <div className="w-full text-center space-y-3 flex flex-col items-center">
          <div className="w-full px-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 break-words text-balance leading-tight">
              {profile.nombre}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 break-words mt-1">
              @{profile.username}
            </p>
          </div>

          <div className="flex justify-center w-full">
            <Badge className="bg-marca-primario text-white text-center whitespace-normal break-words font-bold">
              {formatRol(profile.rol)}
            </Badge>
          </div>

          {profile.departamento && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700 w-full px-2 font-bold uppercase tracking-wider">
              <Icon name="business" size="sm" className="shrink-0 text-gray-400" />
              <span className="break-words text-center text-balance">
                Departamento: {profile.departamento}
              </span>
            </div>
          )}

          <div className="flex justify-center w-full">
            <Badge className={getEstadoBadgeColor(profile.estado)}>
              {profile.estado}
            </Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};