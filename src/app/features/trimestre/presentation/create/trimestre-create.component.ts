import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Trimestre } from "@app/features/trimestre/domain/models";
import { TrimestreService } from "@app/features/trimestre/infrastructure/trimestre.service";
import { finalize, first } from "rxjs";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";

@Component({
  selector: "app-trimestre",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent,PageFormBodyComponent,FormBodyComponent,PageHeaderComponent,PageLayoutComponent, TranslateModule],
  templateUrl: "./trimestre-create.component.html",
  styleUrl: "./trimestre-create.component.scss",
})
export class TrimestrecreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly trimService = inject(TrimestreService);
  private readonly destroyRef = inject(DestroyRef);

  formTrim!: FormGroup;
  readonly statutCode = signal<AnneeScolaire | null>(null);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly trimestreid = signal<number | null>(null);

  constructor() {
    this.formTrim = this.fb.group({
      libelleTrimestre: ["", [Validators.required, Validators.minLength(2)]],
      anneeScolaireId: [null],
    });
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadRequireDate();
  }

  get ctrl() {
    return this.formTrim.controls;
  }

  private loadRequireDate(): void {
    this.trimService.getAnneeScolaireActive().subscribe({
      next: (data) => {
        this.statutCode.set(data);
        this.formTrim.patchValue({
          anneeScolaireId: data.id,
        });
      },
      error: (err) =>
        console.error("Erreur lors du chargement de l'année scolaire :", err),
    });
  }

  private checkEditMode(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get("id");
        if (idParam && idParam !== "new") {
          const id = Number(idParam);
          this.isEdit.set(true);
          this.trimestreid.set(id);
          this.load(id);
        }
      });
  }

  private load(id: number): void {
    this.trimService
      .getById(id)
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dto) => {
          if (dto) {
            this.formTrim.patchValue(dto);
          }
        },
        error: (err) => {
          console.error("Erreur de chargement", err);
          alert("❌ Impossible de charger du trimestre.");
          this.router.navigate(["/trimestre"]);
        },
      });
  }

  onsubmit() {
    if (!this.formTrim.valid) {
      this.formTrim.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.isSubmitting.set(true);
    const formData = this.formTrim.value;

    const trimData: Trimestre = {
      libelleTrimestre: formData.libelleTrimestre,
      anneeScolaire: { id: formData.anneeScolaireId } as AnneeScolaire,
    };

    const operation$ =
      this.isEdit() && this.trimestreid()
        ? this.trimService.update(this.trimestreid()!, trimData)
        : this.trimService.createTrimestre(trimData);

    operation$
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const successMessage = this.isEdit()
            ? "✅ Trimestre mise à jour avec succès !"
            : "✅ Trimestre créée avec succès !";
          alert(successMessage);
          this.router.navigate(["/trimestre"]);
        },
        error: (err) => {
          // 🟢 Mise à jour du nom de variable pour éviter le conflit
          console.error("Erreur lors de l'enregistrement:", err);
          this.error.set(
            // 🟢 Utilisation du signal 'error'
            err.status === 409
              ? "❌ Une Classe avec ce code existe déjà."
              : "❌ Erreur lors de l'enregistrement.",
          );
          alert(this.error());
        },
      });
  }

  cancel() {
    this.router.navigate(["/trimestre"]);
  }
}
