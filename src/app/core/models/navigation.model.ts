import { UserRole } from "./auth.models";

export interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  roles?: readonly UserRole[];
  permissions?: readonly string[];
  children?: readonly NavigationItem[];
}

export interface NavigationGroup {
  label: string;
  items: readonly NavigationItem[];
}
