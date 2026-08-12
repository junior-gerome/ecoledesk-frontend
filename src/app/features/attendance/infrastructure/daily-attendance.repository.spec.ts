import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DailyAttendanceRepositoryAdapter } from './daily-attendance.repository';
import { environment } from '@environments/environment';

describe('DailyAttendanceRepositoryAdapter', () => {
  let repository: DailyAttendanceRepositoryAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DailyAttendanceRepositoryAdapter]
    });
    repository = TestBed.inject(DailyAttendanceRepositoryAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch sections', () => {
    repository.getSections().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/section`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch classes by section', () => {
    const sectionId = 123;
    repository.getClassesBySection(sectionId).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/classes/by-section/${sectionId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch active school year', () => {
    repository.getActiveSchoolYear().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/annees-scolaires/active`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, libelle: '2024-2025' });
  });

  it('should fetch daily records', () => {
    repository.getDailyRecords(1, '2024-01-15', 1).subscribe();
    const req = httpMock.expectOne((request) => 
      request.url === `${environment.apiUrl}/attendance/records` &&
      request.params.get('classId') === '1' &&
      request.params.get('date') === '2024-01-15' &&
      request.params.get('anneeScolaireId') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should save daily attendance', () => {
    const payload = {
      classId: 1,
      className: 'Test',
      date: '2024-01-15',
      entries: []
    };
    repository.saveDailyAttendance(payload).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/attendance/daily`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
