import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Sequence } from "@app/features/sequence/domain/models";
import { SequenceService } from "@app/features/sequence/infrastructure/sequence.service";
import { first } from "rxjs";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { TableComponent } from "@app/shared/ui/table/table.component";

@Component({
  selector: "app-sequence-list",
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, TableComponent, TranslateModule],
  templateUrl: "./sequence-list.component.html",
  styleUrl: "./sequence-list.component.scss",
})
export class SequenceListComponent implements OnInit {
  readonly sequences = signal<Sequence[]>([]);
  readonly isLoading = signal(false);

  private readonly sequenceService = inject(SequenceService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadSequences();
  }

  loadSequences(): void {
    this.isLoading.set(true);
    this.sequenceService
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.sequences.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error("Erreur lors du chargement des trimestres :", err);
          this.isLoading.set(false);
          alert("❌ Impossible de charger la liste des trimestres.");
        },
      });
  }

  addSequences(): void {
    // this.router.navigate(["/subjects/new"]);
  }

  editSequences(id: number): void {
    this.router.navigate(["/sequence", id]);
  }

  deleteSequences(id: number): void {
    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer cette matière ?",
    );
    if (!confirmDelete) return;

    this.sequenceService.delete(id).subscribe({
      next: () => {
        alert("✅ Matière supprimée avec succès!");
        this.loadSequences();
      },
      error: (err) => {
        console.error("Erreur lors de la suppression :", err);
        alert("❌ Erreur lors de la suppression.");
      },
    });
  }
}
