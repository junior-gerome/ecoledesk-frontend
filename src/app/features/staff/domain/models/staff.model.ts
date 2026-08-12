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
