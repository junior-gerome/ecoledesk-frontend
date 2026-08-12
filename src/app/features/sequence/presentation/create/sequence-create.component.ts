import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { Sequence } from '@app/features/sequence/domain/models';
import { SequenceService } from '@app/features/sequence/infrastructure/sequence.service';
import { Trimestre } from '@app/features/trimestre/domain/models';
import { finalize, first } from 'rxjs';
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";

@Component({
  selector: "app-sequence",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, SelectComponent,
    PageLayoutComponent, PageHeaderComponent, PageFormBodyComponent, FormBodyComponent, TranslateModule],
  templateUrl: "./sequence-create.component.html",
  styleUrl: "./sequence-create.component.scss",
})
export class SequenceCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sequenceService = inject(SequenceService);
  private readonly destroyRef = inject(DestroyRef);

  Sequenceform!: FormGroup;
  readonly libelle = signal<Trimestre[]>([]);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly sequenceId = signal<number | null>(null);
  readonly trimestreOptions = computed<SelectOption<number>[]>(() =>
    this.libelle()
      .filter((t) => Number(t.id))
      .map((t) => ({
        value: Number(t.id),
        label: t.libelleTrimestre ?? `Trimestre ${t.id}`,
      })),
  );

  constructor() {
    this.Sequenceform = this.fb.group({
      libelleSequence: ["", [Validators.required, Validators.minLength(2)]],
      trimestreId: [null],
    });
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadRequireDate();
  }

  private loadRequireDate(): void {
    this.sequenceService.getTrimestre().subscribe({
      next: (data) => this.libelle.set(data),

      error: (err) =>
        console.error("Erreur lors du chargement du trimestre :", err),
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
          this.sequenceId.set(id);
          this.load(id);
        }
      });
  }

  
  private load(id: number): void {
    this.sequenceService
      .getByIdSequence(id)
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dto) => {
          if (dto) {
            this.Sequenceform.patchValue(dto);
          }
        },
        error: (err) => {
          console.error("Erreur de chargement", err);
          alert("❌ Impossible de charger la sequence.");
          this.router.navigate(["/sequence"]);
        },
      });
  }

  onsubmit() {
    if (!this.Sequenceform.valid) {
      this.Sequenceform.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.isSubmitting.set(true);
    const formData = this.Sequenceform.value;

    const SequenData: Sequence = {
      libelleSequence: formData.libelleSequence,
      trimestre: { id: formData.trimestreId } as Trimestre,
    };

    const operation$ =
      this.isEdit() && this.sequenceId()
        ? this.sequenceService.update(this.sequenceId()!, SequenData)
        : this.sequenceService.createSequence(SequenData);

    operation$
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const successMessage = this.isEdit()
            ? "✅ Sequence mise à jour avec succès !"
            : "✅ Sequence créée avec succès !";
          alert(successMessage);
          this.router.navigate(["/sequence"]);
        },
        error: (err) => {
          console.error("Erreur lors de l'enregistrement:", err);
          this.error.set(
            err.status === 409
              ? "❌ Une Classe avec ce code existe déjà."
              : "❌ Erreur lors de l'enregistrement."
          ); 
          alert(this.error());
        },
      });
  }

  cancel() {
    this.router.navigate(["/sequence"]);
  }
}
