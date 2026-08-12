import { PageHeaderComponent } from './../page-header/page-header.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent {}
