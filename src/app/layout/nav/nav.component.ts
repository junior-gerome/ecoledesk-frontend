import { Component } from "@angular/core";
import { HeaderComponent } from "@app/layout/header/header.component";

@Component({
  selector: "app-nav",
  standalone: true,
  templateUrl: `./nav.component.html`,
  styleUrls: ["./nav.component.scss"],
  imports: [HeaderComponent],
})
export class NavComponent {

}
