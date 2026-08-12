import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) {
      return null;
    }

    return /^\+?[0-9\s-]{8,20}$/.test(value) ? null : { phone: true };
  };
}
