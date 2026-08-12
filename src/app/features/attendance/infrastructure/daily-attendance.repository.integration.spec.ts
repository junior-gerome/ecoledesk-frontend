import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DailyAttendanceRepositoryAdapter } from './daily-attendance.repository';
import { environment } from '@environments/environment';
import { AttendanceStatus } from '../domain/models';

describe('DailyAttendanceRepositoryAdapter - Integration', () => {
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

  afterEach(() => {
    httpMock.verify();
  });

  describe('getSections', () => {
    it('should fetch sections from backend', (done) => {
      const mockSections = [
        { id: 1, libelle: 'Primaire' },
        { id: 2, libelle: 'Secondaire' }
      ];

      repository.getSections().subscribe(sections => {
        expect(sections).toEqual(mockSections);
        expect(sections.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/section`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSections);
    });

    it('should handle empty sections', (done) => {
      repository.getSections().subscribe(sections => {
        expect(sections).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/section`);
      req.flush([]);
    });
  });

  describe('getClassesBySection', () => {
    it('should fetch classes for a given section', (done) => {
      const sectionId = 1;
      const mockClasses = [
        { id: 10, nameClasse: 'CP-A', level: 'CP', capacity: 30, section: { id: 1 }, anneeScolaire: { id: 1 } },
        { id: 11, nameClasse: 'CP-B', level: 'CP', capacity: 30, section: { id: 1 }, anneeScolaire: { id: 1 } }
      ];

      repository.getClassesBySection(sectionId).subscribe(classes => {
        expect(classes.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/classes/by-section/${sectionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClasses);
    });
  });

  describe('getActiveSchoolYear', () => {
    it('should fetch active school year', (done) => {
      const mockYear = { 
        id: 1, 
        libelleAnneeScolaire: '2024-2025', 
        dateDebut: '2024-09-01', 
        dateFin: '2025-06-30',
        statutCode: 'ACTIVE'
      };

      repository.getActiveSchoolYear().subscribe(year => {
        expect(year.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/annees-scolaires/active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockYear);
    });
  });

  describe('getInscriptionsByClass', () => {
    it('should fetch inscriptions with school year filter', (done) => {
      const classId = 10;
      const schoolYearId = 1;
      const mockInscriptions = [
        { 
          id: 1, 
          student: { id: 100, firstNameStudent: 'Jean', lastNameStudent: 'Dupont' },
          dateInscription: '2024-09-01'
        },
        { 
          id: 2, 
          student: { id: 101, firstNameStudent: 'Marie', lastNameStudent: 'Martin' },
          dateInscription: '2024-09-01'
        }
      ];

      repository.getInscriptionsByClass(classId, schoolYearId).subscribe(inscriptions => {
        expect(inscriptions.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${environment.apiUrl}/inscription/by-class/${classId}` &&
                   request.params.get('anneeScolaireId') === String(schoolYearId)
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('should fetch inscriptions without school year filter', (done) => {
      const classId = 10;

      repository.getInscriptionsByClass(classId, null).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${environment.apiUrl}/inscription/by-class/${classId}` &&
                   !request.params.has('anneeScolaireId')
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getDailyRecords', () => {
    it('should fetch daily records with all parameters', (done) => {
      const classId = 10;
      const date = '2024-01-15';
      const schoolYearId = 1;
      const mockRecords = [
        {
          id: 1,
          studentId: 100,
          studentName: 'Jean Dupont',
          classId: 10,
          className: 'CP-A',
          date: [2024, 1, 15],
          status: 'PRESENT',
          hours: 0,
          justified: false,
          updatedAt: '2024-01-15T10:00:00'
        },
        {
          id: 2,
          studentId: 101,
          studentName: 'Marie Martin',
          classId: 10,
          className: 'CP-A',
          date: [2024, 1, 15],
          status: 'ABSENT',
          hours: 4,
          justified: false,
          updatedAt: '2024-01-15T10:00:00'
        }
      ];

      repository.getDailyRecords(classId, date, schoolYearId).subscribe(records => {
        expect(records.length).toBe(2);
        expect(records[0].date).toBe('2024-01-15');
        expect(records[0].status).toBe('PRESENT');
        expect(records[1].status).toBe('ABSENT');
        expect(records[1].hours).toBe(4);
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${environment.apiUrl}/attendance/records` &&
                   request.params.get('classId') === String(classId) &&
                   request.params.get('date') === date &&
                   request.params.get('anneeScolaireId') === String(schoolYearId)
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);
    });

    it('should map backend date array to ISO string', (done) => {
      const mockRecords = [{
        id: 1,
        studentId: 100,
        studentName: 'Test',
        classId: 10,
        className: 'CP-A',
        date: [2024, 3, 5],
        status: 'PRESENT',
        hours: 0,
        justified: false,
        updatedAt: '2024-03-05T10:00:00'
      }];

      repository.getDailyRecords(10, '2024-03-05', 1).subscribe(records => {
        expect(records[0].date).toBe('2024-03-05');
        done();
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/attendance/records`
      );
      req.flush(mockRecords);
    });

    it('should handle records without schoolYearId', (done) => {
      repository.getDailyRecords(10, '2024-01-15', null).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${environment.apiUrl}/attendance/records` &&
                   !request.params.has('anneeScolaireId')
      );
      req.flush([]);
    });
  });

  describe('saveDailyAttendance', () => {
    it('should save daily attendance and map response', (done) => {
      const payload = {
        classId: 10,
        className: 'CP-A',
        date: '2024-01-15',
        entries: [
          { studentId: 100, studentName: 'Jean Dupont', status: 'PRESENT' as AttendanceStatus, hours: 0 },
          { studentId: 101, studentName: 'Marie Martin', status: 'ABSENT' as AttendanceStatus, hours: 4 }
        ]
      };

      const mockResponse = [
        {
          id: 1,
          studentId: 100,
          studentName: 'Jean Dupont',
          classId: 10,
          className: 'CP-A',
          date: [2024, 1, 15],
          status: 'PRESENT',
          hours: 0,
          justified: false,
          updatedAt: '2024-01-15T10:00:00'
        },
        {
          id: 2,
          studentId: 101,
          studentName: 'Marie Martin',
          classId: 10,
          className: 'CP-A',
          date: [2024, 1, 15],
          status: 'ABSENT',
          hours: 4,
          justified: false,
          updatedAt: '2024-01-15T10:00:00'
        }
      ];

      repository.saveDailyAttendance(payload).subscribe(records => {
        expect(records.length).toBe(2);
        expect(records[0].id).toBe(1);
        expect(records[0].date).toBe('2024-01-15');
        expect(records[1].status).toBe('ABSENT');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/daily`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should handle empty entries', (done) => {
      const payload = {
        classId: 10,
        className: 'CP-A',
        date: '2024-01-15',
        entries: []
      };

      repository.saveDailyAttendance(payload).subscribe(records => {
        expect(records).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/daily`);
      req.flush([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 error on getSections', (done) => {
      repository.getSections().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/section`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 error on saveDailyAttendance', (done) => {
      const payload = {
        classId: 10,
        className: 'CP-A',
        date: '2024-01-15',
        entries: []
      };

      repository.saveDailyAttendance(payload).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/daily`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
