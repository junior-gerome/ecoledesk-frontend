import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Class } from '@app/features/classes/domain/models';
import { NotificationService } from '@app/core/notification/notification.service';
import { SchoolContextService } from '@app/core/context/school-context.service';
import { CLASS_LIST_REPOSITORY } from '../../domain/repositories/class-list.repository';

@Injectable()
export class ClassListUseCase {
  private readonly repository = inject(CLASS_LIST_REPOSITORY);
  private readonly notificationService = inject(NotificationService);
  private readonly schoolContext = inject(SchoolContextService);
  private readonly router = inject(Router);

  readonly classes = signal<Class[]>([]);
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);

  loadClasses(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.repository.getAll(this.schoolContext.selectedSchoolYear()?.id).subscribe({
      next: (classes) => {
        this.classes.set(classes ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.isLoading.set(false);
        this.error.set('Une erreur est survenue lors du chargement des classes.');
      },
    });
  }

  goToEdit(id: number): void {
    void this.router.navigate(['/classes', id]);
  }

  deleteClass(id: number): void {
    if (!id || !confirm('Etes-vous sur de vouloir supprimer cette classe ?')) {
      return;
    }

    this.repository.delete(id).subscribe({
      next: () => {
        this.classes.update((current) => current.filter((classe) => classe.id !== id));
        this.notificationService.success('Classe supprimee avec succes.', 0);
      },
      error: (error) => {
        console.error('Error deleting class:', error);
        this.error.set('Une erreur est survenue lors de la suppression de la classe.');
        this.notificationService.error(
          'Impossible de supprimer la classe selectionnee.',
          0,
        );
      },
    });
  }
}
