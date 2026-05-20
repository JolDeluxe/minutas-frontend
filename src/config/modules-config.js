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
    allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE'],
  },
  {
    id: 'tareas',
    name: 'Tareas',
    icon: 'task',
    route: '/tareas',
    allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE', 'COORDINADOR'],
    children: [
      {
        id: 'mis-tareas',
        name: 'Mis Tareas',
        icon: 'person_check',
        route: '/tareas/mis-tareas',
        allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE', 'COORDINADOR'],
      },
      {
        id: 'mis-seguimientos',
        name: 'Mis Seguimientos',
        icon: 'update',
        route: '/tareas/mis-seguimientos',
        allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE', 'COORDINADOR'],
      },
      {
        id: 'historico-tareas',
        name: 'Histórico Global',
        icon: 'history',
        route: '/tareas/historico',
        allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE'],
      },
      {
        id: 'por-aprobar',
        name: 'Por Aprobar',
        icon: 'fact_check',
        route: '/tareas/por-aprobar',
        allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE'],
      }
    ]
  },
  {
    id: 'recordatorios',
    name: 'Recordatorios',
    icon: 'push_pin',
    route: '/recordatorios',
    allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE'],
  },
  {
    id: 'politicas',
    name: 'Políticas',
    icon: 'gavel',
    route: '/politicas',
    allowedRoles: ['ADMIN', 'GERENCIA'],
  },
  {
    id: 'usuarios',
    name: 'Usuarios',
    icon: 'group',
    route: '/usuarios',
    allowedRoles: ['ADMIN', 'GERENCIA'],
    divider: true,
  },
  {
    id: 'notificaciones',
    name: 'Notificaciones',
    icon: 'notifications',
    route: '/notificaciones',
    allowedRoles: ['ADMIN', 'GERENCIA', 'JEFE', 'COORDINADOR'],
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