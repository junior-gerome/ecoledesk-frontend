import { EnrollmentFormBuilder } from './enrollment-form.builder';
import { createEnrollmentFormValue } from '../testing/students-test.fixtures';

describe('EnrollmentFormBuilder', () => {
  let builder: EnrollmentFormBuilder;

  beforeEach(() => {
    builder = new EnrollmentFormBuilder();
  });

  it('should create an invalid form by default', () => {
    const form = builder.create();

    expect(form.invalid).toBeTrue();
    expect(form.controls.lastNameStudent.hasError('required')).toBeTrue();
    expect(form.controls.classId.hasError('required')).toBeTrue();
    expect(form.controls.TypeParent.hasError('required')).toBeTrue();
  });

  it('should apply the email validator', () => {
    const form = builder.create();

    form.controls.email.setValue('not-an-email');

    expect(form.controls.email.hasError('email')).toBeTrue();
  });

  it('should become valid when all required fields are provided', () => {
    const form = builder.create();

    form.patchValue(createEnrollmentFormValue());

    expect(form.valid).toBeTrue();
  });
});
