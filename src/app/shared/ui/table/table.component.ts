import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @Input() empty = false;
  @Input() emptyMessage = 'Aucune donnée disponible.';
  @Input() emptyTitle = 'Aucune donnée';
  @Input() emptyColspan = 1;
  @Input() tableLabel = 'Tableau de données';
}


