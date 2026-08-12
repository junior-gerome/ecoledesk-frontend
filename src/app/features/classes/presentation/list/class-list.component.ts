import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { ClassListUseCase } from '@features/classes/application/use-cases/class-list.use-case';
import { CLASS_LIST_REPOSITORY } from '@features/classes/domain/repositories/class-list.repository';
import { ClassListRepositoryAdapter } from '@features/classes/infrastructure/class-list.repository';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    TableComponent,
    ButtonComponent,
    PageHeaderComponent,
    PageLayoutComponent,
  ],
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss'],
  providers: [
    ClassListUseCase,
    ClassListRepositoryAdapter,
    {
      provide: CLASS_LIST_REPOSITORY,
      useExisting: ClassListRepositoryAdapter,
    },
  ],
})
export class ClassListComponent implements OnInit {
  readonly useCase = inject(ClassListUseCase);

  readonly classes = this.useCase.classes;
  readonly error = this.useCase.error;
  readonly isLoading = this.useCase.isLoading;

  ngOnInit(): void {
    this.useCase.loadClasses();
  }

  editSubject(id: number): void {
    this.useCase.goToEdit(id);
  }

  deleteClass(id: number): void {
    this.useCase.deleteClass(id);
  }
}
