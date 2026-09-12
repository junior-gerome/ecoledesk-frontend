import { EventEmitter } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";
import { Gender } from "@app/enums/gender";
import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";
import { EnrollmentFormBuilder } from "../../infrastructure/enrollment-form.builder";
import { createPaymentEntity } from "../../testing/students-test.fixtures";
import { StudentFormComponent } from "./student-form.component";

function createTranslateStub(): Partial<TranslateService> {
  const translations: Record<string, string> = {
    "studentPage.amountLoading": "Chargement du montant...",
    "studentPage.amountSelectClass":
      "Selectionnez une classe pour voir les frais de preinscription",
  };
  return {
    currentLang: "fr",
    instant: (key: string) => translations[key] ?? key,
    get: (key: string) => of(translations[key] ?? key),
    getParsedResult: (_translations: unknown, key: string) =>
      translations[key] ?? key,
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter(),
  };
}

describe("StudentFormComponent", () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideHttpClient(),
        { provide: TranslateService, useValue: createTranslateStub() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    component.form = new EnrollmentFormBuilder().create();
    component.genderOptions = [
      { label: "Masculin", value: Gender.MASCULIN },
      { label: "Feminin", value: Gender.FEMININ },
    ];
    component.typeParentOptions = [
      { label: "Pere", value: TypeParent.PERE },
      { label: "Mere", value: TypeParent.MERE },
    ];
    component.sectionOptions = [{ label: "Francophone", value: "2" }];
    component.classOptions = [{ label: "CM1", value: "5" }];
    fixture.detectChanges();
  });

  it("should emit form actions", () => {
    spyOn(component.submitted, "emit");
    spyOn(component.cancelled, "emit");

    component.submitForm();
    component.cancel();

    expect(component.submitted.emit).toHaveBeenCalled();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it("should emit section and class changes from the form controls", () => {
    spyOn(component.sectionChanged, "emit");
    spyOn(component.classChanged, "emit");

    component.form.controls.sectionId.setValue("2");
    component.form.controls.classId.setValue("5");

    expect(component.sectionChanged.emit).toHaveBeenCalledWith("2");
    expect(component.classChanged.emit).toHaveBeenCalledWith("5");
  });

  it("should format the displayed amount depending on the loading state", () => {
    component.montantLoading = true;
    expect(component.amountLabel()).toBe("Chargement du montant...");

    component.montantLoading = false;
    component.selectedMontant = null;
    expect(component.amountLabel()).toBe(
      "Selectionnez une classe pour voir les frais de preinscription",
    );

    component.selectedMontant = createPaymentEntity({ count: 25000 });

    expect(component.amountLabel()).toContain("25");
    expect(component.amountLabel()).toContain("FCFA");
    expect(component.amountClassName()).toContain("font-bold");
  });
});
