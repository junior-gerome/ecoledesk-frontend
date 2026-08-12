import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ClassRoomService } from "@app/features/classes/infrastructure/classRoom.service";
import { MontantService } from "@app/features/montant/infrastructure/montant.service";
import { TypePaiement } from "@app/enums/typePaiement.enum";
import { Montant } from "@app/features/montant/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { TableComponent } from "@app/shared/ui/table/table.component";

@Component({
  selector: "app-montant",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    PageFormBodyComponent,
    FormBodyComponent,
    TableComponent,
    TranslateModule,
  ],
  templateUrl: "./montant.component.html",
  styleUrl: "./montant.component.scss",
})
export class MontantComponent implements OnInit {
  montantForm: FormGroup;
  montants: Montant[] = [];
  classes: Class[] = [];
  typePaiements = [TypePaiement.FRAIS_PREINSCRIPTION];
  isSubmitting = false;

  get classOptions(): SelectOption<number>[] {
    return (this.classes || [])
      .filter((c) => Number(c.id))
      .map((c) => ({
        value: Number(c.id),
        label: c.nameClasse ?? `Classe ${c.id}`,
      }));
  }

  get typeOptions(): SelectOption<string>[] {
    return (this.typePaiements || []).map((t) => ({
      value: t,
      label: this.typePaiementLabel(t),
    }));
  }

  private fb = inject(FormBuilder);
  private montantService = inject(MontantService);
  private classRoomService = inject(ClassRoomService);

  constructor() {
    this.montantForm = this.fb.group({
      count: [null, [Validators.required, Validators.min(1000)]],
      classId: [null, Validators.required],
      typePaiement: [TypePaiement.FRAIS_PREINSCRIPTION, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadMontants();
  }

  loadClasses(): void {
    this.classRoomService.getAll().subscribe({
      next: (classes) => (this.classes = classes),
      error: (err) => console.error("Erreur chargement classes:", err),
    });
  }

  loadMontants(): void {
    this.montantService.getAllMontant().subscribe({
      next: (montants) => (this.montants = montants),
      error: (err) => console.error("Erreur chargement montants:", err),
    });
  }

  onSubmit(): void {
    if (this.montantForm.invalid) {
      this.montantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.montantForm.value;

    const montantToSave: Montant = {
      count: formValue.count,
      classeRoom: { id: formValue.classId } as Class,
      typePaiement: formValue.typePaiement,
    };

    this.montantService.createMontant(montantToSave).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.montantForm.reset({
          count: null,
          classId: null,
          typePaiement: TypePaiement.FRAIS_PREINSCRIPTION,
        });
        this.loadMontants();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error("Erreur enregistrement:", err);
      },
    });
  }

  deleteMontant(id: number): void {
    if (window.confirm("Voulez-vous vraiment supprimer ce montant ?")) {
      this.montantService.deleteMontant(id).subscribe({
        next: () => this.loadMontants(),
        error: (err) => console.error("Erreur suppression:", err),
      });
    }
  }

  typePaiementLabel(type: TypePaiement | string | null | undefined): string {
    if (type === TypePaiement.FRAIS_PREINSCRIPTION || type === "FRAIS_INSCRIPTION") {
      return "Frais de preinscription";
    }

    if (!type) {
      return "-";
    }

    return String(type).replace(/^FRAIS_/, "Frais ").replaceAll("_", " ").toLowerCase();
  }
}
