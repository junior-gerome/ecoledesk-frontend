import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { PaymentFormUseCase } from '../../../payments/application/use-cases/payment-form.use-case';
import { InscriptionComponent } from './inscription.component';

describe('InscriptionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionComponent],
      providers: [
        {
          provide: PaymentFormUseCase,
          useValue: {
            isSubmitting: () => false,
            studentsSignal: () => [],
            loadStudents: () => undefined,
            getPayment: () => undefined,
            savePayment: () => undefined,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true),
          },
        },
      ],
    })
      .overrideComponent(InscriptionComponent, {
        set: {
          providers: [
            {
              provide: PaymentFormUseCase,
              useValue: {
                isSubmitting: () => false,
                studentsSignal: () => [],
                loadStudents: () => undefined,
                getPayment: () => undefined,
                savePayment: () => undefined,
              },
            },
          ],
        },
      })
      .compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InscriptionComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
