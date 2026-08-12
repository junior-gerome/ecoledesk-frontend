import { environment } from '@environments/environment';

const segment = (value: string | number): string => encodeURIComponent(String(value));

export const API_ENDPOINTS = {
  baseUrls: {
    main: environment.apiUrl,
    billing: environment.billingApiUrl,
    attendance: environment.attendanceApiUrl,
  },
  auth: {
    login: `${environment.apiUrl}/auth/login`,
    register: `${environment.apiUrl}/auth/register`,
    refresh: `${environment.apiUrl}/auth/refresh`,
  },
  students: {
    list: `${environment.apiUrl}/students`,
    details: (id: string | number) => `${environment.apiUrl}/students/${segment(id)}`,
  },
  teachers: {
    list: `${environment.apiUrl}/teachers`,
    details: (id: string | number) => `${environment.apiUrl}/teachers/${segment(id)}`,
    subjects: `${environment.apiUrl}/teachers/subjects`,
    schedule: `${environment.apiUrl}/teachers/schedule`,
  },
  classes: {
    list: `${environment.apiUrl}/classes`,
    details: (id: string | number) => `${environment.apiUrl}/classes/${segment(id)}`,
    bySection: (sectionId: string | number) => `${environment.apiUrl}/classes/by-section/${segment(sectionId)}`,
  },
  schoolYear: {
    list: `${environment.apiUrl}/annees-scolaires`,
    active: `${environment.apiUrl}/annees-scolaires/active`,
    details: (id: string | number) => `${environment.apiUrl}/annees-scolaires/${segment(id)}`,
  },
  inscription: {
    list: `${environment.apiUrl}/inscription`,
    byClass: (classId: string | number) => `${environment.apiUrl}/inscription/by-class/${segment(classId)}`,
  },
  attendance: {
    records: `${environment.attendanceApiUrl}/attendance/records`,
    daily: `${environment.attendanceApiUrl}/attendance/daily`,
    summary: `${environment.attendanceApiUrl}/attendance/summary`,
    record: (recordId: string | number) => `${environment.attendanceApiUrl}/attendance/records/${segment(recordId)}`,
    justification: (recordId: string | number) => `${environment.attendanceApiUrl}/attendance/records/${segment(recordId)}/justification`,
  },
  billing: {
    payments: `${environment.billingApiUrl}/payments`,
    payment: (id: string | number) => `${environment.billingApiUrl}/payments/${segment(id)}`,
    fallbackPayments: `${environment.apiUrl}/payments`,
    fallbackPayment: (id: string | number) => `${environment.apiUrl}/payments/${segment(id)}`,
  },
  files: {
    upload: `${environment.apiUrl}/files/upload`,
    delete: (fileUrl: string) => `${environment.apiUrl}/files?fileUrl=${encodeURIComponent(fileUrl)}`,
    download: (fileUrl: string) => `${environment.apiUrl}/files/download/${fileUrl.split('/').filter(Boolean).map(segment).join('/')}`,
  },
  notifications: {
    websocket: `${environment.apiUrl}/ws`,
  },
} as const;

export { segment as encodeApiPathSegment };

