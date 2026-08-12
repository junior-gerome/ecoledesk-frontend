import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin } from 'rxjs';
import { AnneeScolaireService } from '@app/features/gestion-annees/infrastructure/annee-scolaire.service';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Sequence } from '@app/features/sequence/domain/models';
import { SequenceService } from '@app/features/sequence/infrastructure/sequence.service';
import { Trimestre } from '@app/features/trimestre/domain/models';
import { TrimestreService } from '@app/features/trimestre/infrastructure/trimestre.service';
import { SessionService } from '@app/core/services/session.service';

export interface SchoolContextSelection {
  schoolYearId: number | null;
  trimestreId: number | null;
  sequenceId: number | null;
}

const EMPTY_SELECTION: SchoolContextSelection = {
  schoolYearId: null,
  trimestreId: null,
  sequenceId: null,
};

@Injectable({ providedIn: 'root' })
export class SchoolContextService {
  private readonly yearsService = inject(AnneeScolaireService);
  private readonly trimestreService = inject(TrimestreService);
  private readonly sequenceService = inject(SequenceService);
  private readonly session = inject(SessionService);
  private readonly selection = signal<SchoolContextSelection>(EMPTY_SELECTION);
  private readonly _years = signal<AnneeScolaire[]>([]);
  private readonly _trimestres = signal<Trimestre[]>([]);
  private readonly _sequences = signal<Sequence[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _revision = signal(0);
  private readonly contextChangedSubject = new BehaviorSubject<SchoolContextSelection>(EMPTY_SELECTION);
  private lastUserId: number | null = null;
  private loadedUserId: number | null = null;

  readonly years = this._years.asReadonly();
  readonly trimestres = computed(() => {
    const yearId = this.selection().schoolYearId;
    return this._trimestres().filter((trimestre) => Number(trimestre.anneeScolaire?.id) === yearId);
  });
  readonly sequences = computed(() => {
    const trimestreId = this.selection().trimestreId;
    return this._sequences().filter((sequence) => Number(sequence.trimestre?.id) === trimestreId);
  });
  readonly selectedSchoolYear = computed(() => this._years().find((year) => Number(year.id) === this.selection().schoolYearId) ?? null);
  readonly selectedTrimestre = computed(() => this._trimestres().find((trimestre) => Number(trimestre.id) === this.selection().trimestreId) ?? null);
  readonly selectedSequence = computed(() => this._sequences().find((sequence) => Number(sequence.id) === this.selection().sequenceId) ?? null);
  readonly selectionState = this.selection.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly revision = this._revision.asReadonly();
  readonly contextChanged$ = this.contextChangedSubject.asObservable();

  constructor() {
    effect(() => {
      const userId = this.session.userProfile()?.id ?? null;
      if (userId === this.lastUserId) return;
      const previousUserId = this.lastUserId;
      this.lastUserId = userId;
      this.loadedUserId = null;
      this.clear(previousUserId);
      if (userId !== null) void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    const userId = this.session.userProfile()?.id ?? null;
    if (userId === null || this.loadedUserId === userId || this._loading()) return;
    this.lastUserId = userId;
    this._loading.set(true);
    this._error.set(null);
    try {
      const result = await firstValueFrom(forkJoin({
        years: this.yearsService.getAll(),
        trimestres: this.trimestreService.getAll(),
        sequences: this.sequenceService.getAll(),
      }));
      this._years.set(result.years ?? []);
      this._trimestres.set(result.trimestres ?? []);
      this._sequences.set(result.sequences ?? []);
      this.loadedUserId = userId;
      this.restoreOrSelectActiveYear(userId);
    } catch {
      this._error.set('schoolContext.loadError');
    } finally {
      this._loading.set(false);
    }
  }

  async retry(): Promise<void> {
    this.loadedUserId = null;
    await this.load();
  }

  selectSchoolYear(id: number | null): void {
    const yearId = this.validId(id);
    const compatibleTrimestre = this._trimestres().find(
      (trimestre) => Number(trimestre.id) === this.selection().trimestreId && Number(trimestre.anneeScolaire?.id) === yearId,
    );
    this.update({ schoolYearId: yearId, trimestreId: compatibleTrimestre?.id ?? null, sequenceId: null });
  }

  selectTrimestre(id: number | null): void {
    const trimestreId = this.validId(id);
    const compatible = this.trimestres().some((trimestre) => Number(trimestre.id) === trimestreId);
    this.update({ ...this.selection(), trimestreId: compatible ? trimestreId : null, sequenceId: null });
  }

  selectSequence(id: number | null): void {
    const sequenceId = this.validId(id);
    const compatible = this.sequences().some((sequence) => Number(sequence.id) === sequenceId);
    this.update({ ...this.selection(), sequenceId: compatible ? sequenceId : null });
  }

  clear(userIdToRemove: number | null = this.lastUserId): void {
    if (userIdToRemove !== null) {
      this.session.removeItem(this.storageKey(userIdToRemove));
    }
    this._years.set([]);
    this._trimestres.set([]);
    this._sequences.set([]);
    this.update(EMPTY_SELECTION, false);
  }

  private restoreOrSelectActiveYear(userId: number): void {
    const saved = this.readPersistedSelection(userId);
    const active = this._years().find((year) => year.statutCode === true) ?? this._years()[0];
    const yearId = this._years().some((year) => Number(year.id) === saved.schoolYearId)
      ? saved.schoolYearId
      : this.validId(active?.id);
    const trimestreId = this._trimestres().some((trimestre) => Number(trimestre.id) === saved.trimestreId && Number(trimestre.anneeScolaire?.id) === yearId)
      ? saved.trimestreId
      : null;
    const sequenceId = this._sequences().some((sequence) => Number(sequence.id) === saved.sequenceId && Number(sequence.trimestre?.id) === trimestreId)
      ? saved.sequenceId
      : null;
    this.update({ schoolYearId: yearId, trimestreId, sequenceId });
  }

  private update(selection: SchoolContextSelection, persist = true): void {
    const current = this.selection();
    if (current.schoolYearId === selection.schoolYearId && current.trimestreId === selection.trimestreId && current.sequenceId === selection.sequenceId) return;
    this.selection.set(selection);
    this._revision.update((value) => value + 1);
    this.contextChangedSubject.next(selection);
    const userId = this.session.userProfile()?.id;
    if (persist && userId !== undefined && userId !== null) {
      this.session.setItem(this.storageKey(userId), JSON.stringify(selection));
    }
  }

  private readPersistedSelection(userId: number): SchoolContextSelection {
    const raw = this.session.getItem(this.storageKey(userId));
    if (!raw) return EMPTY_SELECTION;
    try {
      const value = JSON.parse(raw) as Partial<SchoolContextSelection>;
      return { schoolYearId: this.validId(value.schoolYearId), trimestreId: this.validId(value.trimestreId), sequenceId: this.validId(value.sequenceId) };
    } catch {
      return EMPTY_SELECTION;
    }
  }

  private storageKey(userId: number): string { return `school-context:${userId}`; }
  private validId(value: number | string | null | undefined): number | null {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
}





