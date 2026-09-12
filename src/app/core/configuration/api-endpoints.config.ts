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
    byAcademicYear: (academicYearId: string | number) =>
      `${environment.apiUrl}/classes?academicYearId=${segment(academicYearId)}`,
    details: (id: string | number) => `${environment.apiUrl}/classes/${segment(id)}`,
    bySection: (sectionId: string | number) => `${environment.apiUrl}/classes/by-section/${segment(sectionId)}`,
  },
  schoolYear: {
    list: `${environment.apiUrl}/academic-year`,
    active: `${environment.apiUrl}/academic-year/active`,
    details: (id: string | number) => `${environment.apiUrl}/academic-year/${segment(id)}`,
  },
  enrollments: {
    // POST /enrollments/from-pre-enrollment/{id} — create enrollment from pre-enrollment
    fromPreEnrollment: (id: string | number) => `${environment.apiUrl}/enrollments/from-pre-enrollment/${segment(id)}`,
    list: `${environment.apiUrl}/enrollments`,
    details: (id: string | number) => `${environment.apiUrl}/enrollments/${segment(id)}`,
    confirm: (id: string | number) => `${environment.apiUrl}/enrollments/${segment(id)}/confirm`,
    cancel: (id: string | number) => `${environment.apiUrl}/enrollments/${segment(id)}/cancel`,
    withdraw: (id: string | number) => `${environment.apiUrl}/enrollments/${segment(id)}/withdraw`,
    // Pre-enrollment workflow
    preEnrollments: `${environment.apiUrl}/pre-enrollments`,
    preEnrollmentDetail: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}`,
    preEnrollmentSubmit: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}/submit`,
    preEnrollmentApprove: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}/approve`,
    preEnrollmentReject: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}/reject`,
    preEnrollmentStartReview: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}/start-review`,
    preEnrollmentGuardians: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}/guardians`,
    preEnrollmentDocuments: (id: string | number) => `${environment.apiUrl}/pre-enrollments/${segment(id)}/documents`,
    preEnrollmentDocumentReview: (id: string | number, documentId: string | number) =>
      `${environment.apiUrl}/pre-enrollments/${segment(id)}/documents/${segment(documentId)}/review`,
    byStatus: (status: string) => `${environment.apiUrl}/pre-enrollments/by-status/${segment(status)}`,
    byAcademicYear: (academicYearId: string | number) =>
      `${environment.apiUrl}/pre-enrollments/by-academic-year/${segment(academicYearId)}`,
  },
  attendance: {
    records: `${environment.attendanceApiUrl}/attendance/records`,
    daily: `${environment.attendanceApiUrl}/attendance/daily`,
    summary: `${environment.attendanceApiUrl}/attendance/summary`,
    record: (recordId: string | number) => `${environment.attendanceApiUrl}/attendance/records/${segment(recordId)}`,
    justification: (recordId: string | number) => `${environment.attendanceApiUrl}/attendance/records/${segment(recordId)}/justification`,
  },
  billing: {
    payments: `${environment.apiUrl}/payments`,
    payment: (id: string | number) => `${environment.apiUrl}/payments/${segment(id)}`,
    fallbackPayments: `${environment.apiUrl}/payments`,
    fallbackPayment: (id: string | number) => `${environment.apiUrl}/payments/${segment(id)}`,
  },
  montant: {
    preInscriptionByClass: (classId: string | number) =>
      `${environment.apiUrl}/montant/preinscription/class/${segment(classId)}`,
    byClassAndType: (classId: string | number, typePaiement: string) =>
      `${environment.apiUrl}/montant/by-class-and-type?classeRoomId=${segment(classId)}&typePaiement=${segment(typePaiement)}`,
  },
  enrollmentFinance: {
    recordPreEnrollmentFee: (id: string | number) =>
      `${environment.apiUrl}/enrollment-finance/pre-enrollments/${segment(id)}/fee-payments`,
    verifyPreEnrollmentFee: (id: string | number) =>
      `${environment.apiUrl}/enrollment-finance/pre-enrollment-fee-payments/${segment(id)}/verify`,
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

