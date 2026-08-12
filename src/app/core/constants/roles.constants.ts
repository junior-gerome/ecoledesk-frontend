export const APP_ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  TEACHER: 'ENSEIGNANT',
  STUDENT: 'ELEVE',
  PARENT: 'PARENT',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/** Groupes réutilisables pour les guards de routes. */
export const ROLE_GROUPS = {
  ADMIN_ONLY: [APP_ROLES.ADMIN] as const,
  STAFF: [APP_ROLES.ADMIN, APP_ROLES.AGENT, APP_ROLES.TEACHER] as const,
  FINANCE: [APP_ROLES.ADMIN, APP_ROLES.AGENT] as const,
  ACADEMIC: [APP_ROLES.ADMIN, APP_ROLES.AGENT, APP_ROLES.TEACHER] as const,
};
