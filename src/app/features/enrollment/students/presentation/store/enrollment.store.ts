import { computed, inject, Injectable, signal } from "@angular/core";
import { firstValueFrom, forkJoin, of } from "rxjs";
import { EnrollmentDomainService } from "../../domain/services/enrollment-domain.service";
import { ClassroomEntity } from "../../domain/models/classroom.entity";
import { EnrollmentEntity } from "../../domain/models/enrollment.entity";
import { EnrollmentFormValue } from "../../domain/models/enrollment-form-value.model";
import { PaymentEntity } from "../../domain/models/payment.entity";
import { SchoolYearEntity } from "../../domain/models/school-year.entity";
import { SectionEntity } from "../../domain/models/section.entity";
import { StudentEditionContext } from "../../domain/models/student-edition-context.model";
import { StudentEntity } from "../../domain/models/student.entity";
import { ENROLLMENT_REPOSITORY } from "../../domain/repositories/enrollment.repository";

export interface StoreActionResult {
  success: boolean;
  kind: "success" | "warning" | "error";
  message: string;
}

@Injectable()
export class EnrollmentStore {
  private readonly repository = inject(ENROLLMENT_REPOSITORY);
  private readonly domain = inject(EnrollmentDomainService);

  private readonly _students = signal<StudentEntity[]>([]);
  private readonly _enrollments = signal<EnrollmentEntity[]>([]);
  private readonly _sections = signal<SectionEntity[]>([]);
  private readonly _classes = signal<ClassroomEntity[]>([]);
  private readonly _classCatalog = signal<ClassroomEntity[]>([]);
  private readonly _selectedMontant = signal<PaymentEntity | null>(null);
  private readonly _montantLoading = signal(false);
  private readonly _activeAnneeScolaire = signal<SchoolYearEntity | null>(null);
  private readonly _studentToEdit = signal<StudentEditionContext | null>(null);
  private readonly _isSubmitting = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly students = this._students.asReadonly();
  readonly enrollments = this._enrollments.asReadonly();
  readonly sections = this._sections.asReadonly();
  readonly classes = this._classes.asReadonly();
  readonly selectedMontant = this._selectedMontant.asReadonly();
  readonly montantLoading = this._montantLoading.asReadonly();
  readonly activeAnneeScolaire = this._activeAnneeScolaire.asReadonly();
  readonly studentToEdit = this._studentToEdit.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly classNameMap = computed(() =>
    this.domain.buildClassNameMap(this._classCatalog()),
  );

  readonly latestEnrollmentIndex = computed(() =>
    this.domain.buildLatestEnrollmentIndex(
      this._enrollments(),
      this._activeAnneeScolaire()?.id ?? null,
    ),
  );

  readonly studentClasses = computed(() =>
    this.domain.buildStudentClasses(
      this._students(),
      this.latestEnrollmentIndex(),
      this.classNameMap(),
    ),
  );

  async loadListPage(): Promise<void> {
    this._error.set(null);

    try {
      const snapshot = await firstValueFrom(
        forkJoin({
          students: this.repository.getStudents(),
          enrollments: this.repository.getEnrollments(),
          sections: this.repository.getSections(),
          classes: this.repository.getAllClasses(),
          activeSchoolYear: this.repository.getActiveSchoolYear(),
        }),
      );

      this._students.set(snapshot.students);
      this._enrollments.set(snapshot.enrollments);
      this._sections.set(snapshot.sections);
      this._classCatalog.set(snapshot.classes);
      this._classes.set([]);
      this._selectedMontant.set(null);
      this._montantLoading.set(false);
      this._activeAnneeScolaire.set(snapshot.activeSchoolYear);
    } catch (error) {
      console.error("Erreur lors du chargement des eleves", error);
      this._error.set("Impossible de charger les eleves pour le moment.");
    }
  }

  async loadStudentForm(studentId?: string): Promise<EnrollmentFormValue | null> {
    this._error.set(null);
    this._classes.set([]);
    this._selectedMontant.set(null);
    this._montantLoading.set(false);
    this._studentToEdit.set(null);

    try {
      const snapshot = await firstValueFrom(
        forkJoin({
          sections: this.repository.getSections(),
          classes: this.repository.getAllClasses(),
          activeSchoolYear: this.repository.getActiveSchoolYear(),
          student: studentId ? this.repository.getStudent(studentId) : of(null),
          enrollments: studentId
            ? this.repository.getEnrollments()
            : of<EnrollmentEntity[]>([]),
        }),
      );

      this._sections.set(snapshot.sections);
      this._classCatalog.set(snapshot.classes);
      this._activeAnneeScolaire.set(snapshot.activeSchoolYear);
      this._enrollments.set(snapshot.enrollments);

      if (!studentId || !snapshot.student) {
        return null;
      }

      const enrollment = this.findPreferredEnrollment(snapshot.enrollments, studentId);
      this._studentToEdit.set({
        student: snapshot.student,
        enrollment,
      });

      const formValue = this.domain.buildFormValue(snapshot.student, enrollment);

      if (formValue.sectionId) {
        await this.loadClassesForSection(formValue.sectionId);
      }

      if (formValue.classId) {
        await this.loadMontantForClass(formValue.classId, enrollment?.montant ?? null);
      } else {
        this._selectedMontant.set(enrollment?.montant ?? null);
      }

      return formValue;
    } catch (error) {
      console.error("Erreur lors du chargement du formulaire eleve", error);
      this._error.set("Impossible de charger la fiche de l'eleve.");
      return null;
    }
  }

  async loadClassesForSection(sectionId: string | null): Promise<void> {
    if (!sectionId) {
      this._classes.set([]);
      return;
    }

    try {
      const classes = await firstValueFrom(this.repository.getClassesBySection(sectionId));
      this._classes.set(classes);
    } catch (error) {
      console.error("Erreur lors du chargement des classes", error);
      this._classes.set([]);
      this._error.set("Impossible de charger les classes pour la section selectionnee.");
    }
  }

  async loadMontantForClass(
    classId: string | null,
    fallback: PaymentEntity | null = null,
  ): Promise<void> {
    if (!classId) {
      this._selectedMontant.set(fallback);
      this._montantLoading.set(false);
      return;
    }

    this._montantLoading.set(true);

    try {
      const montant = await firstValueFrom(this.repository.getRegistrationPayment(classId));
      this._selectedMontant.set(montant ?? fallback);
      if (!montant && !fallback) {
        this._error.set("Aucun frais de preinscription n'est configure pour la classe selectionnee.");
      } else {
        this._error.set(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du montant", error);
      this._selectedMontant.set(fallback);
      this._error.set("Impossible de recuperer les frais de preinscription.");
    } finally {
      this._montantLoading.set(false);
    }
  }

  async openStudentForEdit(student: StudentEntity): Promise<EnrollmentFormValue> {
    this._error.set(null);
    const studentId = this.domain.resolveId(student.id);
    const enrollment = studentId
      ? this.latestEnrollmentIndex().get(studentId) ?? null
      : null;

    this._studentToEdit.set({
      student,
      enrollment,
    });

    const formValue = this.domain.buildFormValue(student, enrollment);

    if (formValue.sectionId) {
      await this.loadClassesForSection(formValue.sectionId);
    } else {
      this._classes.set([]);
    }

    if (formValue.classId) {
      await this.loadMontantForClass(formValue.classId, enrollment?.montant ?? null);
    } else {
      this._selectedMontant.set(enrollment?.montant ?? null);
    }

    return formValue;
  }

  closeStudentEdition(): void {
    this._studentToEdit.set(null);
    this._classes.set([]);
    this._selectedMontant.set(null);
    this._montantLoading.set(false);
    this._error.set(null);
  }

  async createEnrollment(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    const schoolYear = this._activeAnneeScolaire();
    const payment = this._selectedMontant();

    if (!schoolYear?.id) {
      return this.fail("Aucune annee scolaire active n'est disponible.");
    }

    if (!payment?.id) {
      return this.fail("Les frais de preinscription sont introuvables pour la classe selectionnee.");
    }

    this._isSubmitting.set(true);
    this._error.set(null);

    try {
      const student = this.domain.buildStudentEntity(formValue);
      const enrollment = this.domain.buildEnrollmentEntity({
        formValue,
        student,
        activeSchoolYear: schoolYear,
        payment,
      });

      await firstValueFrom(this.repository.createEnrollment(enrollment));

      return {
        success: true,
        kind: "success",
        message: "Preinscription enregistree avec succes.",
      };
    } catch (error) {
      console.error("Erreur lors de la creation de la preinscription", error);
      return this.fail("Une erreur est survenue lors de la preinscription.");
    } finally {
      this._isSubmitting.set(false);
    }
  }

  async saveStudentChanges(
    formValue: EnrollmentFormValue,
  ): Promise<StoreActionResult> {
    const context = this._studentToEdit();

    if (!context) {
      return this.fail("Aucun eleve n'est selectionne pour la modification.");
    }

    const studentId = this.domain.resolveId(context.student.id, formValue.studentId);
    if (!studentId) {
      return this.fail("Impossible d'identifier l'eleve a modifier.");
    }

    const schoolYear = this._activeAnneeScolaire() ?? context.enrollment?.anneescolaire ?? null;
    const schoolYearId = this.domain.resolveId(
      schoolYear?.id,
      context.enrollment?.anneeScolaireId,
    );

    if (!schoolYearId) {
      return this.fail("Aucune annee scolaire active n'est disponible.");
    }

    const payment = this._selectedMontant() ?? context.enrollment?.montant ?? null;
    const paymentId = this.domain.resolveId(payment?.id, context.enrollment?.montantId);

    if (!paymentId) {
      return this.fail("Les frais de preinscription sont introuvables pour la classe selectionnee.");
    }

    this._isSubmitting.set(true);
    this._error.set(null);

    let updatedStudent: StudentEntity;

    try {
      updatedStudent = await firstValueFrom(
        this.repository.updateStudent(
          studentId,
          this.domain.buildStudentEntity(formValue, context.student),
        ),
      );
    } catch (error) {
      console.error("Erreur lors de la mise a jour de l'eleve", error);
      this._isSubmitting.set(false);
      return this.fail("Une erreur est survenue lors de la modification de l'eleve.");
    }

    try {
      const enrollmentPayload = this.domain.buildEnrollmentEntity({
        formValue,
        student: updatedStudent,
        currentEnrollment: context.enrollment,
        activeSchoolYear: schoolYear,
        payment,
      });

      const savedEnrollment = context.enrollment?.id
        ? await firstValueFrom(
            this.repository.updateEnrollment(context.enrollment.id, enrollmentPayload),
          )
        : await firstValueFrom(this.repository.createEnrollment(enrollmentPayload));

      this._studentToEdit.set({
        student: updatedStudent,
        enrollment: savedEnrollment,
      });

      return {
        success: true,
        kind: "success",
        message: context.enrollment?.id
          ? "Eleve mis a jour avec succes."
          : "Eleve inscrit avec succes.",
      };
    } catch (error) {
      console.error("Erreur lors de la synchronisation de la preinscription", error);
      this._studentToEdit.set({
        student: updatedStudent,
        enrollment: context.enrollment,
      });
      this._error.set(
        "L'eleve a bien ete modifie, mais la preinscription n'a pas pu etre synchronisee.",
      );
      this._isSubmitting.set(false);

      return {
        success: false,
        kind: "warning",
        message:
          "L'eleve a bien ete modifie, mais la preinscription n'a pas pu etre synchronisee.",
      };
    } finally {
      this._isSubmitting.set(false);
    }
  }

  async deleteStudent(studentId: string): Promise<StoreActionResult> {
    try {
      await firstValueFrom(this.repository.deleteStudent(studentId));

      this._students.update((students) =>
        students.filter((student) => this.domain.resolveId(student.id) !== studentId),
      );
      this._enrollments.update((enrollments) =>
        enrollments.filter(
          (enrollment) =>
            this.domain.resolveId(enrollment.student?.id, enrollment.studentId) !==
            studentId,
        ),
      );

      return {
        success: true,
        kind: "success",
        message: "Eleve supprime avec succes.",
      };
    } catch (error) {
      console.error("Erreur lors de la suppression de l'eleve", error);
      return {
        success: false,
        kind: "error",
        message:
          "Suppression impossible : cet eleve est probablement lie a des preinscriptions ou paiements.",
      };
    }
  }

  private findPreferredEnrollment(
    enrollments: EnrollmentEntity[],
    studentId: string,
  ): EnrollmentEntity | null {
    const activeEnrollment = this.domain
      .buildLatestEnrollmentIndex(
        enrollments,
        this._activeAnneeScolaire()?.id ?? null,
      )
      .get(studentId);

    if (activeEnrollment) {
      return activeEnrollment;
    }

    return this.domain.buildLatestEnrollmentIndex(enrollments).get(studentId) ?? null;
  }

  private fail(message: string): StoreActionResult {
    this._error.set(message);
    return {
      success: false,
      kind: "error",
      message,
    };
  }
}
