import { StudentPageComponent } from './presentation/pages/student-page.component';
import { StudentProfileComponent } from './presentation/profile/student-profile.component';
import { STUDENTS_ROUTES } from './students.routes';

describe('STUDENTS_ROUTES', () => {
  it('should expose the expected students paths', () => {
    expect(STUDENTS_ROUTES.map((route) => route.path)).toEqual(['', 'new', ':id/edit', ':id']);
  });

  it('should lazy load the page component for the root path', async () => {
    const component = await STUDENTS_ROUTES[0].loadComponent?.();

    expect(component).toBe(StudentPageComponent);
  });

  it('should lazy load the page component for create and edit paths', async () => {
    const createComponent = await STUDENTS_ROUTES[1].loadComponent?.();
    const editComponent = await STUDENTS_ROUTES[2].loadComponent?.();
    const profileComponent = await STUDENTS_ROUTES[3].loadComponent?.();

    expect(createComponent).toBe(StudentPageComponent);
    expect(editComponent).toBe(StudentPageComponent);
    expect(profileComponent).toBe(StudentProfileComponent);
  });
});

