/**
 * GradeListPageComponent — Smart component (injecte le store uniquement).
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent } from '@app/shared/ui/select/select.component';
import { SkeletonComponent } from '@app/shared/ui/skeleton/skeleton.component';
import { PaginationComponent } from '@app/shared/ui/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { GradeListFacade } from '../../application/facades/grade-list.facade';
import { GradeListStore } from '../store/grade-list.store';

@Component({
  selector: 'app-grade-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SelectComponent,
    SkeletonComponent,
    PaginationComponent,
  ],
  templateUrl: './grade-list-page.component.html',
  styleUrl: './grade-list-page.component.scss',
  providers: [GradeListFacade, GradeListStore],
})
export class GradeListPageComponent implements OnInit {
  protected readonly store = inject(GradeListStore);

  ngOnInit(): void {
    this.store.initialize();
  }
}
