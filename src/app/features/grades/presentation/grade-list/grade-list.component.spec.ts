import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { GradeListFacade } from '../../application/facades/grade-list.facade';
import { GradeListStore } from '../store/grade-list.store';

describe('GradeListStore', () => {
  let store: GradeListStore;
  let facadeSpy: jasmine.SpyObj<GradeListFacade>;

  const translateStub: Pick<TranslateService, 'instant'> = {
    instant: (key: string): string =>
      key === 'gradePage.allClasses' ? 'All classes' : key,
  };

  beforeEach(() => {
    facadeSpy = jasmine.createSpyObj<GradeListFacade>('GradeListFacade', [
      'listClasses',
      'listSubjects',
      'listPeriods',
      'listGrades',
    ]);
    facadeSpy.listClasses.and.returnValue(of([{ id: 1, name: 'CP' }, { id: 4, name: 'CE1' }]));
    facadeSpy.listSubjects.and.returnValue(of([{ id: 1, name: 'Maths' }]));
    facadeSpy.listPeriods.and.returnValue(of(['Sequence 1', 'Sequence 2']));
    facadeSpy.listGrades.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        GradeListStore,
        { provide: GradeListFacade, useValue: facadeSpy },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: TranslateService, useValue: translateStub },
      ],
    });

    store = TestBed.inject(GradeListStore);
  });

  it('builds class options with a translated "all" entry', () => {
    store.loadFilterOptions();

    expect(store.classOptions()).toEqual([
      { label: 'All classes', value: 0 },
      { label: 'CP', value: 1 },
      { label: 'CE1', value: 4 },
    ]);
  });

  it('builds subject and period options keyed with translated "all" entries', () => {
    store.loadFilterOptions();

    expect(store.subjectOptions()[0]).toEqual({ label: 'gradePage.allSubjects', value: 0 });
    expect(store.periodOptions()[0]).toEqual({ label: 'gradePage.allPeriods', value: '' });
    expect(store.periodOptions().slice(1)).toEqual([
      { label: 'Sequence 1', value: 'Sequence 1' },
      { label: 'Sequence 2', value: 'Sequence 2' },
    ]);
  });

  it('sets the translation key when grades are requested without a class', () => {
    store.loadGrades();

    expect(store.error()).toBe('gradePage.requireClass');
    expect(store.loading()).toBeFalse();
    expect(facadeSpy.listGrades).not.toHaveBeenCalled();
  });

  it('sets the translation key when grades fail to load', () => {
    facadeSpy.listGrades.and.returnValue(throwError(() => new Error('boom')));
    store.filters.set({ classId: 1 });

    store.loadGrades();

    expect(store.error()).toBe('gradePage.loadError');
  });

  it('maps mention labels to badge variants (including accents)', () => {
    expect(store.getMentionVariant('Excellent')).toBe('success');
    expect(store.getMentionVariant('Très bien')).toBe('success');
    expect(store.getMentionVariant('Bien')).toBe('info');
    expect(store.getMentionVariant('Assez bien')).toBe('info');
    expect(store.getMentionVariant('Passable')).toBe('warning');
    expect(store.getMentionVariant('Faible')).toBe('warning');
    expect(store.getMentionVariant('Très faible')).toBe('danger');
    expect(store.getMentionVariant('Inconnu')).toBe('neutral');
  });
});