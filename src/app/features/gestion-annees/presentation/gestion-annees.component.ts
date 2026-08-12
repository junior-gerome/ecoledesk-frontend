import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { AnneeScolaireService } from "@app/features/gestion-annees/infrastructure/annee-scolaire.service";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { TableComponent } from "@app/shared/ui/table/table.component";

@Component({
  selector: "app-gestion-annees",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    TableComponent,
    FormBodyComponent,
    PageFormBodyComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    TranslateModule,
  ],
  templateUrl: "./gestion-annees.component.html",
  styleUrls: ["./gestion-annees.component.scss"],
})
export class GestionAnneesComponent implements OnInit {
  annees: AnneeScolaire[] = [];
  anneeForm: FormGroup;

  constructor(
    private anneeScolaireService: AnneeScolaireService,
    private fb: FormBuilder,
  ) {
    this.anneeForm = this.fb.group({
      libelleAnneeScolaire: ["", Validators.required],
      dateDebut: ["", Validators.required],
      dateFin: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAnnees();
  }

  loadAnnees(): void {
    this.anneeScolaireService.getAll().subscribe((data) => {
      this.annees = data;
    });
  }

  onSubmit(): void {
    if (this.anneeForm.invalid) return;

    this.anneeScolaireService
      .create(this.anneeForm.value)
      .subscribe((nouvelleAnnee) => {
        this.annees.push(nouvelleAnnee);
        this.anneeForm.reset();
      });
  }

  onActivate(id: number | undefined): void {
    if (!id) return;
    this.anneeScolaireService.activate(id).subscribe(() => {
      this.loadAnnees();
    });
  }
}
