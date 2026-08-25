import { SchoolYearEntity } from './school-year.entity';
import { SectionEntity } from './section.entity';

export interface ClassroomEntity {
  id?: string | null;
  nameClasse?: string | null;
  level?: string | null;
  capacity?: number | null;
  section?: SectionEntity | null;
  academicYear?: SchoolYearEntity | null;
  description?: string | null;
}
