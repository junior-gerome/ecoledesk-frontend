import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AnneeScolaireService } from '@app/features/gestion-annees/infrastructure/annee-scolaire.service';
import { GestionAnneesComponent } from './gestion-annees.component';

describe('GestionAnneesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionAnneesComponent],
      providers: [
        {
          provide: AnneeScolaireService,
          useValue: {
            getAll: () => of([]),
            create: () =>
              of({
                id: 1,
                libelleAcademicYear: '2024-2025',
                dateDebut: '2024-09-01',
                dateFin: '2025-06-30',
                statutCode: true,
              }),
            activate: () => of(void 0),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GestionAnneesComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
