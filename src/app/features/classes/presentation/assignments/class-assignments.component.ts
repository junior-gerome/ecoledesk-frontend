import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Class } from '@app/features/classes/domain/models';
import { ClassRoomService } from '@app/features/classes/infrastructure/classRoom.service';
import { StaffMemberBasic } from '@app/features/staff/domain/models/staff.model';
import { APP_PERMISSIONS } from '@app/core/constants/permissions.constants';
import { HasPermissionDirective } from '@app/shared/directives/has-permission.directive';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { AlertComponent } from '@app/shared/ui/alert/alert.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';
import { SkeletonComponent } from '@app/shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-class-assignments',
  standalone: true, 
  imports: [CommonModule, FormsModule, TranslateModule, PageLayoutComponent, PageHeaderComponent, CardComponent, AlertComponent, ButtonComponent, SelectComponent, SkeletonComponent, EmptyStateComponent, HasPermissionDirective], templateUrl: './class-assignments.component.html' 
})

export class ClassAssignmentsComponent implements OnInit {
  readonly permissions = APP_PERMISSIONS;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly classes = inject(ClassRoomService);
  readonly classroom = signal<Class | null>(null);
  readonly teachers = signal<StaffMemberBasic[]>([]);
  readonly selectedTeacherId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saved = signal(false);

  get teacherOptions(): SelectOption<number>[] { 
    return this.teachers().filter((teacher) => teacher.id !== undefined).map((teacher) => ({ value: Number(teacher.id), label: `${teacher.firstName} ${teacher.lastName}` })); 
  }

  ngOnInit(): void { 
    void this.load(); 
  }

  async load(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) { this.error.set('classAssignments.invalidClass'); this.loading.set(false); return; }

    this.loading.set(true); this.error.set(null);
    try { const [classroom, teachers] = await Promise.all([this.classes.getById(id).toPromise(), this.classes.getAvailableTeachers().toPromise()]); 
      this.classroom.set(classroom ?? null); 
      this.teachers.set(teachers ?? []); 
      this.selectedTeacherId.set(classroom?.teacher?.id ? Number(classroom.teacher.id) : null); 
    }catch {
       this.error.set('classAssignments.loadError'); 
      } finally {
         this.loading.set(false); 
        }
  }

  selectTeacher(id: number | null): void { 
    this.selectedTeacherId.set(id); this.saved.set(false); 
    this.saveError.set(null); 
  }

  async save(): Promise<void> {
    const id = this.classroom()?.id; if (!id || this.selectedTeacherId() === null) return; this.saving.set(true);
     this.saveError.set(null); this.saved.set(false);
    try { await this.classes.assignTeacher(id, this.selectedTeacherId()!).toPromise(); 
      const current = this.teachers().find((teacher) => Number(teacher.id) === this.selectedTeacherId()); 
      this.classroom.update((value) => value ? { ...value, teacher: current } : value); this.saved.set(true); 
    }
    catch { this.saveError.set('classAssignments.saveError'); 

    } finally { 
      this.saving.set(false); 
    }
  }

  async remove(): Promise<void> {
    const id = this.classroom()?.id; if (!id || !this.classroom()?.teacher || !globalThis.confirm('Retirer lâ€™enseignant de cette classe ?')) return; 
    this.saving.set(true); 
    this.saveError.set(null);
    try { 
      await this.classes.removeTeacher(id).toPromise(); 
      this.classroom.update((value) => value ? { ...value, teacher: undefined } : value); 
      this.selectedTeacherId.set(null); 
      this.saved.set(true); 
    }catch {
       this.saveError.set('classAssignments.removeError'); 
      } finally { 
        this.saving.set(false); 
      }
  }

  back(): void { 
    void this.router.navigate(['/classes']); 
  }
}

