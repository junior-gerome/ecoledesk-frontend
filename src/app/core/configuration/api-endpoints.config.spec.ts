import { environment } from '@environments/environment';
import { API_ENDPOINTS, encodeApiPathSegment } from './api-endpoints.config';

describe('API_ENDPOINTS', () => {
  it('uses the configured base URLs and encodes path identifiers', () => {
    expect(API_ENDPOINTS.baseUrls.main).toBe(environment.apiUrl);
    expect(API_ENDPOINTS.baseUrls.billing).toBe(environment.billingApiUrl);
    expect(API_ENDPOINTS.baseUrls.attendance).toBe(environment.attendanceApiUrl);
    expect(API_ENDPOINTS.students.details('A/B')).toBe(`${environment.apiUrl}/students/A%2FB`);
    expect(encodeApiPathSegment('élève 1')).toBe('%C3%A9l%C3%A8ve%201');
  });

  it('preserves separate billing fallback and attendance endpoints', () => {
    expect(API_ENDPOINTS.billing.payments).toBe(`${environment.billingApiUrl}/payments`);
    expect(API_ENDPOINTS.billing.fallbackPayments).toBe(`${environment.apiUrl}/payments`);
    expect(API_ENDPOINTS.attendance.records).toBe(`${environment.attendanceApiUrl}/attendance/records`);
  });

  it('centralizes file upload URL generation without changing query encoding', () => {
    const fileUrl = 'photos/a b.png';
    expect(API_ENDPOINTS.files.upload).toBe(`${environment.apiUrl}/files/upload`);
    expect(API_ENDPOINTS.files.delete(fileUrl)).toBe(`${environment.apiUrl}/files?fileUrl=photos%2Fa%20b.png`);
    expect(API_ENDPOINTS.files.download(fileUrl)).toBe(`${environment.apiUrl}/files/download/photos%2Fa%20b.png`);
  });
});
