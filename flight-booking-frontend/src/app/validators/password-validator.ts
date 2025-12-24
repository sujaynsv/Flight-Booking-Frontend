import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; 
    }

    // Check minimum length (12 characters)
    const hasMinLength = value.length >= 12;

    // Check for lowercase letter
    const hasLowerCase = /[a-z]/.test(value);

    // Check for uppercase letter
    const hasUpperCase = /[A-Z]/.test(value);

    // Check for number
    const hasNumber = /[0-9]/.test(value);

    const passwordValid = hasMinLength && hasLowerCase && hasUpperCase && hasNumber;

    if (!passwordValid) {
      return {
        strongPassword: {
          hasMinLength,
          hasLowerCase,
          hasUpperCase,
          hasNumber
        }
      };
    }

    return null;
  };
}
