export interface SidebarItems {
  id: string;
  label: string;
  iconSrc?: string;
  iconSvg?: string;
  routerLink?: string;
  menuKey?: string;
  comingSoon?: boolean;
  disabled?: boolean;
  accessPolicy?: import('@app/core/security/access-policy').AccessPolicy;
  children?: { label: string; routerLink: string; disabled?: boolean; accessPolicy?: import('@app/core/security/access-policy').AccessPolicy }[];
}

export interface SidebarCategory {
  id: string;
  label: string;
  items: SidebarItems[];
  defaultOpen?: boolean;
}




