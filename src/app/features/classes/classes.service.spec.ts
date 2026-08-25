import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Section } from '@app/features/section/domain/models';
import { ClassRoomService } from '@app/features/classes/infrastructure/classRoom.service';
import { environment } from '@environments/environment';

describe('ClassRoomService', () => {
  let service: ClassRoomService;
  let httpMock: HttpTestingController;

  const mockSection: Section = {
    id: 1,
    libelle: 'Francophone',
  };

  const mockSchoolYear: AnneeScolaire = {
    id: 1,
    libelleAcademicYear: '2024-2025',
    dateDebut: '2024-09-01',
    dateFin: '2025-06-30',
    statutCode: true,
  };

  const mockClass: Class = {
    id: 1,
    nameClasse: 'CM2',
    level: 'Primaire',
    capacity: 30,
    section: mockSection,
    academicYear: mockSchoolYear,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClassRoomService],
    });

    service = TestBed.inject(ClassRoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the total number of classes', () => {
    service.getCount().subscribe((count: number) => {
      expect(count).toBe(10);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes/count`);
    expect(req.request.method).toBe('GET');
    req.flush(10);
  });

  it('should get a class by id', () => {
    service.getById(1).subscribe((classData: Class) => {
      expect(classData).toEqual(mockClass);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClass);
  });

  it('should scope section classes to the requested academic year', () => {
    service.getClassesBySection(1, 2).subscribe();

    const req = httpMock.expectOne((request) =>
      request.url === `${environment.apiUrl}/classes/by-section/1` &&
      request.params.get('academicYearId') === '2',
    );
    expect(req.request.method).toBe('GET');
    req.flush([mockClass]);
  });

  it('should create a new class', () => {
    const classToCreate: Class = {
      ...mockClass,
      id: undefined,
    };

    service.createClass(classToCreate).subscribe((classData: Class) => {
      expect(classData).toEqual(mockClass);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(classToCreate);
    req.flush(mockClass);
  });

  it('should update a class', () => {
    service.update(1, mockClass).subscribe((classData: Class) => {
      expect(classData).toEqual({
        ...mockClass,
        id: 1,
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      ...mockClass,
      id: 1,
    });
    req.flush({
      ...mockClass,
      id: 1,
    });
  });

  it('should delete a class', () => {
    service.delete(1).subscribe((response: void) => {
      expect(response as unknown).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
