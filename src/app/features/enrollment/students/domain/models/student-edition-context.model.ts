import { EnrollmentEntity } from './enrollment.entity';
import { StudentEntity } from './student.entity';

export interface StudentEditionContext {
  student: StudentEntity;
  enrollment: EnrollmentEntity | null;
}
