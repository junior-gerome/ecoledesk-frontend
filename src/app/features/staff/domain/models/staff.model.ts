export type StaffPosition = 'TEACHER' | 'SECRETARY' | 'ACCOUNTANT' | 'DIRECTOR' | 'CLEANER' | 'SECURITY_GUARD';
export type Gender = 'MASCULIN' | 'FEMININ';

export interface StaffMemberBasic {
  id?: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  gender: Gender;
  active?: boolean;
}

export interface StaffMemberMedium {
  id?: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: Gender;
  employmentDate: string;
  speciality?: string;
  level?: string;
  address?: string;
  photoUrl?: string;
  active?: boolean;
}

export interface StaffAssignmentBasic {
  id?: number;
  position: StaffPosition;
  startDate: string;
  endDate?: string;
  active?: boolean;
}

export interface StaffMemberFull {
  id?: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: Gender;
  birthDate?: string;
  employmentDate: string;
  speciality?: string;
  level?: string;
  address?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
  cniNumber?: string;
  cniPhotoUrl?: string;
  active?: boolean;
  creationDate?: string;
  updateDate?: string;
  assignments?: StaffAssignmentBasic[];
}

export interface StaffAssignmentMedium {
  id?: number;
  staffMemberId: number;
  staffMemberName: string;
  position: StaffPosition;
  startDate: string;
  endDate?: string;
  active?: boolean;
}

export interface StaffAssignmentFull {
  id?: number;
  staffMember: StaffMemberBasic;
  position: StaffPosition;
  startDate: string;
  endDate?: string;
  active?: boolean;
  creationDate?: string;
  updateDate?: string;
}

export interface StaffPositionOption {
  code: StaffPosition;
  label: string;
}

export const STAFF_POSITIONS: StaffPositionOption[] = [
  { code: 'TEACHER', label: 'Enseignant(e)' },
  { code: 'DIRECTOR', label: 'Directeur / Directrice' },
  { code: 'SECRETARY', label: 'Secrétaire' },
  { code: 'ACCOUNTANT', label: 'Comptable' },
  { code: 'CLEANER', label: "Agent d'entretien" },
  { code: 'SECURITY_GUARD', label: 'Agent de sécurité' },
];

export function getPositionLabel(position?: StaffPosition | string | null): string {
  if (!position) return 'Non assigné';
  const found = STAFF_POSITIONS.find((p) => p.code === position);
  return found ? found.label : position;
}

export type AssignmentStatus = 'ACTIVE' | 'INACTIVE';

export interface StaffMemberCreateRequest {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: Gender;
  employmentDate: string;
  birthDate?: string;
  speciality?: string;
  level?: string;
  address?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
  cniNumber?: string;
  cniPhotoUrl?: string;
}

export interface StaffAssignmentCreateRequest {
  staffMemberId: number;
  position: StaffPosition;
  startDate: string;
  endDate?: string;
}

export interface StaffMemberFormData extends StaffMemberCreateRequest {
  position?: StaffPosition;
  startDate?: string;
  endDate?: string;
  assignmentStatus?: AssignmentStatus;
  active?: boolean;
}

