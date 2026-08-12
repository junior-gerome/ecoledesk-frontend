import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { RbacService } from '@app/core/security/rbac.service';
import { PaymentService } from '@app/features/payments/infrastructure/payment.service';
import { GradesService } from '@app/features/grades/infrastructure/grades.service';
import { StudentEnrollmentRepository } from '../../infrastructure/student-enrollment.repository';
import { StudentProfileComponent } from './student-profile.component';

describe('StudentProfileComponent', () => {
  let fixture: ComponentFixture<StudentProfileComponent>;
  let component: StudentProfileComponent;
  let repository: jasmine.SpyObj<StudentEnrollmentRepository>;
  let payments: jasmine.SpyObj<PaymentService>;
  let grades: jasmine.SpyObj<GradesService>;
  let router: jasmine.SpyObj<Router>;

  const student = {
    id: '7', lastNameStudent: 'Doe', firstNameStudent: 'Jane', dateOfBirth: '2015-01-02',
    registrationDate: '2024-09-01', gender: 'F', ecolePrecedente: 'Ã‰cole A',
    parent: { id: '3', lastNameParent: 'Doe', firstNameParent: 'John', email: 'john@test.local', address: 'A', professionParent: 'P', phoneNumber: '600000000' },
  };
  const enrollment = {
    id: '10', studentId: '7', classeRoomId: '4', sectionId: '2', anneeScolaireId: '1',
    statutPreinscription: 'INSCRITE' as const, classeRoom: { id: '4', nameClasse: 'CM2' },
  };

  beforeEach(() => {
    repository = jasmine.createSpyObj<StudentEnrollmentRepository>('StudentEnrollmentRepository', [
      'getStudent', 'getEnrollments', 'getSections', 'getAllClasses', 'getActiveSchoolYear',
    ]);
    payments = jasmine.createSpyObj<PaymentService>('PaymentService', ['getPayments']);
    grades = jasmine.createSpyObj<GradesService>('GradesService', ['getGradesByStudent']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    repository.getStudent.and.returnValue(of(student));
    repository.getEnrollments.and.returnValue(of([enrollment]));
    repository.getSections.and.returnValue(of([{ id: '2', libelle: 'Primaire' }]));
    repository.getAllClasses.and.returnValue(of([{ id: '4', nameClasse: 'CM2' }]));
    repository.getActiveSchoolYear.and.returnValue(of({ id: '1', libelleAnneeScolaire: '2024-2025' }));
    payments.getPayments.and.returnValue(of([]));
    grades.getGradesByStudent.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [StudentProfileComponent, TranslateModule.forRoot()],
      providers: [
        { provide: StudentEnrollmentRepository, useValue: repository },
        { provide: PaymentService, useValue: payments },
        { provide: GradesService, useValue: grades },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {
          snapshot: {
            paramMap: { get: (key: string) => key === 'id' ? '7' : null },
            queryParamMap: { get: (key: string) => key === 'q' ? 'Doe' : null },
          },
        } },
        { provide: RbacService, useValue: jasmine.createSpyObj<RbacService>('RbacService', ['hasEveryPermission'], { profile: null }) },
      ],
    });
    TestBed.overrideComponent(StudentProfileComponent, {
      set: {
        providers: [
          { provide: StudentEnrollmentRepository, useValue: repository },
          { provide: PaymentService, useValue: payments },
          { provide: GradesService, useValue: grades },
        ],
      },
    });
    fixture = TestBed.createComponent(StudentProfileComponent);
    component = fixture.componentInstance;
  });

  it('loads and displays the student profile from existing services', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.student()?.id).toBe('7');
    expect(fixture.nativeElement.textContent).toContain('Jane Doe');
    expect(component.availableTabs()).toEqual(['personal', 'enrollment', 'history', 'parents', 'payments', 'grades']);
  });

  it('exposes a recoverable error when the student cannot be loaded', async () => {
    repository.getStudent.and.returnValue(throwError(() => new Error('404')));
    await component.loadProfile();
    expect(component.error()).toBe('studentProfile.loadError');
    expect(component.loading()).toBeFalse();
  });

  it('loads payments lazily and exposes an empty tab state', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await component.selectTab('payments');
    expect(payments.getPayments).toHaveBeenCalledWith({ studentId: 7 });
    expect(component.payments()).toEqual([]);
    expect(component.paymentsLoaded()).toBeTrue();
  });

  it('exposes a recoverable secondary-tab error', async () => {
    payments.getPayments.and.returnValue(throwError(() => new Error('500')));
    await component.loadProfile();
    await component.selectTab('payments');
    expect(component.tabError()).toBe('studentProfile.paymentsError');
  });

  it('preserves the list search context when returning', async () => {
    await component.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/students'], { queryParams: { q: 'Doe' } });
  });

  it('opens the edit route only through the explicit action', async () => {
    await component.editStudent();
    expect(router.navigate).toHaveBeenCalledWith(['/students', '7', 'edit'], { queryParamsHandling: 'preserve' });
  });
});


