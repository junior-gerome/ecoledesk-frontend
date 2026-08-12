import { AuthenticatedUserProfile } from "./auth.models";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: number | null;
  profile: AuthenticatedUserProfile | null;
}
