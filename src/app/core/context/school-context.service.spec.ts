import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthenticatedUserProfile } from '@app/core/models';
import { SessionService } from '@app/core/services/session.service';
import { AnneeScolaireService } from '@app/features/gestion-annees/infrastructure/annee-scolaire.service';
import { SequenceService } from '@app/features/sequence/infrastructure/sequence.service';
import { TrimestreService } from '@app/features/trimestre/infrastructure/trimestre.service';
import { SchoolContextService } from './school-context.service';

describe('SchoolContextService', () => {
  let context: SchoolContextService;
  let profile: ReturnType<typeof signal<AuthenticatedUserProfile | null>>;
  let session: jasmine.SpyObj<SessionService>;
  let years: jasmine.SpyObj<AnneeScolaireService>;
  let trimestres: jasmine.SpyObj<TrimestreService>;
  let sequences: jasmine.SpyObj<SequenceService>;

  const user = { id: 11, firstName: 'A', lastName: 'B', roleType: 'AGENT' as const };
  const year = { id: 2, libelleAcademicYear: '2025-2026', dateDebut: '', dateFin: '', statutCode: true };
  const oldYear = { id: 1, libelleAcademicYear: '2024-2025', dateDebut: '', dateFin: '', statutCode: false };
  const term = { id: 20, libelleTrimestre: 'Trimestre 1', anneeScolaire: year };
  const sequence = { id: 30, libelleSequence: 'SÃ©quence 1', trimestre: term };

  beforeEach(() => {
    profile = signal<AuthenticatedUserProfile | null>(null);
    session = jasmine.createSpyObj<SessionService>('SessionService', ['getItem', 'setItem', 'removeItem'], { userProfile: profile.asReadonly() });
    session.getItem.and.returnValue(null);
    years = jasmine.createSpyObj<AnneeScolaireService>('AnneeScolaireService', ['getAll']);
    trimestres = jasmine.createSpyObj<TrimestreService>('TrimestreService', ['getAll']);
    sequences = jasmine.createSpyObj<SequenceService>('SequenceService', ['getAll']);
    years.getAll.and.returnValue(of([oldYear, year]));
    trimestres.getAll.and.returnValue(of([term]));
    sequences.getAll.and.returnValue(of([sequence]));
    TestBed.configureTestingModule({ providers: [
      SchoolContextService,
      { provide: SessionService, useValue: session },
      { provide: AnneeScolaireService, useValue: years },
      { provide: TrimestreService, useValue: trimestres },
      { provide: SequenceService, useValue: sequences },
    ] });
    context = TestBed.inject(SchoolContextService);
  });

  it('loads the active year and compatible periods', async () => {
    profile.set(user);
    await context.load();
    expect(context.selectedSchoolYear()?.id).toBe(2);
    expect(context.trimestres()).toEqual([term]);
    expect(context.sequences()).toEqual([]);
  });

  it('resets incompatible trimestre and sequence when the year changes', async () => {
    profile.set(user);
    await context.load();
    context.selectTrimestre(20);
    context.selectSequence(30);
    expect(context.selectionState()).toEqual({ schoolYearId: 2, trimestreId: 20, sequenceId: 30 });
    context.selectSchoolYear(1);
    expect(context.selectionState()).toEqual({ schoolYearId: 1, trimestreId: null, sequenceId: null });
  });

  it('persists a user-scoped selection', async () => {
    profile.set(user);
    await context.load();
    context.selectTrimestre(20);
    expect(session.setItem).toHaveBeenCalled();
  });

  it('clears the context and persisted selection on logout', async () => {
    profile.set(user);
    await context.load();
    context.selectTrimestre(20);
    profile.set(null);
    await Promise.resolve();
    expect(context.selectionState()).toEqual({ schoolYearId: null, trimestreId: null, sequenceId: null });
    expect(session.removeItem).toHaveBeenCalled();
  });

  it('exposes a recoverable loading error', async () => {
    years.getAll.and.returnValue(throwError(() => new Error('offline')));
    profile.set(user);
    await context.load();
    expect(context.error()).toBe('schoolContext.loadError');
    expect(context.loading()).toBeFalse();
  });
});

