import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { createStudentEntity } from '../../testing/students-test.fixtures';
import { StudentListComponent } from './student-list.component';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    component.students = [createStudentEntity()];
    component.studentClasses = { '1': 'CM1' };
    fixture.detectChanges();
  });

  it('should render the student and class label', () => {
    const textContent = fixture.nativeElement.textContent;

    expect(textContent).toContain('Doe');
    expect(textContent).toContain('Jane');
    expect(textContent).toContain('CM1');
  });

  it('should emit edit and delete events for the selected student', () => {
    spyOn(component.editRequested, 'emit');
    spyOn(component.deleteRequested, 'emit');

    const student = component.students[0];
    component.requestEdit(student);
    component.requestDelete(student);

    expect(component.editRequested.emit).toHaveBeenCalledWith('1');
    expect(component.deleteRequested.emit).toHaveBeenCalledWith('1');
  });

  it('should emit the profile event for the selected student', () => {
    spyOn(component.viewProfile, 'emit');

    const student = component.students[0];
    component.requestViewProfile(student);

    expect(component.viewProfile.emit).toHaveBeenCalledWith('1');
  });
});
