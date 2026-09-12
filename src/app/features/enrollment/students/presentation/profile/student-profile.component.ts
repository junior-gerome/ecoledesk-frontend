import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { APP_PERMISSIONS } from '@app/core/constants/permissions.constants';
import { HasPermissionDirective } from '@app/shared/directives/has-permission.directive';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { AlertComponent } from '@app/shared/ui/alert/alert.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@app/shared/ui/skeleton/skeleton.component';
import { Payment } from '@app/features/payments/domain/models/payment.model';
import { PaymentService } from '@app/features/payments/infrastructure/payment.service';
import { GradeResponse } from '@app/features/grades/domain/models/GradeResponse.model';
import { GradesService } from '@app/features/grades/infrastructure/grades.service';
import { ClassroomEntity } from '../../domain/models/classroom.entity';
import { EnrollmentEntity } from '../../domain/models/enrollment.entity';
import { SchoolYearEntity } from '../../domain/models/school-year.entity';
import { SectionEntity } from '../../domain/models/section.entity';
import { StudentEntity } from '../../domain/models/student.entity';
import { StudentEnrollmentRepository } from '../../infrastructure/student-enrollment.repository';

type ProfileTab = 'personal' | 'enrollment' | 'parents' | 'payments' | 'grades' | 'history';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageLayoutComponent,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    SkeletonComponent,
    EmptyStateComponent,
    AlertComponent,
    HasPermissionDirective,
  ],
  providers: [StudentEnrollmentRepository, PaymentService, GradesService],
  templateUrl: './student-profile.component.html',
})
export class StudentProfileComponent implements OnInit {
  readonly permissions = APP_PERMISSIONS;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(StudentEnrollmentRepository);
  private readonly paymentService = inject(PaymentService);
  private readonly gradesService = inject(GradesService);

  readonly student = signal<StudentEntity | null>(null);
  readonly enrollments = signal<EnrollmentEntity[]>([]);
  readonly activeSchoolYear = signal<SchoolYearEntity | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedTab = signal<ProfileTab>('personal');
  readonly tabLoading = signal(false);
  readonly tabError = signal<string | null>(null);
  readonly payments = signal<Payment[]>([]);
  readonly grades = signal<GradeResponse[]>([]);
  readonly paymentsLoaded = signal(false);
  readonly gradesLoaded = signal(false);

  readonly studentId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  readonly currentEnrollment = computed(() => {
    const list = this.enrollments();
    if (!list.length) return null;
    const active = list.find(
      (e) => e.statutPreinscription === 'VALIDEE' || e.statutPreinscription === 'INSCRITE',
    );
    return active ?? list[0];
  });
  readonly currentEnrollmentStatus = computed(() => this.currentEnrollment()?.statutPreinscription ?? null);
  readonly currentClass = computed<ClassroomEntity | null>(() => this.currentEnrollment()?.classeRoom ?? null);
  readonly currentSection = computed<SectionEntity | null>(() => this.currentClass()?.section ?? null);
  readonly availableTabs = computed(() => {
    const tabs: ProfileTab[] = ['personal'];
    if (this.enrollments().length) tabs.push('enrollment', 'history');
    if (this.student()?.parent) tabs.push('parents');
    tabs.push('payments', 'grades');
    return tabs;
  });

  ngOnInit(): void {
    void this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    const id = this.studentId();
    if (!id) {
      this.error.set('studentProfile.invalidStudent');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    try {
      const student = await firstValueFrom(this.repository.getStudent(id));
      this.student.set(student);
      const context = await firstValueFrom(forkJoin({
        enrollments: this.repository.getEnrollments(),
        sections: this.repository.getSections(),
        classes: this.repository.getAllClasses(),
        activeSchoolYear: this.repository.getActiveSchoolYear(),
      }));
      const matching = context.enrollments
        .filter((enrollment) => String(enrollment.studentId ?? enrollment.student?.id) === id)
        .map((enrollment) => ({
          ...enrollment,
          classeRoom: enrollment.classeRoom ?? context.classes.find((item) => item.id === enrollment.classeRoomId) ?? null,
        }));
      matching.forEach((enrollment) => {
        if (enrollment.classeRoom && !enrollment.classeRoom.section) {
          enrollment.classeRoom = {
            ...enrollment.classeRoom,
            section: context.sections.find((section) => section.id === enrollment.sectionId) ?? null,
          };
        }
      });
      this.enrollments.set(matching);
      this.activeSchoolYear.set(context.activeSchoolYear);
    } catch {
      this.error.set('studentProfile.loadError');
    } finally {
      this.loading.set(false);
    }
  }

  async selectTab(tab: ProfileTab): Promise<void> {
    this.selectedTab.set(tab);
    this.tabError.set(null);
    if (tab === 'payments' && !this.paymentsLoaded()) await this.loadPayments();
    if (tab === 'grades' && !this.gradesLoaded()) await this.loadGrades();
  }

  async retryTab(): Promise<void> {
    const tab = this.selectedTab();
    if (tab === 'payments') {
      this.paymentsLoaded.set(false);
      await this.loadPayments();
    } else if (tab === 'grades') {
      this.gradesLoaded.set(false);
      await this.loadGrades();
    } else {
      await this.loadProfile();
    }
  }

  async editStudent(): Promise<void> {
    await this.router.navigate(['/students', this.studentId(), 'edit'], {
      queryParamsHandling: 'preserve',
    });
  }

  async backToList(): Promise<void> {
    const queryParams = this.route.snapshot.queryParamMap.get('q');
    await this.router.navigate(['/students'], {
      queryParams: queryParams ? { q: queryParams } : {},
    });
  }

  async openBulletin(): Promise<void> {
    await this.router.navigate(['/grades/bulletin', this.studentId()]);
  }

  tabLabel(tab: ProfileTab): string {
    return `studentProfile.tabs.${tab}`;
  }

  private async loadPayments(): Promise<void> {
    const id = Number(this.studentId());
    if (!id) return;
    this.tabLoading.set(true);
    try {
      this.payments.set(await firstValueFrom(this.paymentService.getPayments({ studentId: id })));
      this.paymentsLoaded.set(true);
    } catch {
      this.tabError.set('studentProfile.paymentsError');
    } finally {
      this.tabLoading.set(false);
    }
  }

  private async loadGrades(): Promise<void> {
    const id = Number(this.studentId());
    if (!id) return;
    this.tabLoading.set(true);
    try {
      this.grades.set(await firstValueFrom(this.gradesService.getGradesByStudent(id)));
      this.gradesLoaded.set(true);
    } catch {
      this.tabError.set('studentProfile.gradesError');
    } finally {
      this.tabLoading.set(false);
    }
  }
}

