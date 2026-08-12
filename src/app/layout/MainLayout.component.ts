import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '@core/services/loading.service';
import { LayoutService } from '@app/layout/layout.service';
import { SidebarComponent } from '@app/layout/sidebar/sidebar.component';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './MainLayout.component.html',
  styleUrl: './MainLayout.component.scss',
  imports: [SidebarComponent, CommonModule, RouterOutlet, NavComponent, TranslateModule],
})
export class MainLayoutComponent {
  readonly layoutService = inject(LayoutService);
  readonly loadingService = inject(LoadingService);
  readonly sidebarOpenLabel = 'layout.openMenu';
  readonly sidebarCloseLabel = 'layout.closeMenu';
}


