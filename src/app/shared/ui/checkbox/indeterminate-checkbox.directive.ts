import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
  selector: "input[appIndeterminate]",
  standalone: true,
})
export class IndeterminateCheckboxDirective {
  private indeterminateValue = false;

  @Input() set appIndeterminate(value: boolean | undefined | null) {
    this.indeterminateValue = value === true;
  }

  @HostBinding("indeterminate")
  get isIndeterminate(): boolean {
    return this.indeterminateValue;
  }
}