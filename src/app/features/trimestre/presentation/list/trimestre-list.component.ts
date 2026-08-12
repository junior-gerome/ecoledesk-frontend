import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Trimestre } from "@app/features/trimestre/domain/models";
import { TrimestreService } from "@app/features/trimestre/infrastructure/trimestre.service";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { first } from "rxjs";
import { TableComponent } from "@app/shared/ui/table/table.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";

@Component({
  selector: "app-trimestre",
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, TableComponent,PageHeaderComponent, PageLayoutComponent, TranslateModule],
  templateUrl: "./trimestre-list.component.html",
  styleUrl: "./trimestre-list.component.scss",
})
export class TrimestreListComponent implements OnInit {
  readonly trimestres = signal<Trimestre[]>([]);
  readonly isLoading = signal(false);

  private readonly trimestreService = inject(TrimestreService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadTrimestres();
  }

  loadTrimestres(): void {
    this.isLoading.set(true);
    this.trimestreService
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.trimestres.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error("Erreur lors du chargement des trimestres :", err);
          this.isLoading.set(false);
          alert("❌ Impossible de charger la liste des trimestres.");
        },
      });
  }

  addTrimestres(): void {
    // this.router.navigate(["/subjects/new"]);
  }

  editTrimestres(id: number): void {
    this.router.navigate(["/trimestre", id]);
  }

  deleteTrimestres(id: number): void {
    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer cette matière ?",
    );
    if (!confirmDelete) return;

    this.trimestreService.delete(id).subscribe({
      next: () => {
        alert("✅ Matière supprimée avec succès!");
        this.loadTrimestres(); // Recharger la liste
      },
      error: (err) => {
        console.error("Erreur lors de la suppression :", err);
        alert("❌ Erreur lors de la suppression.");
      },
    });
  }

  // getStatusText(isActive: boolean): string {
  //   return isActive ? "Active" : "Inactive";
  // }

  // getStatusClass(isActive: boolean): string {
  //   return isActive
  //     ? "bg-green-100 text-green-800"
  //     : "bg-gray-200 text-gray-700";
  // }
}
