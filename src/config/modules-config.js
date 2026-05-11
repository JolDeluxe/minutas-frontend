/**
 * Configuración centralizada de módulos del sistema de Minutas
 * Roles del ecosistema: GERENCIA, JEFE, COORDINADOR
 */

export const MODULES_CONFIG = [
  {
    id: 'minutas',
    name: 'Minutas',
    icon: 'description',
    route: '/minutas',
    allowedRoles: ['GERENCIA', 'JEFE', 'COORDINADOR'],
  },
  {
    id: 'entradas',
    name: 'Entradas Organizacionales',
    icon: 'fact_check',
    route: '/entradas',
    allowedRoles: ['GERENCIA', 'JEFE', 'COORDINADOR'],
  },
  {
    id: 'usuarios',
    name: 'Usuarios',
    icon: 'group',
    route: '/usuarios',
    allowedRoles: ['GERENCIA'],
  },
  {
    id: 'notificaciones',
    name: 'Notificaciones',
    icon: 'notifications',
    route: '/notificaciones',
    allowedRoles: ['GERENCIA', 'JEFE', 'COORDINADOR'],
    hideInMenu: true,
  },
];

export const getModulesByRole = (userRole) => {
  if (!userRole) return [];

  return MODULES_CONFIG
    .filter(module => module.allowedRoles.includes(userRole) && !module.hideInMenu)
    .map(module => {
      if (module.children) {
        return {
          ...module,
          children: module.children.filter(child =>
            child.allowedRoles.includes(userRole) && !child.hideInMenu
          )
        };
      }
      return module;
    });
};

export const canAccessModule = (userRole, moduleId) => {
  const module = MODULES_CONFIG.find(m => m.id === moduleId);
  return module ? module.allowedRoles.includes(userRole) : false;
};