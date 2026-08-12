import { AbstractControl, FormGroup } from "@angular/forms";

export function markAllAsTouched(control: AbstractControl): void {
  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach(markAllAsTouched);
  }

  control.markAsTouched();
}
