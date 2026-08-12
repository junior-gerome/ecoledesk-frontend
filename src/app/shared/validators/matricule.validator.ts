import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function matriculeValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) {
      return null;
    }

    return /^[A-Z0-9-]{3,30}$/i.test(value) ? null : { matricule: true };
  };
}
