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

  it('should forward the create path to the pre-enrollment wizard', () => {
    expect(STUDENTS_ROUTES[1].redirectTo).toBe('/pre-enrollments/new');
    expect(STUDENTS_ROUTES[1].pathMatch).toBe('full');
  });

  it('should lazy load the page component for the edit path', async () => {
    const editComponent = await STUDENTS_ROUTES[2].loadComponent?.();

    expect(editComponent).toBe(StudentPageComponent);
  });

  it('should lazy load the profile component for the detail path', async () => {
    const profileComponent = await STUDENTS_ROUTES[3].loadComponent?.();

    expect(profileComponent).toBe(StudentProfileComponent);
  });
});