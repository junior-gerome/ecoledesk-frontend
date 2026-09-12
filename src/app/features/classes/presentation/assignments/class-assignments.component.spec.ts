import { Gender } from '@app/enums/gender';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ClassRoomService } from '@app/features/classes/infrastructure/classRoom.service';
import { ClassAssignmentsComponent } from './class-assignments.component';

describe('ClassAssignmentsComponent', () => {
  let fixture: ComponentFixture<ClassAssignmentsComponent>;
  let component: ClassAssignmentsComponent;
  let service: jasmine.SpyObj<ClassRoomService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    service = jasmine.createSpyObj<ClassRoomService>('ClassRoomService', ['getById', 'getAvailableTeachers', 'assignTeacher', 'removeTeacher']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    service.getById.and.returnValue(of({ id: 4, nameClasse: 'CM2', level: 'CM2', capacity: 30, section: { id: 1, libelle: 'Primaire' }, academicYear: { id: 2, libelleAcademicYear: '2025-2026', dateDebut: '2025-09-01', dateFin: '2026-06-30', statutCode: true } }));
    service.getAvailableTeachers.and.returnValue(of([{ id: 9, employeeNumber: 'EMP-009', firstName: 'Ada', lastName: 'Lovelace', gender: Gender.FEMININ, active: true }]));
    service.assignTeacher.and.returnValue(of(void 0));
    service.removeTeacher.and.returnValue(of(void 0));
    TestBed.configureTestingModule({
      imports: [ClassAssignmentsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ClassRoomService, useValue: service },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '4' } } } },
      ],
    });
    fixture = TestBed.createComponent(ClassAssignmentsComponent);
    component = fixture.componentInstance;
  });

  it('loads the class and available teachers from real services', async () => {
    await component.load();
    expect(component.classroom()?.nameClasse).toBe('CM2');
    expect(component.teacherOptions[0].label).toBe('Ada Lovelace');
  });

  it('saves the selected main teacher', async () => {
    await component.load();
    component.selectTeacher(9);
    await component.save();
    expect(service.assignTeacher).toHaveBeenCalledWith(4, 9);
    expect(component.saved()).toBeTrue();
  });

  it('keeps the form state when saving fails', async () => {
    service.assignTeacher.and.returnValue(throwError(() => new Error('500')));
    await component.load();
    component.selectTeacher(9);
    await component.save();
    expect(component.selectedTeacherId()).toBe(9);
    expect(component.saveError()).toBe('classAssignments.saveError');
  });
});


