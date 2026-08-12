import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ParentFacade } from "@app/features/parent/application/parent.facade";
import {
  ParentLinkedStudent,
  Parents,
} from "@app/features/parent/domain/models";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TableComponent } from "@app/shared/ui/table/table.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";

type ParentTab = "list" | "links" | "messages";

import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: "app-parent-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    RouterModule,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TableComponent,
    TextareaComponent,
  ],
  templateUrl: "./parent-list.component.html",
  styleUrls: ["./parent-list.component.scss"],
})
export class ParentListComponent implements OnInit {
  private readonly parentFacade = inject(ParentFacade);
  private readonly route = inject(ActivatedRoute);

  readonly parents = signal<Parents[]>([]);
  readonly linkedStudents = signal<ParentLinkedStudent[]>([]);
  readonly activeTab = signal<ParentTab>("list");
  readonly loading = signal(false);
  readonly selectedParentId = signal<number | null>(null);
  readonly message = signal("");
  readonly notice = signal("");

  readonly parentOptions = computed<SelectOption<number>[]>(() =>
    this.parents().map((parent) => ({
      value: Number(parent.id),
      label: `${parent.firstNameParent} ${parent.lastNameParent}`,
    })),
  );

  readonly selectedParent = computed(() =>
    this.parents().find((parent) => parent.id === this.selectedParentId()) ?? null,
  );

  readonly form: Parents = {
    lastNameParent: "",
    firstNameParent: "",
    email: "",
    address: "",
    professionParent: "",
    phoneNumber: "",
    typeParent: null,
  };

  ngOnInit(): void {
    this.activeTab.set((this.route.snapshot.data["tab"] as ParentTab) || "list");
    this.loadParents();
  }

  setTab(tab: ParentTab): void {
    this.activeTab.set(tab);
    if ((tab === "links" || tab === "messages") && this.selectedParentId()) {
      this.loadLinkedStudents();
    }
  }

  loadParents(): void {
    this.loading.set(true);
    this.parentFacade.getAll().subscribe({
      next: (parents) => {
        this.parents.set(parents || []);
        this.selectedParentId.set(this.selectedParentId() ?? parents?.[0]?.id ?? null);
        this.loading.set(false);
        if (this.activeTab() !== "list" && this.selectedParentId()) {
          this.loadLinkedStudents();
        }
      },
      error: () => {
        this.loading.set(false);
        this.notice.set("Impossible de charger les responsables legaux.");
      },
    });
  }

  saveParent(): void {
    const payload = { ...this.form };
    const request = payload.id
      ? this.parentFacade.update(payload.id, payload)
      : this.parentFacade.create(payload);

    request.subscribe({
      next: () => {
        this.notice.set(payload.id ? "Responsable legal mis a jour." : "Responsable legal ajoute.");
        this.resetForm();
        this.loadParents();
      },
      error: () => this.notice.set("Enregistrement impossible."),
    });
  }

  editParent(parent: Parents): void {
    Object.assign(this.form, parent);
    this.setTab("list");
  }

  deleteParent(parent: Parents): void {
    if (!parent.id) return;
    this.parentFacade.deleteParent(parent.id).subscribe({
      next: () => {
        this.notice.set("Responsable legal supprime.");
        this.loadParents();
      },
      error: () => this.notice.set("Suppression impossible: des eleves peuvent etre lies."),
    });
  }

  loadLinkedStudents(): void {
    const parentId = this.selectedParentId();
    if (!parentId) {
      this.linkedStudents.set([]);
      return;
    }

    this.parentFacade.getLinkedStudents(parentId).subscribe({
      next: (students) => this.linkedStudents.set(students || []),
      error: () => this.notice.set("Impossible de charger les eleves lies."),
    });
  }

  sendMessage(): void {
    const parentId = this.selectedParentId();
    const message = this.message().trim();
    if (!parentId || !message) return;

    this.parentFacade.sendMessage(parentId, message).subscribe({
      next: () => {
        this.notice.set("Message enregistre et transmis au flux de notifications.");
        this.message.set("");
      },
      error: () => this.notice.set("Envoi du message impossible."),
    });
  }

  resetForm(): void {
    Object.assign(this.form, {
      id: undefined,
      lastNameParent: "",
      firstNameParent: "",
      email: "",
      address: "",
      professionParent: "",
      phoneNumber: "",
      typeParent: null,
    });
  }
}
