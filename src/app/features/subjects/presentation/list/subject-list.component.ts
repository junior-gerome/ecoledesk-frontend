import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { SubjectReponse } from "@app/features/subjects/domain/models";
import { SubjectService } from "@app/features/subjects/infrastructure/subject.service";
import { first } from "rxjs";
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { TableComponent } from "@app/shared/ui/table/table.component";

@Component({
  selector: "app-subject-list",
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, ButtonComponent, TableComponent],
  templateUrl: "./subject-list.component.html",
  styleUrls: ["./subject-list.component.scss"],
})
export class SubjectListComponent implements OnInit {
  readonly subjects = signal<SubjectReponse[]>([]);
  readonly isLoading = signal(false);

  private subjectService = inject(SubjectService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading.set(true);
    this.subjectService
      .getAllSubjects()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.subjects.set(data ?? []);
          this.isLoading.set(false);
          console.log('Subjects:', this.subjects());
        },
        error: (err) => {
          console.error("Erreur lors du chargement des matières :", err);
          this.isLoading.set(false);
          alert("❌ Impossible de charger la liste des matières.");
        },
      });
  }

  addSubject(): void {
    // this.router.navigate(["/subjects/new"]);
  }

  editSubject(id: number): void {
    this.router.navigate(["/subjects", id]);
  }

  /** Suppression d'une matière */
  deleteSubject(id: number): void {
    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer cette matière ?",
    );
    if (!confirmDelete) return;

    this.subjectService.deleteSubject(id).subscribe({
      next: () => {
        alert("✅ Matière supprimée avec succès!");
        this.loadSubjects(); // Recharger la liste
      },
      error: (err) => {
        console.error("Erreur lors de la suppression :", err);
        alert("❌ Erreur lors de la suppression.");
      },
    });
  }

  getStatusText(isActive: boolean): string {
    return isActive ? "Active" : "Inactive";
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-200 text-gray-700";
  }
}
