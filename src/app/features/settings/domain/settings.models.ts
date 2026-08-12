export type SettingsSection = "users" | "preferences" | "roles" | "permissions";

export interface SettingsNavigationItem {
  label: string;
  route: string;
  section: SettingsSection;
}
